
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Category, OrderType } from '../../types';
import MenuItemCard from '../../components/customer/MenuItemCard';
import AuthModal from '../../components/customer/AuthModal';
import { ShoppingCartIcon, WhatsAppIcon, InstagramIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';

interface HomePageProps {
    onCheckout?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCheckout }) => {
    const { categories, menuItems, session, restaurant, cart, getCartTotal, user } = useApp();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Refs para controle de scroll horizontal
    const highlightsRef = useRef<HTMLDivElement>(null);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const total = getCartTotal(OrderType.DELIVERY);

    const isStoreOpen = useMemo(() => {
        if (!restaurant?.operatingHours) return true;
        try {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const timeMatch = restaurant.operatingHours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
            if (timeMatch) {
                const start = timeMatch[1];
                const end = timeMatch[2];
                if (end < start) return currentTime >= start || currentTime <= end;
                return currentTime >= start && currentTime <= end;
            }
            return true;
        } catch (e) {
            return true;
        }
    }, [restaurant?.operatingHours]);

    const highlights = useMemo(() => menuItems.filter(i => i.isAvailable).slice(0, 10), [menuItems]);

    const handleAddItemClick = () => {
      if(!session) {
        setShowAuthModal(true);
      }
    }

    const scrollHighlights = (direction: 'left' | 'right') => {
        if (highlightsRef.current) {
            const scrollAmount = 250;
            highlightsRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    const isCommonCustomer = user?.role === 'customer';
    
    return (
        <div className="pb-28 bg-white">
            {/* VERSÃO MOBILE: LAYOUT ESTILO IFOOD/MCDONALDS COM IDENTIDADE VISUAL WEB */}
            <div className="md:hidden">
                {/* Banner e Logo Overlap - Ajustado para não cortar a logo */}
                <div className="relative h-44 w-full">
                    <div className="absolute inset-0 overflow-hidden">
                        <img 
                            src={restaurant?.bannerPhotoUrl || 'https://via.placeholder.com/1200x300'} 
                            className="w-full h-full object-cover" 
                            alt="Banner" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                        <div className="p-1 bg-white rounded-full shadow-2xl">
                            <img 
                                src={restaurant?.profilePhotoUrl} 
                                className="w-24 h-24 rounded-full object-cover border-4 border-white" 
                                alt="Logo" 
                            />
                        </div>
                    </div>
                </div>

                {/* Info do Restaurante - Versão Identidade WEB */}
                <div className="mt-14 text-center px-4 space-y-3">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                        {restaurant?.name}
                    </h2>
                    
                    <div className="flex flex-col items-center space-y-3">
                        {/* Status e Horário */}
                        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                             <div className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                             <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                🕒 {restaurant?.operatingHours}
                             </p>
                        </div>

                        {/* Delivery Info */}
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tighter">
                            Padrão • {restaurant?.deliveryTime || '27-37 min'} • <span className="text-green-600">{restaurant?.deliveryFee === 0 ? 'Entrega Grátis' : `Taxa: R$ ${restaurant?.deliveryFee?.toFixed(2)}`}</span>
                        </p>

                        {/* Redes Sociais */}
                        <div className="flex items-center justify-center space-x-4 pt-1">
                            {restaurant?.whatsapp && (
                                <a 
                                    href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g,'')}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-3 bg-white rounded-full shadow-lg border border-gray-50 text-green-500 active:scale-90 transition-all"
                                >
                                    <WhatsAppIcon className="w-5 h-5" />
                                </a>
                            )}
                            {restaurant?.instagramLink && (
                                <a 
                                    href={restaurant.instagramLink} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-3 bg-white rounded-full shadow-lg border border-gray-50 text-[#E6005C] active:scale-90 transition-all"
                                >
                                    <InstagramIcon className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Destaques Horizontais - Com Efeitos WEB e Setas Modernas */}
                <div className="mt-10 relative group">
                    <h3 className="px-5 text-xl font-black text-gray-900 mb-5 tracking-tighter uppercase">✨ Destaques</h3>
                    
                    {/* Container Relativo para Setas */}
                    <div className="relative">
                        {/* Botão Esquerda Neomórfico */}
                        <button 
                            onClick={() => scrollHighlights('left')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-gray-50 active:scale-90 active:shadow-inner transition-all"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        <div 
                            ref={highlightsRef}
                            className="flex overflow-x-auto space-x-5 px-5 no-scrollbar pb-6 scroll-smooth"
                        >
                            {highlights.map(item => (
                                <div key={item.id} className="min-w-[170px] max-w-[170px]">
                                    <MenuItemCard item={item} variant="highlight" onAddClick={handleAddItemClick} />
                                </div>
                            ))}
                        </div>

                        {/* Botão Direita Neomórfico */}
                        <button 
                            onClick={() => scrollHighlights('right')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-[4px_4px_10px_rgba(0,0,0,0.1),-4px_-4px_10px_rgba(255,255,255,0.8)] border border-gray-50 active:scale-90 active:shadow-inner transition-all"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navegação de Categorias Sticky - Estilo Pills WEB */}
                <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 mt-4 shadow-sm">
                    <div className="flex overflow-x-auto space-x-3 px-4 py-4 no-scrollbar">
                        <button 
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2.5 whitespace-nowrap text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${selectedCategory === 'all' ? 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C] border-transparent text-white shadow-lg shadow-orange-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                            🚀 Todos
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-2.5 whitespace-nowrap text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${selectedCategory === cat.id ? 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C] border-transparent text-white shadow-lg shadow-orange-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Itens Vertical - Estilo iFood */}
                <div className="px-5 divide-y divide-gray-100">
                    {categories.filter(c => selectedCategory === 'all' || c.id === selectedCategory).map(cat => {
                        const items = menuItems.filter(i => i.categoryId === cat.id && i.isAvailable);
                        if (items.length === 0) return null;
                        return (
                            <div key={cat.id} className="py-8">
                                <h4 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tighter flex items-center">
                                    <span className="w-1.5 h-6 bg-[#E6005C] rounded-full mr-3"></span>
                                    {cat.name}
                                </h4>
                                <div className="space-y-8">
                                    {items.map(item => (
                                        <MenuItemCard key={item.id} item={item} variant="list" onAddClick={handleAddItemClick} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* VERSÃO DESKTOP: MANTÉM O LAYOUT ORIGINAL (GRID) */}
            <div className="hidden md:block">
                <div className="relative h-64 w-full">
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                            style={{ backgroundImage: `url(${restaurant?.bannerPhotoUrl || 'https://via.placeholder.com/1200x300'})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {restaurant && (
                        <div className="relative bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-6 md:p-8 -mt-20 z-10 border border-gray-100 flex flex-col md:flex-row items-center md:items-end justify-between">
                            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
                                <div className="relative -mt-16 md:-mt-0">
                                    <img src={restaurant.profilePhotoUrl} className="w-28 h-28 rounded-full object-cover border-4 border-white bg-white shadow-2xl" alt="Logo" />
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'} rounded-full border-4 border-white`}></div>
                                </div>
                                <div className="text-center md:text-left space-y-1">
                                    <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{restaurant.name}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">📍 {restaurant.address}</p>
                                    <p className="text-[9px] font-black text-[#E6005C] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">🕒 {restaurant.operatingHours}</p>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0 text-center md:text-right">
                                <p className="text-xs font-black text-green-600 uppercase">
                                    {restaurant.deliveryFee > 0 ? `Taxa Entrega: ${restaurant.deliveryFee.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}` : '🎁 Entrega Grátis'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 space-y-8">
                        <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
                            <button onClick={() => setSelectedCategory('all')} className={`px-6 py-3 text-[10px] font-black uppercase rounded-2xl border ${selectedCategory === 'all' ? 'bg-[#E6005C] border-[#E6005C] text-white' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>✨ Todos</button>
                            {categories.map(category => (
                                <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-6 py-3 text-[10px] font-black uppercase rounded-2xl border ${selectedCategory === category.id ? 'bg-[#E6005C] border-[#E6005C] text-white' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>{category.name}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {menuItems.filter(item => (selectedCategory === 'all' || item.categoryId === selectedCategory) && item.isAvailable).map(item => (
                                <MenuItemCard key={item.id} item={item} onAddClick={handleAddItemClick} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão Carrinho Flutuante (Universal) - CORRIGIDO PARA NAVEGAÇÃO REACT */}
            {isCommonCustomer && cartCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 animate-in slide-in-from-bottom-5">
                    <button 
                        onClick={() => onCheckout ? onCheckout() : (window.location.hash = '#checkout')} 
                        className="w-full text-white rounded-[2rem] p-5 shadow-2xl flex items-center justify-between group bg-gradient-to-r from-[#FF8C00] to-[#E6005C] active:scale-95 transition-all"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="p-3 bg-white/10 rounded-2xl"><ShoppingCartIcon className="w-6 h-6 text-white" /></div>
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#E6005C]">{cartCount}</span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Subtotal Pedido</p>
                                <p className="text-xl font-black text-white tracking-tighter leading-none">{total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                            </div>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400">FINALIZAR</span>
                    </button>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default HomePage;
