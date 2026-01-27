-- ============================================================================
-- SCRIPT MESTRE CONSOLIDADO - SABOR EXPRESS 360 (Versão Final Multi-Tenant)
-- ============================================================================

-- 1. CONFIGURAÇÕES INICIAIS E EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUMERADOS (ENUMS)
-- Garante que todos os tipos usados no app existam
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'staff', 'admin_restaurante');
    CREATE TYPE public.order_status AS ENUM ('Recebido', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado');
    CREATE TYPE public.payment_method AS ENUM ('PIX', 'Cartão', 'Dinheiro');
    CREATE TYPE public.order_type AS ENUM ('delivery', 'dine_in');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE RESTAURANTES (A Base do Multi-Tenant)
-- Inclui colunas dos scripts 19, 26 (slug) e 27 (trial)
CREATE TABLE IF NOT EXISTS public.restaurant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- URL amigável
    owner_id UUID REFERENCES auth.users(id),
    address TEXT,
    profile_photo_url TEXT,
    banner_photo_url TEXT,
    operating_hours TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    service_charge DECIMAL(5, 2) DEFAULT 10.00,
    whatsapp TEXT,
    instagram_link TEXT,
    delivery_time TEXT DEFAULT '30-45 min',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_active_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE PERFIS (PROFILES)
-- Consolidada com roles, flags de staff e vínculo com restaurante
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE SET NULL, -- Vínculo do funcionário/dono
  name TEXT,
  email TEXT,
  role user_role DEFAULT 'customer'::user_role,
  photo_url TEXT,
  address JSONB,
  whatsapp TEXT,
  -- Flags de permissão operacional
  is_waiter BOOLEAN DEFAULT false,
  is_cashier BOOLEAN DEFAULT false,
  is_cook BOOLEAN DEFAULT false
);

COMMENT ON TABLE public.profiles IS 'Dados públicos dos usuários e permissões de staff.';

-- 5. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE ITENS DO CARDÁPIO
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    track_inventory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE MESAS
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE PEDIDOS (ORDERS)
-- Mantendo ID numérico sequencial para facilitar visualização na cozinha/comanda
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'Recebido'::order_status NOT NULL,
    payment_method payment_method,
    order_type order_type NOT NULL DEFAULT 'delivery'::order_type,
    change_for DECIMAL(10, 2),
    waiter_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time_of_order DECIMAL(10, 2) NOT NULL
);

-- 10. TABELAS DE FINANÇAS E ESTOQUE
-- Categorias de Despesas
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Despesas
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entrada de Estoque
CREATE TABLE IF NOT EXISTS public.inventory_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessões de Caixa (Abertura/Fechamento)
CREATE TABLE IF NOT EXISTS public.cashier_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurant(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    operator_name TEXT,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    starting_balance DECIMAL(10, 2) DEFAULT 0,
    total_sales_cash DECIMAL(10, 2) DEFAULT 0,
    total_sales_card DECIMAL(10, 2) DEFAULT 0,
    total_sales_pix DECIMAL(10, 2) DEFAULT 0,
    total_expenses DECIMAL(10, 2) DEFAULT 0,
    final_balance DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'open'
);

-- ============================================================================
-- 11. FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para criar perfil automaticamente ao cadastrar usuário no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$;

-- Trigger para disparar a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função Auxiliar para pegar o ID do Restaurante do Usuário Logado (Vital para Multi-tenant)
CREATE OR REPLACE FUNCTION public.get_my_restaurant_id()
RETURNS UUID AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Função para promover Admin de Restaurante (Bypass RLS)
CREATE OR REPLACE FUNCTION public.create_admin_restaurant(target_user_id UUID, target_res_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET role = 'admin_restaurante',
        restaurant_id = target_res_id
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashier_sessions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: RESTAURANTE
-- Público pode ver (para cardápio digital funcionar pelo Slug)
CREATE POLICY "Leitura pública de restaurantes" ON public.restaurant FOR SELECT USING (true);
-- Dono pode gerenciar seu próprio restaurante
CREATE POLICY "Dono gerencia restaurante" ON public.restaurant FOR ALL TO authenticated USING (auth.uid() = owner_id);
-- Qualquer usuário autenticado pode criar um restaurante (setup inicial)
CREATE POLICY "Qualquer um cria restaurante" ON public.restaurant FOR INSERT TO authenticated WITH CHECK (true);

-- POLÍTICAS: PERFIS (PROFILES)
-- Usuário vê e edita o próprio perfil
CREATE POLICY "Usuário gerencia próprio perfil" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Staff pode ver colegas do mesmo restaurante
CREATE POLICY "Staff vê colegas" ON public.profiles FOR SELECT USING (restaurant_id = public.get_my_restaurant_id());

-- POLÍTICAS MULTI-TENANT (CATEGORIAS, MENU, MESAS, ETC)
-- O padrão aqui é: Só acesso se o item pertencer ao meu restaurante (via get_my_restaurant_id)

-- Categories
CREATE POLICY "Tenant Isolation Categories" ON public.categories FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
-- Leitura pública de categorias (para o cardápio)
CREATE POLICY "Leitura pública categorias" ON public.categories FOR SELECT USING (true);

-- Menu Items
CREATE POLICY "Tenant Isolation Menu" ON public.menu_items FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
-- Leitura pública do menu
CREATE POLICY "Leitura pública menu" ON public.menu_items FOR SELECT USING (true);

-- Tables
CREATE POLICY "Tenant Isolation Tables" ON public.tables FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id());

-- Orders
CREATE POLICY "Tenant Isolation Orders" ON public.orders FOR ALL 
USING (restaurant_id = public.get_my_restaurant_id() OR auth.uid() = user_id);

-- Order Items (Herda permissão do pedido)
CREATE POLICY "Tenant Isolation Order Items" ON public.order_items FOR ALL 
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.restaurant_id = public.get_my_restaurant_id() OR orders.user_id = auth.uid())));

-- Financeiro e Estoque
CREATE POLICY "Tenant Isolation Exp Categories" ON public.expense_categories FOR ALL USING (restaurant_id = public.get_my_restaurant_id());
CREATE POLICY "Tenant Isolation Expenses" ON public.expenses FOR ALL USING (restaurant_id = public.get_my_restaurant_id());
CREATE POLICY "Tenant Isolation Inventory" ON public.inventory_entries FOR ALL USING (restaurant_id = public.get_my_restaurant_id());
CREATE POLICY "Tenant Isolation Cashier" ON public.cashier_sessions FOR ALL USING (restaurant_id = public.get_my_restaurant_id());

-- ============================================================================
-- 13. STORAGE (BUCKETS E POLICIES)
-- ============================================================================

-- Criação dos Buckets (se não existirem)
INSERT INTO storage.buckets (id, name, public) VALUES ('profile_photos', 'profile_photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('menu_photos', 'menu_photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant_photos', 'restaurant_photos', true) ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
-- Leitura Pública para todos os buckets
CREATE POLICY "Visualização Pública Storage" ON storage.objects FOR SELECT TO public USING (bucket_id IN ('restaurant_photos', 'menu_photos', 'profile_photos'));

-- Escrita/Modificação apenas para usuários autenticados
CREATE POLICY "Acesso Total Autenticados Storage" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id IN ('restaurant_photos', 'menu_photos', 'profile_photos')) 
WITH CHECK (bucket_id IN ('restaurant_photos', 'menu_photos', 'profile_photos'));

-- ============================================================================
-- 14. REALTIME
-- ============================================================================
-- Habilita atualizações em tempo real para a cozinha e painel
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- FIM DO SCRIPT