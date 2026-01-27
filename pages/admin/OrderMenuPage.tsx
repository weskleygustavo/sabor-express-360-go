
import React from 'react';
import HomePage from '../customer/HomePage';
import { useApp } from '../../contexts/AppContext';
import { ShoppingCartIcon } from '../../components/icons';
import { AdminPage } from './AdminView';

interface OrderMenuPageProps {
    setPage?: (page: AdminPage) => void;
    isSalesTerminal?: boolean;
}

const OrderMenuPage: React.FC<OrderMenuPageProps> = ({ setPage, isSalesTerminal = false }) => {
    const { cart, getCartTotal } = useApp();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const total = getCartTotal('delivery' as any); 

    const handleCheckout = () => {
        if (setPage) setPage('checkout');
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden min-h-[80vh] relative">
            <div className="p-8 border-b border-gray-50 text-left flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                        {isSalesTerminal ? 'Terminal de Vendas Loja' : 'Fazer meu Pedido Pessoal'}
                    </h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                        {isSalesTerminal ? 'Selecione os itens para o cliente e finalize.' : 'Pedido de consumo próprio (Apenas Delivery).'}
                    </p>
                </div>
                {isSalesTerminal && (
                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">MODO ATENDIMENTO</span>
                )}
            </div>
            
            <div className="pb-32">
                <HomePage onCheckout={handleCheckout} />
            </div>

            {/* Botão Carrinho Flutuante (Terminal Admin/Staff) */}
            {cartCount > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <button 
                        onClick={handleCheckout}
                        className={`w-full text-white rounded-[2rem] p-6 shadow-2xl flex items-center justify-between hover:scale-105 active:scale-95 transition-all group ${isSalesTerminal ? 'bg-gray-900' : 'bg-[#E6005C]'}`}
                    >
                        <div className="flex items-center space-x-5">
                            <div className="relative">
                                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-[#FF8C00] transition-colors">
                                    <ShoppingCartIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900">
                                    {cartCount}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total acumulado</p>
                                <p className="text-2xl font-black text-white tracking-tighter leading-none">
                                    {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400">PROSSEGUIR</span>
                            <div className="p-2 bg-white/10 rounded-full group-hover:translate-x-2 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderMenuPage;