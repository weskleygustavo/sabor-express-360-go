
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { CustomerPage } from '../../pages/customer/CustomerView';
import { HomeIcon, ListOrderedIcon, UserIcon, ShoppingCartIcon, LogOutIcon } from '../icons';

interface CustomerHeaderProps {
    currentPage: CustomerPage;
    setPage: (page: CustomerPage) => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ currentPage, setPage }) => {
    const { user, logout, cart, restaurant } = useApp();
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const isStaff = user?.isWaiter || user?.isCashier || user?.isCook || user?.role === 'admin';

    const NavLink: React.FC<{ page: CustomerPage, icon: React.ReactNode, label: string }> = ({ page, icon, label }) => {
        const isActive = currentPage === page;
        return (
            <button
                onClick={() => setPage(page)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isActive 
                    ? 'bg-red-50 text-[#E6005C] shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setPage('home')}>
                             <img src={restaurant?.profilePhotoUrl} alt="Logo" className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" />
                             <span className="font-black text-lg text-gray-900 tracking-tighter hidden sm:inline">{restaurant?.name || 'Sabor Express'}</span>
                        </div>
                        <nav className="hidden lg:flex items-center space-x-1">
                            <NavLink page="home" icon={<HomeIcon />} label="Cardápio" />
                            <NavLink page="orders" icon={<ListOrderedIcon />} label="Pedidos" />
                            <NavLink page="profile" icon={<UserIcon />} label="Meu Perfil" />
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setPage('checkout')} 
                            className={`relative p-3 rounded-2xl transition-all active:scale-90 ${currentPage === 'checkout' ? 'bg-[#E6005C] text-white shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                        >
                           <ShoppingCartIcon className="w-5 h-5" />
                           {cartItemCount > 0 && (
                               <span className={`absolute -top-1 -right-1 block h-5 w-5 rounded-full border-2 border-white text-[10px] font-black flex items-center justify-center ${currentPage === 'checkout' ? 'bg-[#FF8C00] text-white' : 'bg-[#E6005C] text-white'}`}>
                                   {cartItemCount}
                               </span>
                           )}
                        </button>
                        
                        {/* Box de Usuário/Staff conforme o print */}
                        <div className="flex items-center space-x-3 bg-gray-50 pl-4 pr-1.5 py-1.5 rounded-2xl border border-gray-100">
                             <span className="hidden sm:inline text-[10px] font-black text-gray-700 uppercase tracking-tighter">
                                {user?.name} {user?.isWaiter && !user.isCashier && <span className="text-[#E6005C] ml-1">GARÇOM</span>}
                             </span>
                             <button onClick={logout} className="p-2 bg-white rounded-xl text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                                <LogOutIcon className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
             {/* Mobile Navigation */}
             <div className="lg:hidden border-t bg-white px-2 py-2">
                <nav className="flex items-center justify-between">
                    <NavLink page="home" icon={<HomeIcon />} label="Início" />
                    <NavLink page="orders" icon={<ListOrderedIcon />} label="Pedidos" />
                    <NavLink page="profile" icon={<UserIcon />} label="Perfil" />
                </nav>
            </div>
        </header>
    );
};

export default CustomerHeader;
