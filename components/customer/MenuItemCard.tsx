
import React, { useMemo } from 'react';
import { MenuItem } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface MenuItemCardProps {
    item: MenuItem;
    onAddClick: () => void;
    variant?: 'grid' | 'highlight' | 'list';
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddClick, variant = 'grid' }) => {
    const { addToCart, session, cart } = useApp();

    // Calcula a quantidade atual deste item no carrinho
    const quantityInCart = useMemo(() => {
        const cartItem = cart.find(i => i.id === item.id);
        return cartItem ? cartItem.quantity : 0;
    }, [cart, item.id]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (session) {
            addToCart(item);
        } else {
            onAddClick();
        }
    };

    // Componente do Selo de Quantidade
    const QuantityBadge = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
        if (quantityInCart === 0) return null;
        
        const sizeClasses = {
            sm: "w-6 h-6 text-[10px] bottom-1 right-1 border-2",
            md: "w-8 h-8 text-xs bottom-2 right-2 border-2",
            lg: "w-10 h-10 text-sm bottom-3 right-3 border-[3px]"
        };

        return (
            <div 
                key={quantityInCart} // Key dinâmica força re-render/animação no clique
                className={`absolute ${sizeClasses[size]} bg-gradient-to-br from-[#FF8C00] to-[#E6005C] text-white font-black rounded-full flex items-center justify-center border-white shadow-lg animate-pop z-10`}
            >
                {quantityInCart}
            </div>
        );
    };

    // Variante Destaque (Horizontal Scroll)
    if (variant === 'highlight') {
        return (
            <div 
                onClick={handleAddToCart}
                className="bg-white rounded-3xl overflow-hidden flex flex-col h-full active:scale-95 transition-all text-left shadow-sm border border-gray-100 p-2"
            >
                <div className="relative h-36 w-full bg-gray-50 rounded-2xl overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] font-black text-gray-900 tracking-tighter leading-none">
                            {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <QuantityBadge size="sm" />
                </div>
                <div className="mt-3 px-1 pb-2 space-y-1">
                    <h3 className="text-[13px] font-black text-gray-900 line-clamp-2 leading-tight uppercase tracking-tighter">{item.name}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mais pedido 🔥</p>
                </div>
            </div>
        );
    }

    // Variante Lista (iFood Style - Vertical)
    if (variant === 'list') {
        return (
            <div 
                onClick={handleAddToCart}
                className="flex items-start justify-between py-2 group active:bg-gray-50 transition-colors text-left"
            >
                <div className="flex-1 pr-5 space-y-2">
                    <h3 className="text-base font-black text-gray-900 leading-tight uppercase tracking-tighter">{item.name}</h3>
                    <p className="text-[11px] text-gray-400 font-bold line-clamp-2 leading-normal uppercase tracking-tight">
                        {item.description}
                    </p>
                    <div className="pt-1">
                        <p className="text-base font-black text-[#E6005C] tracking-tighter">
                            {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        {/* Ajuste estético solicitado: linha rosa curta e clara abaixo do preço */}
                        <div className="h-[2px] w-16 bg-[#E6005C]/30 rounded-full mt-2"></div>
                    </div>
                </div>
                <div className="relative w-28 h-28 shrink-0 rounded-[1.5rem] overflow-hidden shadow-xl shadow-gray-100 border-2 border-white">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <QuantityBadge size="sm" />
                </div>
            </div>
        );
    }

    // Variante Grid (Padrão Desktop/Original)
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 group">
            <div className="relative h-48 w-full overflow-hidden">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm font-black text-gray-900 tracking-tighter leading-none">
                        {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <QuantityBadge size="md" />
            </div>
            <div className="p-6 flex flex-col flex-grow text-left space-y-3">
                <div className="flex-grow">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight leading-none mb-2 group-hover:text-[#E6005C] transition-colors uppercase">{item.name}</h3>
                    <p className="text-gray-400 text-[11px] font-bold leading-relaxed line-clamp-2 uppercase tracking-tighter">{item.description}</p>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white text-[11px] font-black py-4 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-xl transition-all uppercase tracking-widest active:scale-95 mt-2"
                >
                    {quantityInCart > 0 ? `Adicionar mais (${quantityInCart})` : 'Adicionar ao Carrinho'}
                </button>
            </div>
            <style>{`
                @keyframes pop {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop {
                    animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>
        </div>
    );
};

export default MenuItemCard;
