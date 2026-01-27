
import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Order, OrderStatus, OrderType } from '../../types';
import OrderStatusTracker from '../../components/customer/OrderStatusTracker';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const { cancelOrder, updateOrderStatus } = useApp();
    
    // Detecta se é uma venda comercial (terminal) buscando a tag no início da string
    const isCommercial = order.notes?.startsWith('[VENDA_LOJA]');
    // Limpeza visual: Remove a tag [VENDA_LOJA] se existir
    const cleanNotes = order.notes?.replace('[VENDA_LOJA]', '').trim();

    const canCancel = order.status === OrderStatus.RECEIVED;
    const canConfirmReceipt = order.status === OrderStatus.OUT_FOR_DELIVERY;

    const statusStyles: Record<string, { bg: string, text: string, label: string }> = {
        [OrderStatus.RECEIVED]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Aguardando Aprovação' },
        [OrderStatus.PREPARING]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Em Produção' },
        [OrderStatus.OUT_FOR_DELIVERY]: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Saiu para Entrega' },
        [OrderStatus.DELIVERED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
        [OrderStatus.CANCELED]: { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelado' },
    };

    const style = statusStyles[order.status] || { bg: 'bg-gray-100', text: 'text-gray-500', label: order.status };

    return (
        <div className={`bg-white rounded-[2.5rem] shadow-sm p-8 mb-8 border-2 transition-all duration-500 ${isCommercial ? 'border-orange-200 bg-orange-50/5' : 'border-gray-100'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Pedido #{order.id}</h3>
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest ${style.bg} ${style.text}`}>
                            {style.label}
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {isCommercial ? (
                        <p className="text-[9px] font-black text-orange-600 bg-orange-100 px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 inline-block shadow-sm">
                            🛒 VENDA LOJA (DELIVERY)
                        </p>
                    ) : (
                        <p className="text-[9px] font-black text-[#E6005C] bg-red-50 px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 inline-block shadow-sm">
                            🍔 MEU LANCHE (PESSOAL)
                        </p>
                    )}
                </div>
            </div>
            
            <div className="mb-8 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50">
                <h4 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 text-center">Itens do meu Pedido</h4>
                <ul className="space-y-3">
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-700 flex items-center">
                                <span className="w-5 h-5 flex items-center justify-center bg-white border border-gray-100 rounded-md text-[10px] mr-3 font-black text-orange-500">{item.quantity}</span>
                                {item.name}
                            </span>
                            <span className="text-gray-900 font-black">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {cleanNotes && (
                 <div className="mb-8 bg-orange-50/40 p-5 rounded-2xl border border-orange-100/50">
                    <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Informações Adicionais</p>
                    <p className="text-[11px] font-bold text-gray-600 leading-tight italic whitespace-pre-wrap">{cleanNotes}</p>
                 </div>
            )}

            {order.status !== OrderStatus.CANCELED && order.status !== OrderStatus.DELIVERED && (
                <div className="my-10 px-4">
                    <OrderStatusTracker currentStatus={order.status} />
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                    <button 
                        onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                        className="flex-1 bg-green-500 text-white text-[11px] font-black py-4 px-6 rounded-2xl shadow-lg shadow-green-100 hover:scale-[1.02] transition-all uppercase tracking-widest">
                        Confirmar Entrega / Recebimento
                    </button>
                )}
                {canCancel && (
                    <button 
                        onClick={() => cancelOrder(order.id)}
                        className="flex-1 border-2 border-red-50 text-red-400 text-[11px] font-black py-4 px-6 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all uppercase tracking-widest active:scale-95">
                        Cancelar Pedido
                    </button>
                )}
            </div>
        </div>
    );
};

const OrdersPage: React.FC = () => {
    const { orders, user } = useApp();

    const isAdmin = user?.role === 'admin';
    const isStaff = !!user?.isWaiter || !!user?.isCashier || !!user?.isCook;

    const myOrders = useMemo(() => {
        if (!user) return [];

        return orders.filter(o => {
            // REGRA ADMIN: Conforme solicitado, Admin tem acesso a tudo, visualiza todos os pedidos do sistema aqui.
            if (isAdmin) return true;

            const isCommercial = o.notes?.startsWith('[VENDA_LOJA]');
            const isOwner = o.userId === user.id;

            // REGRA STAFF (Garçom/Caixa/Cozinha): Vê APENAS o que ele mesmo pediu (Owner) e que NÃO seja comercial (Lanches).
            // Isso remove pedidos de terceiros e vendas do terminal da visão dele.
            if (isStaff) {
                return isOwner && !isCommercial;
            }

            // REGRA CLIENTE: Vê apenas seus próprios pedidos (que por padrão nunca são [VENDA_LOJA]).
            return isOwner;
        });
    }, [orders, user, isAdmin, isStaff]);

    const activeOrders = myOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED);
    const completedOrders = myOrders.filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELED);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
            <div className="text-left mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                    {isAdmin ? 'Monitoramento Global' : 'Meus Pedidos Pessoais'}
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                    {isAdmin 
                        ? 'Visão geral de todos os pedidos realizados no sistema.' 
                        : 'Acompanhe seus lanches de consumo próprio e histórico pessoal.'}
                </p>
            </div>

            {activeOrders.length > 0 ? (
                activeOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-gray-100 mb-12">
                    <span className="text-5xl mb-6 block">🥡</span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Nenhum pedido ativo</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                        Seus pedidos de consumo pessoal aparecerão aqui.
                    </p>
                </div>
            )}
            
            {completedOrders.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-lg font-black text-gray-400 mb-8 uppercase tracking-widest flex items-center">
                         <span className="h-px flex-grow bg-gray-100 mr-4"></span> Histórico de Concluídos
                    </h2>
                    <div className="opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        {completedOrders.slice(0, 15).map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
