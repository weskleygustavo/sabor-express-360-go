
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { User, MenuItem, CartItem, Order, Category, Restaurant, OrderStatus, PaymentMethod, Table, OrderType, InventoryEntry, Expense, ExpenseCategory, CashierSession } from '../types';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
    authLoading: boolean;
    session: Session | null;
    user: User | null;
    route: string;
    setRoute: (route: string) => void;
    logout: () => Promise<void>;
    updateUserProfile: (profile: Partial<User>, photoFile?: File) => Promise<void>;
    deleteAccount: () => Promise<void>;
    refreshData: () => Promise<void>;
    appError: string | null;
    
    restaurant: Restaurant | null;
    isSubscriptionActive: boolean;
    fetchRestaurantBySlug: (slug: string) => Promise<Restaurant | null>;
    updateRestaurant: (data: Partial<Restaurant>, profilePhotoFile?: File, bannerPhotoFile?: File) => Promise<void>;
    
    categories: Category[];
    addCategory: (name: string) => Promise<void>;
    updateCategory: (id: string, name: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    menuItems: MenuItem[];
    updateMenuItem: (item: Partial<MenuItem>, photoFile?: File) => Promise<void>;
    addMenuItem: (item: Omit<MenuItem, 'id' | 'imageUrl' | 'restaurant_id'>, photoFile: File) => Promise<void>;

    inventoryEntries: InventoryEntry[];
    addInventoryEntry: (data: { menu_item_id: string; quantity: number; unit_cost: number }) => Promise<void>;

    expenseCategories: ExpenseCategory[];
    addExpenseCategory: (name: string) => Promise<void>;
    deleteExpenseCategory: (id: string) => Promise<void>;
    expenses: Expense[];
    addExpense: (data: { category_id: string; amount: number; due_date: string }) => Promise<void>;
    payExpense: (id: string, paymentDate: string) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;

    cart: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    getCartTotal: (orderType: OrderType) => number;

    orders: Order[];
    placeOrder: (options: { paymentMethod: PaymentMethod; orderType: OrderType; tableId?: string; changeFor?: number; waiterName?: string; notes?: string; }) => Promise<void>;
    updateOrderStatus: (orderId: string | number, status: OrderStatus) => Promise<void>;
    acknowledgeTableOrders: (tableId: string) => Promise<void>;
    closeTableOrders: (tableId: string, finalPaymentMethod: PaymentMethod) => Promise<void>;
    cancelOrder: (orderId: string | number) => Promise<void>;

    tables: Table[];
    addTable: (name: string, number: number) => Promise<void>;
    updateTable: (id: string, name: string, number: number) => Promise<void>;
    deleteTable: (id: string) => Promise<void>;

    currentCashierSession: CashierSession | null;
    allCashierSessions: CashierSession[];
    openCashierSession: (startingBalance: number) => Promise<void>;
    closeCashierSession: (summary: Partial<CashierSession>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authLoading, setAuthLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [route, setRoute] = useState('/');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [inventoryEntries, setInventoryEntries] = useState<InventoryEntry[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [appError, setAppError] = useState<string | null>(null);
    const [currentCashierSession, setCurrentCashierSession] = useState<CashierSession | null>(null);
    const [allCashierSessions, setAllCashierSessions] = useState<CashierSession[]>([]);

    const isSubscriptionActive = useMemo(() => {
        if (!restaurant) return true; // Se não carregou, não bloqueia ainda
        const now = new Date();
        
        // Verifica Trial
        if (restaurant.trial_ends_at) {
            const trialEnd = new Date(restaurant.trial_ends_at);
            if (now < trialEnd) return true;
        }

        // Verifica Assinatura Ativa (Renovação Manual)
        if (restaurant.subscription_active_until) {
            const subEnd = new Date(restaurant.subscription_active_until);
            if (now < subEnd) return true;
        }

        return false;
    }, [restaurant]);

    const uploadFileAndGetUrl = async (file: File, bucket: string, path: string): Promise<string> => {
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { 
            upsert: true,
            contentType: file.type 
        });
        if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    };

    const mapRestaurant = (data: any): Restaurant => ({
        id: data.id,
        name: data.name,
        slug: data.slug,
        address: data.address,
        profilePhotoUrl: data.profile_photo_url, 
        bannerPhotoUrl: data.banner_photo_url,
        operatingHours: data.operating_hours, 
        deliveryFee: Number(data.delivery_fee) || 0,
        whatsapp: data.whatsapp,
        instagramLink: data.instagram_link, 
        serviceCharge: Number(data.service_charge) || 0,
        deliveryTime: data.delivery_time || '30-45 min',
        trial_ends_at: data.trial_ends_at,
        subscription_active_until: data.subscription_active_until
    });

    const fetchRestaurantBySlug = async (slug: string): Promise<Restaurant | null> => {
        try {
            const { data, error } = await supabase.from('restaurant').select('*').eq('slug', slug).single();
            if (error) return null;
            return mapRestaurant(data);
        } catch (e) { return null; }
    };

    const fetchRestaurantData = useCallback(async (restaurantId: string) => {
        try {
            const { data, error } = await supabase.from('restaurant').select('*').eq('id', restaurantId).single();
            if (error) throw error;
            if (data) {
                setRestaurant(mapRestaurant(data));
            }
        } catch (e) { console.error("Erro restaurante:", e); }
    }, []);

    const fetchAllData = useCallback(async (currentSession: Session) => {
        if (!currentSession) return;
        try {
            let { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
            if (pError) throw pError;

            setUser({
                id: profile.id,
                name: profile.name,
                email: currentSession.user.email || '',
                role: profile.role,
                restaurantId: profile.restaurant_id,
                photoUrl: profile.photo_url, 
                isWaiter: !!profile.is_waiter,
                isCashier: !!profile.is_cashier,
                isCook: !!profile.is_cook,
                whatsapp: profile.whatsapp,
                address: profile.address
            });

            const rid = profile.restaurant_id;
            const isGlobalAdmin = profile.role === 'admin';

            if (!isGlobalAdmin && !rid) {
                console.warn("Sabor Express: Usuário sem restaurant_id vinculado.");
                return;
            }

            if (rid) await fetchRestaurantData(rid);

            const filter = (q: any) => isGlobalAdmin ? q : q.eq('restaurant_id', rid);

            const [cats, tbls, menu, inv, expCats, exps, sess] = await Promise.all([
                filter(supabase.from('categories').select('*')).order('name'),
                filter(supabase.from('tables').select('*')).order('number'),
                filter(supabase.from('menu_items').select('*')),
                filter(supabase.from('inventory_entries').select('*, menu_items(*)')).order('created_at', { ascending: false }),
                filter(supabase.from('expense_categories').select('*')).order('name'),
                filter(supabase.from('expenses').select('*, expense_categories(*)')).order('due_date', { ascending: false }),
                filter(supabase.from('cashier_sessions').select('*')).order('opened_at', { ascending: false })
            ]);

            setCategories(cats.data || []);
            setTables(tbls.data || []);
            setMenuItems(menu.data?.map(i => ({...i, imageUrl: i.image_url, categoryId: i.category_id, isAvailable: i.is_available, trackInventory: i.track_inventory || false, restaurant_id: i.restaurant_id})) || []);
            setInventoryEntries(inv.data?.map(e => ({...e, created_at: new Date(e.created_at), menu_item: e.menu_items})) || []);
            setExpenseCategories(expCats.data || []);
            setExpenses(exps.data?.map(e => ({...e, category: e.expense_categories})) || []);
            setAllCashierSessions(sess.data || []);
            setCurrentCashierSession(sess.data?.find(s => s.status === 'open') || null);

            let oQuery = supabase.from('orders').select('*, restaurant(name), profiles!user_id(id, name, photo_url, role), order_items(*, menu_items(*)), tables(*)');
            if (!isGlobalAdmin) oQuery = oQuery.eq('restaurant_id', rid);
            
            const { data: oData, error: oError } = await oQuery.order('created_at', { ascending: false });

            if (oError) throw oError;

            if (oData) {
                setOrders(oData.map((o: any) => ({
                    id: o.id, userId: o.user_id, restaurant_id: o.restaurant_id, createdAt: new Date(o.created_at), status: o.status, total: o.total,
                    paymentMethod: o.payment_method, changeFor: o.change_for, orderType: o.order_type, tableId: o.table_id,
                    table: o.tables, waiterName: o.waiter_name, notes: o.notes, restaurantName: o.restaurant?.name,
                    customer: o.profiles ? { id: o.profiles.id, name: o.profiles.name, photoUrl: o.profiles.photo_url, role: o.profiles.role, email: '' } : undefined,
                    items: (o.order_items || []).map((oi: any) => {
                        const m = oi.menu_items || { name: 'Item Removido', price: oi.price_at_time_of_order || 0 };
                        return { id: m.id || oi.menu_item_id, name: m.name, price: m.price, cost: m.cost || 0, imageUrl: m.image_url || '', quantity: oi.quantity };
                    })
                })));
            }
        } catch (error: any) { 
            console.error("Erro crítico no carregamento:", error);
            setAppError(error.message);
        }
    }, [fetchRestaurantData]);

    const refreshData = async () => { if (session) await fetchAllData(session); };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            
            // Detecta se o usuário entrou pelo link de recuperação de senha
            if (event === 'PASSWORD_RECOVERY') {
                setRoute('/update-password');
            }
            
            if (session) fetchAllData(session);
            else { 
                setUser(null); 
                setOrders([]); 
                setRestaurant(null); 
                // Apenas redefine a rota se não estivermos em fluxo de recuperação
                if (event !== 'PASSWORD_RECOVERY') {
                    setRoute(window.location.pathname); 
                }
            }
            setAuthLoading(false);
        });
        return () => subscription.unsubscribe();
    }, [fetchAllData]);

    const logout = async () => { await supabase.auth.signOut(); };

    // PEDIDOS
    const placeOrder = async (options: any) => {
        if (!user?.restaurantId || cart.length === 0) return;
        const { data: order, error: oError } = await supabase.from('orders').insert({
            user_id: user.id,
            restaurant_id: user.restaurantId,
            total: getCartTotal(options.orderType),
            status: OrderStatus.RECEIVED,
            payment_method: options.paymentMethod,
            order_type: options.order_type,
            table_id: options.tableId || null,
            change_for: options.change_for || null,
            waiter_name: options.waiterName || (user.role !== 'customer' ? user.name : null),
            notes: options.notes || null
        }).select().single();
        if (oError) throw oError;
        const { error: itemsError } = await supabase.from('order_items').insert(cart.map(i => ({
            order_id: order.id,
            menu_item_id: i.id,
            quantity: i.quantity,
            price_at_time_of_order: i.price
        })));
        if (itemsError) throw itemsError;
        setCart([]);
        await refreshData();
    };

    const updateOrderStatus = async (id: any, status: OrderStatus) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const closeTableOrders = async (tableId: string, finalPaymentMethod: PaymentMethod) => {
        const { error } = await supabase.from('orders')
            .update({ status: OrderStatus.DELIVERED, payment_method: finalPaymentMethod })
            .eq('table_id', tableId)
            .neq('status', OrderStatus.DELIVERED)
            .neq('status', OrderStatus.CANCELED);
        if (error) throw error;
        await refreshData();
    };

    // CATEGORIAS DE MENU
    const addCategory = async (name: string) => {
        if (!user?.restaurantId) return;
        const { error } = await supabase.from('categories').insert({ name, restaurant_id: user.restaurantId });
        if (error) throw error;
        await refreshData();
    };

    const updateCategory = async (id: string, name: string) => {
        const { error } = await supabase.from('categories').update({ name }).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    // FINANCEIRO - CATEGORIAS DE DESPESA
    const addExpenseCategory = async (name: string) => {
        if (!user?.restaurantId) {
            console.error("Erro: Usuário não tem restaurant_id vinculado.");
            return;
        }
        const { error } = await supabase.from('expense_categories').insert({ 
            name, 
            restaurant_id: user.restaurantId 
        });
        if (error) {
            console.error("Erro ao cadastrar categoria de despesa:", error.message);
            throw error;
        }
        await refreshData();
    };

    const deleteExpenseCategory = async (id: string) => {
        const { error } = await supabase.from('expense_categories').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const addExpense = async (data: any) => {
        if (!user?.restaurantId) return;
        const { error } = await supabase.from('expenses').insert({ ...data, restaurant_id: user.restaurantId });
        if (error) throw error;
        await refreshData();
    };

    const payExpense = async (id: string, date: string) => {
        const { error } = await supabase.from('expenses').update({ payment_date: date }).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const deleteExpense = async (id: string) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    // MENU ITEMS
    const addMenuItem = async (item: any, file: File) => {
        if (!user?.restaurantId) return;
        const path = `${user.restaurantId}/menu_${Date.now()}`;
        const url = await uploadFileAndGetUrl(file, 'menu_photos', path);
        const { error } = await supabase.from('menu_items').insert({ ...item, image_url: url, restaurant_id: user.restaurantId });
        if (error) throw error;
        await refreshData();
    };

    const updateMenuItem = async (item: any, file?: File) => {
        const data = { ...item };
        if (file && user?.restaurantId) {
            data.image_url = await uploadFileAndGetUrl(file, 'menu_photos', `${user.restaurantId}/menu_${item.id}`);
        }
        delete data.id; delete data.restaurant_id; delete data.imageUrl; delete data.categoryId;
        const { error } = await supabase.from('menu_items').update({
            ...data,
            image_url: data.image_url || item.imageUrl,
            category_id: item.categoryId,
            is_available: item.isAvailable,
            track_inventory: item.track_inventory
        }).eq('id', item.id);
        if (error) throw error;
        await refreshData();
    };

    // MESAS
    const addTable = async (name: string, number: number) => {
        if (!user?.restaurantId) return;
        const { error } = await supabase.from('tables').insert({ name, number, restaurant_id: user.restaurantId });
        if (error) throw error;
        await refreshData();
    };

    const updateTable = async (id: string, name: string, number: number) => {
        const { error } = await supabase.from('tables').update({ name, number }).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const deleteTable = async (id: string) => {
        const { error } = await supabase.from('tables').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    // ESTOQUE
    const addInventoryEntry = async (data: any) => {
        if (!user?.restaurantId) return;
        const { error = null } = await supabase.from('inventory_entries').insert({ ...data, restaurant_id: user.restaurantId });
        if (error) throw error;
        await refreshData();
    };

    // CAIXA
    const openCashierSession = async (startingBalance: number) => {
        if (!user?.restaurantId) return;
        const { error } = await supabase.from('cashier_sessions').insert({
            restaurant_id: user.restaurantId,
            user_id: user.id,
            operator_name: user.name,
            starting_balance: startingBalance,
            status: 'open'
        });
        if (error) throw error;
        await refreshData();
    };

    const closeCashierSession = async (summary: any) => {
        if (!currentCashierSession) return;
        const { error } = await supabase.from('cashier_sessions').update({
            ...summary,
            status: 'closed',
            closed_at: new Date().toISOString()
        }).eq('id', currentCashierSession.id);
        if (error) throw error;
        await refreshData();
    };

    // CARRINHO
    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const ext = prev.find(i => i.id === item.id);
            if (ext) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => {
            const ext = prev.find(i => i.id === id);
            if (ext && ext.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
            return prev.filter(i => i.id !== id);
        });
    };

    const getCartTotal = (type: OrderType) => {
        const sub = cart.reduce((t, i) => t + i.price * i.quantity, 0);
        return type === OrderType.DELIVERY ? sub + (restaurant?.deliveryFee || 0) : sub;
    };

    const cancelOrder = async (id: any) => {
        const { error } = await supabase.from('orders').update({ status: OrderStatus.CANCELED }).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const acknowledgeTableOrders = async (tableId: string) => {
        const tableOrders = orders.filter(o => o.tableId === tableId && o.status === OrderStatus.OUT_FOR_DELIVERY);
        for (const o of tableOrders) {
            const newNotes = `${o.notes || ''} [SERVIDO]`.trim();
            await supabase.from('orders').update({ notes: newNotes }).eq('id', o.id);
        }
        await refreshData();
    };

    const deleteAccount = async () => {
        if (!user) return;
        const isAdmin = user.role === 'admin_restaurante';
        const rid = user.restaurantId;

        try {
            if (isAdmin && rid) {
                // Remove vínculo de outros perfis para evitar erro de FK ao deletar restaurante
                await supabase.from('profiles').update({ restaurant_id: null }).eq('restaurant_id', rid);
                // Deleta o restaurante (cascateia para pedidos, itens, mesas, etc)
                const { error: resError } = await supabase.from('restaurant').delete().eq('id', rid);
                if (resError) throw resError;
            }

            // Deleta o perfil do usuário
            const { error: profError } = await supabase.from('profiles').delete().eq('id', user.id);
            if (profError) throw profError;

            // Nota: Excluir o usuário do auth.users requer chave de serviço/admin, 
            // então limpamos os dados e deslogamos.
            await logout();
            window.location.href = '/';
        } catch (error: any) {
            console.error("Erro ao deletar conta:", error.message);
            throw error;
        }
    };

    return (
        <AppContext.Provider value={{ 
            authLoading, session, user, route, setRoute, logout, refreshData, appError,
            restaurant, isSubscriptionActive, fetchRestaurantBySlug, categories, menuItems, cart, orders, tables,
            inventoryEntries, expenseCategories, expenses, currentCashierSession, allCashierSessions,
            addToCart, removeFromCart, clearCart: () => setCart([]), getCartTotal,
            placeOrder, updateOrderStatus, acknowledgeTableOrders, closeTableOrders, cancelOrder,
            addCategory, updateCategory, deleteCategory,
            addMenuItem, updateMenuItem,
            addTable, updateTable, deleteTable,
            addInventoryEntry, addExpenseCategory, deleteExpenseCategory, addExpense, payExpense, deleteExpense,
            openCashierSession, closeCashierSession,
            deleteAccount,
            updateUserProfile: async (p, f) => {
                const data: any = { ...p };
                if (f && user) data.photo_url = await uploadFileAndGetUrl(f, 'profile_photos', `${user.id}/av_${Date.now()}`);
                const { error } = await supabase.from('profiles').update(data).eq('id', user?.id);
                if (error) throw error;
                await refreshData();
            },
            updateRestaurant: async (d, p, b) => {
                if (!user?.restaurantId) return;

                // MAPEAMENTO MANUAL: Converte camelCase (Frontend) para snake_case (SQL)
                const dbPayload: any = {
                    name: d.name,
                    slug: d.slug,
                    address: d.address,
                    operating_hours: d.operatingHours,
                    delivery_fee: d.deliveryFee,
                    whatsapp: d.whatsapp,
                    instagram_link: d.instagramLink,
                    service_charge: d.serviceCharge,
                    delivery_time: d.deliveryTime
                };

                Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);

                if (p) dbPayload.profile_photo_url = await uploadFileAndGetUrl(p, 'restaurant_photos', `${user.restaurantId}/logo`);
                if (b) dbPayload.banner_photo_url = await uploadFileAndGetUrl(b, 'restaurant_photos', `${user.restaurantId}/banner`);

                const { error } = await supabase.from('restaurant').update(dbPayload).eq('id', user.restaurantId);
                if (error) throw error;
                await refreshData();
            }
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const c = useContext(AppContext);
    if (!c) throw new Error('useApp error');
    return c;
};
