
import React, { useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardPage from './DashboardPage';
import AnalyticsPage from './AnalyticsPage';
import MenuManagementPage from './MenuManagementPage';
import SettingsPage from './SettingsPage';
import AdminProfilePage from './AdminProfilePage';
import TableManagementPage from './TableManagementPage';
import StaffManagementPage from './StaffManagementPage';
import InventoryPage from './InventoryPage';
import AccountsPayablePage from './AccountsPayablePage';
import CashFlowPage from './CashFlowPage';
import OrderMenuPage from './OrderMenuPage';
import CheckoutPage from '../customer/CheckoutPage';
import OrdersPage from '../customer/OrdersPage';
import { supabase } from '../../supabaseClient';
import { useApp } from '../../contexts/AppContext';
import { WhatsAppIcon, LogOutIcon } from '../../components/icons';

export type AdminPage = 'dashboard' | 'analytics' | 'menu' | 'settings' | 'profile' | 'tables' | 'staff' | 'inventory' | 'finance' | 'cashflow' | 'order_menu' | 'checkout' | 'my_orders';

const AdminView: React.FC = () => {
    const { user, isSubscriptionActive, restaurant, logout } = useApp();

    const isAdmin = user?.role === 'admin' || user?.role === 'admin_restaurante';
    const isCook = !!user?.isCook;
    const isCashier = !!user?.isCashier;
    const isWaiter = !!user?.isWaiter;

    const cannotAccessProduction = isWaiter && !isCook && !isCashier && !isAdmin;

    const getInitialPage = (): AdminPage => {
        if (!user) return 'profile';
        if (isAdmin) return 'analytics';
        if (isCook || isCashier) return 'dashboard';
        if (isWaiter) return 'order_menu';
        return 'profile';
    };

    const [currentPage, setCurrentPage] = useState<AdminPage>(getInitialPage());
    const [isSalesMode, setIsSalesMode] = useState(isWaiter || isCashier);

    const handleSetPage = (page: AdminPage, salesMode: boolean = false) => {
        if (page === 'dashboard' && cannotAccessProduction) {
            setCurrentPage('profile');
            return;
        }
        setIsSalesMode(salesMode);
        setCurrentPage(page);
    };

    const activeModeBadge = useMemo(() => {
        if (!user || !isSubscriptionActive) return null;
        let label = "GESTOR";
        let color = "bg-gray-900";

        if (isAdmin) { label = "MODO GESTOR"; color = "bg-gray-900"; }
        else if (isCook) { label = "MODO COZINHEIRO"; color = "bg-orange-600"; }
        else if (isCashier) { label = "MODO CAIXA"; color = "bg-[#E6005C]"; }
        else if (isWaiter) { label = "MODO GARÇOM"; color = "bg-blue-600"; }

        return (
            <div className={`fixed top-4 right-4 z-[60] ${color} text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl animate-in fade-in slide-in-from-top-2 duration-700 hidden lg:block`}>
                {label}
            </div>
        );
    }, [user, isAdmin, isCook, isCashier, isWaiter, isSubscriptionActive]);

    const renderPage = () => {
        const canAccessDashboard = isAdmin || isCook || isCashier;

        switch (currentPage) {
            case 'dashboard':
                return canAccessDashboard ? <DashboardPage /> : <AdminProfilePage />;
            case 'analytics':
                return isAdmin ? <AnalyticsPage /> : <AdminProfilePage />;
            case 'menu':
                return isAdmin ? <MenuManagementPage /> : <AdminProfilePage />;
            case 'order_menu':
                return <OrderMenuPage isSalesTerminal={isSalesMode} setPage={(p) => handleSetPage(p, isSalesMode)} />;
            case 'checkout':
                return (
                    <CheckoutPage
                        setPage={(p, forcedSalesMode) => handleSetPage(p as any, forcedSalesMode !== undefined ? forcedSalesMode : isSalesMode)}
                        isSalesTerminal={isSalesMode}
                    />
                );
            case 'my_orders':
                return <OrdersPage />;
            case 'tables':
                return (isAdmin || isCashier || isWaiter) ? <TableManagementPage /> : <AdminProfilePage />;
            case 'staff':
                return isAdmin ? <StaffManagementPage /> : <AdminProfilePage />;
            case 'inventory':
                return isAdmin ? <InventoryPage /> : <AdminProfilePage />;
            case 'finance':
                return isAdmin ? <AccountsPayablePage /> : <AdminProfilePage />;
            case 'cashflow':
                return (isAdmin || isCashier) ? <CashFlowPage /> : <AdminProfilePage />;
            case 'settings':
                return isAdmin ? <SettingsPage /> : <AdminProfilePage />;
            case 'profile':
                return <AdminProfilePage />;
            default:
                return <AdminProfilePage />;
        }
    };

    const whatsappRenovacao = `https://wa.me/5584999828713?text=Ol%C3%A1%2C%20meu%20acesso%20ao%20Sabor%20Express%20360%20expirou.%20Gostaria%20de%20renovar%20a%20assinatura%20do%20restaurante%20${encodeURIComponent(restaurant?.name || '')}`;

    return (
        <div className={`min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans overflow-x-hidden relative ${!isSubscriptionActive ? 'grayscale' : ''}`}>
            {/* BLOQUEIO DE ASSINATURA EXPIRADA */}
            {!isSubscriptionActive && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-6">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 overflow-hidden border border-gray-100 relative">

                        {/* Mensagem e Bloqueio */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Acesso Expirado</h2>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
                                    Escolha um plano abaixo para liberar o acesso imediato ao painel de gestão do
                                    <span className="text-red-500 ml-1">{restaurant?.name}</span>.
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="w-fit flex items-center space-x-2 text-gray-400 font-black hover:text-gray-600 transition-colors text-[10px] uppercase tracking-widest mt-4"
                            >
                                <LogOutIcon className="w-4 h-4" />
                                <span>Sair do Sistema</span>
                            </button>
                        </div>

                        {/* Planos */}
                        <div className="space-y-4 flex flex-col justify-center">
                            {/* Plano Mensal */}
                            <button
                                onClick={async () => {
                                    try {
                                        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
                                            body: {
                                                planType: 'monthly',
                                                restaurantId: restaurant?.id
                                            }
                                        });
                                        if (error) throw error;
                                        if (data?.url) window.location.href = data.url;
                                    } catch (e: any) {
                                        alert('Erro ao iniciar pagamento: ' + e.message);
                                    }
                                }}
                                className="group relative w-full bg-gray-50 hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 rounded-3xl p-6 transition-all duration-300 text-left"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-orange-500">Plano Mensal</span>
                                    <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">30 Dias</span>
                                </div>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-black text-gray-900">R$ 59,99</span>
                                    <span className="text-sm font-bold text-gray-400">/mês</span>
                                </div>
                            </button>

                            {/* Plano Anual */}
                            <button
                                onClick={async () => {
                                    try {
                                        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
                                            body: {
                                                planType: 'yearly',
                                                restaurantId: restaurant?.id
                                            }
                                        });
                                        if (error) throw error;
                                        if (data?.url) window.location.href = data.url;
                                    } catch (e: any) {
                                        alert('Erro ao iniciar pagamento: ' + e.message);
                                    }
                                }}
                                className="group relative w-full bg-gradient-to-br from-gray-900 to-gray-800 hover:from-orange-600 hover:to-red-600 rounded-3xl p-6 transition-all duration-300 text-left text-white shadow-xl transform hover:scale-[1.02]"
                            >
                                <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wide">
                                    Mais Popular
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-white/80">Plano Anual</span>
                                    <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-sm">365 Dias</span>
                                </div>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-black text-white">R$ 449,99</span>
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-white/80">/ano</span>
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Interface Admin (Bloqueada via pointer-events se inativo) */}
            <div className={`flex flex-col lg:flex-row w-full ${!isSubscriptionActive ? 'pointer-events-none' : ''}`}>
                {activeModeBadge}
                <AdminSidebar currentPage={currentPage} currentSalesMode={isSalesMode} setPage={handleSetPage} />

                <main className="flex-1 lg:ml-72 min-h-screen w-full">
                    <div className="w-full max-w-[1400px] mx-auto px-4 py-8 md:px-12 md:py-16">
                        <div key={`${currentPage}-${isSalesMode}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {renderPage()}
                        </div>
                    </div>
                </main>

                <div className="h-28 lg:hidden"></div>
            </div>
        </div>
    );
};

export default AdminView;
