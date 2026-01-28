
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

console.log("Stripe Webhook Function Initialized")

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature header", { status: 400 })
  }

  // Pegando segredos do ambiente
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
  const webhookSigningSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!stripeSecretKey || !webhookSigningSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing environment variables")
    return new Response("Server configuration error", { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
  })

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const body = await req.text()

    // Validando a assinatura do webhook (CRÍTICO para segurança)
    let event
    try {
      // Usando AWAIT e constructEventAsync para evitar erro de Crypto síncrono no Edge Runtime
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSigningSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // IDs dos preços que criamos (Isso deve bater com o que foi criado)
    // IDs dos preços que criamos (Isso deve bater com o que foi criado)
    const PLAN_MENSAL_PRICE_ID = Deno.env.get("PRICE_ID_MONTHLY") ?? "price_1SuKckCFZo3qHy85O8CUbfMF"
    const PLAN_ANUAL_PRICE_ID = Deno.env.get("PRICE_ID_YEARLY") ?? "price_1SuKclCFZo3qHy85xQGw54Z9"

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const restaurantId = session.client_reference_id

      console.log(`Processing checkout for restaurant: ${restaurantId}`)

      if (!restaurantId) {
        console.warn("No client_reference_id found in session")
        return new Response("No client_reference_id", { status: 400 })
      }

      // Descobrindo qual produto foi comprado
      // Em checkouts simples (mode=payment), geralmente olhamos line_items, 
      // mas o webhook padrão pode não trazer expandido. 
      // Se tivermos apenas um item por checkout, podemos tentar inferir pelo amount ou metadata.
      // Melhor ainda: recuperar a sessão expandida ou confiar que o checkout foi montado com o price ID correto.

      let daysToAdd = 0

      // Tentativa de recuperar linhas para ver o Price ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id

      if (priceId === PLAN_MENSAL_PRICE_ID) {
        daysToAdd = 30
      } else if (priceId === PLAN_ANUAL_PRICE_ID) {
        daysToAdd = 365
      } else {
        console.warn(`Unknown Price ID: ${priceId}`)
        return new Response("Unknown Product", { status: 400 })
      }

      // Buscar dados atuais do restaurante para lógica cumulativa
      const { data: restaurant, error: fetchError } = await supabase
        .from("restaurant")
        .select("subscription_active_until")
        .eq("id", restaurantId)
        .single()

      if (fetchError) {
        console.error("Error fetching restaurant:", fetchError)
        // Se falhar ao buscar, assumimos "agora" para não travar, mas logamos erro
      }

      // Calculando nova data (Lógica Cumulativa)
      const now = new Date()
      let baseDate = now

      // Se já tem assinatura ativa no futuro, somamos a partir dela
      if (restaurant?.subscription_active_until) {
        const currentActiveUntil = new Date(restaurant.subscription_active_until)
        if (currentActiveUntil > now) {
          baseDate = currentActiveUntil
        }
      }

      const futureDate = new Date(baseDate)
      futureDate.setDate(baseDate.getDate() + daysToAdd) // Adiciona os dias somando à base

      console.log(`Adding ${daysToAdd} days to restaurant ${restaurantId}. Base date: ${baseDate.toISOString()}, New date: ${futureDate.toISOString()}`)

      // Atualizando Supabase
      const { error } = await supabase
        .from("restaurant")
        .update({
          subscription_active_until: futureDate.toISOString()
        })
        .eq("id", restaurantId)

      if (error) {
        console.error("Error updating Supabase:", error)
        return new Response("Database update failed", { status: 500 })
      }

      console.log("Success updating subscription")
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error(`Error processing request: ${err.message}`)
    return new Response(`Server Error: ${err.message}`, { status: 500 })
  }
})
