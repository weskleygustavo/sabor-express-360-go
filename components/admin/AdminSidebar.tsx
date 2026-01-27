
import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { AdminPage } from '../../pages/admin/AdminView';
import { HomeIcon, BarChartIcon, UtensilsIcon, SettingsIcon, LogOutIcon, UserIcon, TableIcon, UsersIcon, PackageCheckIcon, WalletIcon, ReceiptIcon, ShoppingCartIcon, ListOrderedIcon } from '../icons';

interface AdminHeaderProps {
    currentPage: AdminPage;
    currentSalesMode: boolean;
    setPage: (page: AdminPage, salesMode?: boolean) => void;
}

const NavLink: React.FC<{ 
    page: AdminPage, 
    currentPage: AdminPage, 
    currentSalesMode: boolean,
    setPage: (page: AdminPage, salesMode?: boolean) => void, 
    icon: React.ReactNode, 
    label: string, 
    isSalesModeButton: boolean,
    isMobile?: boolean,
    badgeCount?: number
}> = ({ page, currentPage, currentSalesMode, setPage, icon, label, isSalesModeButton, isMobile, badgeCount }) => {
    
    const isOrderMenuPage = page === 'order_menu' || page === 'checkout';
    const isActive = currentPage === page && (!isOrderMenuPage || currentSalesMode === isSalesModeButton);
    const hasBadge = typeof badgeCount === 'number' && badgeCount > 0;
    
    if (isMobile) {
        return (
            <button
                onClick={() => setPage(page, isSalesModeButton)}
                className={`flex flex-col items-center justify-center min-w-[75px] px-2 py-2.5 rounded-2xl transition-all duration-300 relative ${
                    isActive 
                    ? 'bg-[#E6005C] text-white shadow-lg shadow-pink-100 scale-105' 
                    : 'text-gray-400 active:scale-95'
                }`}
            >
                <div className="relative">
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
                        className: `w-5 h-5 mb-1 ${isActive ? 'text-white' : 'opacity-70'}` 
                    })}
                    {hasBadge && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white border-2 border-white">
                            {badgeCount}
                        </span>
                    )}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter whitespace-nowrap leading-none ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {label.split(' ')[0]} {label.split(' ')[1] || ''}
                </span>
            </button>
        );
    }

    // Estilo Sidebar Desktop
    const activeClass = isActive 
        ? 'bg-[#E6005C] text-white shadow-lg shadow-pink-100 scale-[1.02]' 
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50';

    return (
        <button
            onClick={() => setPage(page, isSalesModeButton)}
            className={`flex items-center transition-all duration-200 whitespace-nowrap outline-none relative w-full space-x-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-tight mb-1 ${activeClass}`}
        >
            <span className={`${isActive ? 'text-white' : 'opacity-50'}`}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
            </span>
            <span className="truncate">{label}</span>
            
            {hasBadge && (
                <span className="absolute top-1/2 -translate-y-1/2 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white border-2 border-white">
                    {badgeCount}
                </span>
            )}
        </button>
    );
};

