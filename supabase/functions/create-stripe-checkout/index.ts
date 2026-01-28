
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

console.log("create-stripe-checkout Function Initialized")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response("Unauthorized", { status: 401, headers: corsHeaders })
        }

        // Recebe 'planType' ('monthly' | 'yearly') em vez de priceId direto
        const { planType, restaurantId } = await req.json()

        if (!planType || !restaurantId) {
            return new Response("Missing planType or restaurantId", { status: 400, headers: corsHeaders })
        }

        const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
        if (!stripeSecretKey) {
            return new Response("Server configuration error: Missing Stripe Key", { status: 500, headers: corsHeaders })
        }

        // BUSCA OS PREÇOS DAS VARIÁVEIS DE AMBIENTE (SECRETS)
        // O usuário deve configurar PRICE_ID_MONTHLY e PRICE_ID_YEARLY no painel
        const priceIdMonthly = Deno.env.get("PRICE_ID_MONTHLY")
        const priceIdYearly = Deno.env.get("PRICE_ID_YEARLY")

        if (!priceIdMonthly || !priceIdYearly) {
            return new Response("Server configuration error: Missing Price IDs", { status: 500, headers: corsHeaders })
        }

        let priceId;
        if (planType === 'monthly') priceId = priceIdMonthly;
        else if (planType === 'yearly') priceId = priceIdYearly;
        else return new Response("Invalid planType", { status: 400, headers: corsHeaders })

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: "2022-11-15",
            httpClient: Stripe.createFetchHttpClient(),
        })

        const origin = req.headers.get('origin') || 'http://localhost:5173'

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            client_reference_id: restaurantId,
            success_url: `${origin}/admin?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/admin`,
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200
            }
        )

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        })
    }
})
