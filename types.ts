
export enum UserRole {
    CUSTOMER = 'customer',
    ADMIN = 'admin',
    ADMIN_RESTAURANTE = 'admin_restaurante',
    STAFF = 'staff'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin' | 'admin_restaurante' | 'staff';
    restaurantId?: string; // Vínculo Multi-tenant
    photoUrl?: string;
    isWaiter?: boolean;
    isCashier?: boolean;
    isCook?: boolean;
    address?: {
        street: string;
        neighborhood: string;
        number: string;
        city: string;
        state: string;
        referencePoint?: string;
    };
    whatsapp?: string;
}

export interface CashierSession {
    id: string;
    user_id: string;
    restaurant_id: string;
    operator_name: string;
    opened_at: Date;
    closed_at?: Date;
    starting_balance: number;
    total_sales_cash: number;
    total_sales_card: number;
    total_sales_pix: number;
    total_expenses: number;
    final_balance: number;
    status: 'open' | 'closed';
}

export interface Category {
    id: string;
    restaurant_id: string;
    name: string;
}

export interface MenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    imageUrl: string;
    categoryId: string;
    isAvailable: boolean;
    trackInventory: boolean;
}

export interface InventoryEntry {
    id: string;
    restaurant_id: string;
    menu_item_id: string;
    quantity: number;
    unit_cost: number;
    created_at: Date;
    menu_item?: MenuItem;
}

export interface ExpenseCategory {
    id: string;
    restaurant_id: string;
    name: string;
}

export interface Expense {
    id: string;
    restaurant_id: string;
    category_id: string;
    category?: ExpenseCategory;
    amount: number;
    due_date: string;
    payment_date?: string;
    created_at?: string;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export enum OrderStatus {
    RECEIVED = 'Recebido',
    PREPARING = 'Em Preparo',
    OUT_FOR_DELIVERY = 'Saiu para Entrega',
    DELIVERED = 'Entregue',
    CANCELED = 'Cancelado',
    COMPLETED = 'Entregue'
}

export enum PaymentMethod {
    PIX = 'PIX',
    CARD = 'Cartão',
    CASH = 'Dinheiro'
}

export enum OrderType {
    DELIVERY = 'delivery',
    DINE_IN = 'dine_in'
}

export interface Table {
    id: string;
    restaurant_id: string;
    name: string;
    number: number;
}

export interface Order {
    id: string | number;
    userId: string;
    restaurant_id: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    createdAt: Date;
    paymentMethod: PaymentMethod;
    changeFor?: number;
    customer?: User;
    orderType: OrderType;
    tableId?: string;
    table?: Table;
    waiterName?: string;
    notes?: string;
}

export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    address: string;
    profilePhotoUrl: string;
    bannerPhotoUrl: string;
    operatingHours: string;
    deliveryFee: number;
    whatsapp: string;
    instagramLink: string;
    serviceCharge: number;
    deliveryTime: string;
    trial_ends_at?: string;
    subscription_active_until?: string;
}