const AdminSidebar: React.FC<AdminHeaderProps> = ({ currentPage, currentSalesMode, setPage }) => {
    const { logout, restaurant, user, cart } = useApp();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Lógica para determinar o rótulo do modo de operação
    const modeLabel = useMemo(() => {
        if (!user) return 'ACESSANDO...';
        if (user.role === 'admin' || user.role === 'admin_restaurante') return 'PAINEL GESTOR';
        if (user.isCook) return 'MODO COZINHEIRO';
        if (user.isCashier) return 'MODO CAIXA';
        if (user.isWaiter) return 'MODO GARÇOM';
        return 'MODO COLABORADOR';
    }, [user]);

    const menuItems = useMemo(() => {
        if (!user) return [];
        const isManager = user.role === 'admin' || user.role === 'admin_restaurante';
        const isCashier = !!user.isCashier;
        const isCook = !!user.isCook;
        const isWaiter = !!user.isWaiter;

        const all = [
            { id: 'dashboard', label: 'COZINHA KDS', icon: <HomeIcon />, show: isManager || isCook || isCashier },
            { id: 'analytics', label: 'ANÁLISES BI', icon: <BarChartIcon />, show: isManager },
            { id: 'order_menu', label: 'VENDAS LOJA', icon: <ShoppingCartIcon />, show: isManager || isCashier || isWaiter, salesMode: true, badge: currentSalesMode ? cartCount : 0 },
            { id: 'order_menu', label: 'MEU LANCHE', icon: <ShoppingCartIcon />, show: true, salesMode: false, badge: !currentSalesMode ? cartCount : 0 },
            { id: 'my_orders', label: 'MEUS PEDIDOS', icon: <ListOrderedIcon />, show: true },
            { id: 'cashflow', label: 'CAIXA', icon: <ReceiptIcon />, show: isManager || isCashier },
            { id: 'finance', label: 'FINANCEIRO', icon: <WalletIcon />, show: isManager },
            { id: 'inventory', label: 'ESTOQUE', icon: <PackageCheckIcon />, show: isManager },
            { id: 'menu', label: 'MENU', icon: <UtensilsIcon />, show: isManager },
            { id: 'tables', label: 'MESAS', icon: <TableIcon />, show: isManager || isCashier || isWaiter },
            { id: 'staff', label: 'EQUIPE', icon: <UsersIcon />, show: isManager },
            { id: 'settings', label: 'MEU RESTAURANTE', icon: <SettingsIcon />, show: isManager },
            { id: 'profile', label: 'PERFIL', icon: <UserIcon />, show: true },
        ];

        return all.filter(item => item.show);
    }, [user, cartCount, currentSalesMode]);

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 shadow-xl z-50">
                <div className="p-8 pb-10 flex flex-col items-center text-center cursor-pointer" onClick={() => setPage('dashboard')}>
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF8C00] to-[#E6005C] rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-pink-100 mb-4 transform hover:rotate-6 transition-all">
                        {restaurant?.name?.[0] || 'S'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-xl leading-none tracking-tighter uppercase mb-1">
                            {restaurant?.name || 'Sabor Express'}
                        </span>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                            {modeLabel}
                        </span>
                    </div>
                </div>

                <nav className="flex-grow px-4 overflow-y-auto no-scrollbar space-y-1">
                    {menuItems.map((item, idx) => (
                        <NavLink 
                            key={`${item.id}-${idx}`} 
                            page={item.id as AdminPage} 
                            currentPage={currentPage} 
                            currentSalesMode={currentSalesMode}
                            setPage={setPage} 
                            icon={item.icon} 
                            label={item.label} 
                            isSalesModeButton={!!item.salesMode} 
                            badgeCount={item.badge} 
                        />
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center justify-center space-x-3 px-5 py-4 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </aside>

            {/* MOBILE HEADER */}
            <header className="lg:hidden bg-white/95 backdrop-blur-md sticky top-0 z-50 w-full border-b border-gray-100 shadow-sm flex items-center justify-between px-6 h-16">
                 <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#FF8C00] to-[#E6005C] rounded-xl flex items-center justify-center text-white font-black shadow-sm">
                        {restaurant?.name?.[0] || 'S'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-sm tracking-tighter uppercase leading-none">{restaurant?.name}</span>
                        <span className="text-[8px] font-black text-[#E6005C] uppercase tracking-widest mt-0.5">{modeLabel}</span>
                    </div>
                 </div>
                 <button onClick={logout} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl active:bg-red-50 active:text-red-500 transition-colors">
                    <LogOutIcon className="w-5 h-5" />
                 </button>
            </header>

             {/* MOBILE BOTTOM NAV */}
             <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
                <div className="flex items-center px-4 py-2 overflow-x-auto no-scrollbar gap-2">
                    {menuItems.map((item, idx) => (
                        <NavLink 
                            key={`${item.id}-${idx}-mob`} 
                            isMobile 
                            page={item.id as AdminPage} 
                            currentPage={currentPage} 
                            currentSalesMode={currentSalesMode}
                            setPage={setPage} 
                            icon={item.icon} 
                            label={item.label} 
                            isSalesModeButton={!!item.salesMode} 
                            badgeCount={item.badge} 
                        />
                    ))}
                </div>
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </>
    );
};

export default AdminSidebar;
