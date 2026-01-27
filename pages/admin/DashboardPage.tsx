
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Order, OrderStatus, User, OrderType, PaymentMethod } from '../../types';
import PrintableReceipt from '../../components/admin/PrintableReceipt';
import { PrinterIcon, SearchIcon, XIcon, TableIcon, BikeIcon } from '../../components/icons';

const AdminOrderCard: React.FC<{ order: Order, customer?: User, onPrint: () => void }> = ({ order, customer, onPrint }) => {
    const { updateOrderStatus, user } = useApp();
    const [isLoading, setIsLoading] = useState(false);

    const displayNotes = order.notes?.replace('[VENDA_LOJA]', '').trim();

    const isAdminGlobal = user?.role === 'admin';
    const isAdminRes = user?.role === 'admin_restaurante';
    const isAdmin = isAdminGlobal || isAdminRes;
    const isCashier = !!user?.isCashier;
    const isCook = !!user?.isCook; 
    const isWaiter = !!user?.isWaiter;

    const isStaffMember = !!customer?.isWaiter || !!customer?.isCashier || !!customer?.isCook || customer?.role === 'admin' || customer?.role === 'admin_restaurante';
    const isCommercial = order.notes?.startsWith('[VENDA_LOJA]');
    const isStaffMeal = isStaffMember && !isCommercial;

    const isPureCashier = isCashier && !isAdmin && !isCook;

    const canChangeStatus = isAdmin || isCashier || isCook;

    const needsPickup = (isWaiter || isCashier || isAdmin) && order.orderType === OrderType.DINE_IN && order.status === OrderStatus.OUT_FOR_DELIVERY;

    const getNextStatus = (): OrderStatus | null => {
        if (!canChangeStatus) return null;

        switch (order.status) {
            case OrderStatus.RECEIVED: 
                return isPureCashier ? null : OrderStatus.PREPARING;
            case OrderStatus.PREPARING: 
                return isPureCashier ? null : OrderStatus.OUT_FOR_DELIVERY;
            case OrderStatus.OUT_FOR_DELIVERY: 
                if (isAdmin || isCashier) {
                     return order.orderType === OrderType.DELIVERY ? OrderStatus.DELIVERED : null;
                }
                return null;
            default: return null;
        }
    };
    
    const nextStatus = getNextStatus();
    
    const getNextStatusText = (): string => {
        if (isStaffMeal && order.status === OrderStatus.OUT_FOR_DELIVERY) {
            return "Entregar Lanche Equipe 🍔";
        }

        if (!nextStatus && order.status === OrderStatus.OUT_FOR_DELIVERY) {
             return order.orderType === OrderType.DINE_IN ? "Aguardando Serviço 🍽️" : "Aguardando Motoboy 🛵";
        }

        if (isPureCashier && (order.status === OrderStatus.RECEIVED || order.status === OrderStatus.PREPARING)) {
            return "";
        }
        
        const map: Record<string, string> = {
            [OrderStatus.PREPARING]: "Começar Preparo",
            [OrderStatus.OUT_FOR_DELIVERY]: "Finalizar Preparo",
            [OrderStatus.DELIVERED]: "Confirmar Entrega"
        };
        return nextStatus ? (map[nextStatus] || "") : "";
    }
    
    const handleStatusUpdate = async () => {
        if (!nextStatus) return;
        setIsLoading(true);
        try {
            await updateOrderStatus(order.id, nextStatus);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className={`bg-white rounded-[2rem] shadow-sm border p-6 flex flex-col h-full space-y-6 transition-all duration-300 hover:shadow-xl ${needsPickup ? 'border-orange-500 ring-4 ring-orange-50 animate-pulse' : isStaffMeal ? 'border-blue-200 bg-blue-50/5' : 'border-gray-100'}`}>
            {/* Super Admin Info */}
            {isAdminGlobal && (
                <div className="bg-gray-100 text-gray-500 text-[8px] font-black py-1 px-3 rounded-full text-center uppercase tracking-tighter self-start mb-2 border border-gray-200">
                    🏢 UNIDADE: {(order as any).restaurantName || 'Desconhecida'}
                </div>
            )}

            {needsPickup && (
                <div className="bg-orange-500 text-white text-[9px] font-black py-2 rounded-xl text-center uppercase tracking-widest mb-2">
                    🔔 Pronto no Balcão! Servir na {order.table?.name}
                </div>
            )}

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">#{order.id}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${
                        order.status === OrderStatus.RECEIVED ? 'bg-yellow-100 text-yellow-700' : 
                        (order.status as string) === OrderStatus.DELIVERED || (order.status as string) === OrderStatus.COMPLETED ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                        {order.status}
                    </span>
                    {isStaffMeal && (
                        <span className="bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">LANCHE STAFF</span>
                    )}
                </div>
            </div>

            <div className="flex-grow space-y-4">
                <div className="flex items-center space-x-3">
                    <img src={customer?.photoUrl || `https://ui-avatars.com/api/?name=${customer?.name || 'A'}&background=random`} alt="Cliente" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Solicitante</p>
                        <p className={`text-sm font-black truncate ${isStaffMember ? 'text-blue-600' : 'text-gray-800'}`}>
                            {customer?.name || 'Cliente Final'} {isStaffMember && '👤'}
                        </p>
                    </div>
                </div>

                {order.status === OrderStatus.PREPARING && order.waiterName && (
                    <div className="bg-orange-100/50 p-2 rounded-xl border border-orange-200 flex items-center justify-center space-x-2 animate-pulse">
                         <span className="text-lg">🧑‍🍳</span>
                         <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest leading-none">
                            {order.waiterName} - Preparando
                         </span>
                    </div>
                )}
                
                <div className={`p-3 rounded-2xl flex items-center space-x-2 ${order.orderType === OrderType.DINE_IN ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    {order.orderType === OrderType.DINE_IN ? <TableIcon className="w-4 h-4" /> : <BikeIcon className="w-4 h-4" />}
                    <p className="text-xs font-black uppercase tracking-widest">
                        {order.orderType === OrderType.DINE_IN ? (order.table?.name || 'Mesa') : 'DELIVERY'}
                    </p>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 space-y-2">
                    {(order.items || []).map(item => (
                        <div key={item.id} className="text-xs flex justify-between items-center">
                            <span className="font-bold text-gray-700">{item.quantity}x {item.name}</span>
                        </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                        <p className="text-[8px] font-bold text-red-400 italic">Itens não encontrados ou removidos.</p>
                    )}
                </div>

                {order.orderType === OrderType.DELIVERY && customer?.address?.street && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-inner text-left">
                         <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">📍 ENDEREÇO DE ENTREGA</p>
                         <p className="text-[11px] font-bold text-gray-800 leading-tight">
                            {customer.address.street}, {customer.address.number}
                            <br />
                            {customer.address.neighborhood} - {customer.address.city}
                            {customer.address.referencePoint && (
                                <><br /><span className="text-[10px] text-gray-500 font-bold italic uppercase tracking-tighter">REF: {customer.address.referencePoint}</span></>
                            )}
                         </p>
                    </div>
                )}

                {displayNotes && (
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-inner">
                         <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">⚠️ ORIENTAÇÕES DE PRODUÇÃO / ENDEREÇO</p>
                         <p className="text-[11px] font-bold text-gray-800 leading-tight italic whitespace-pre-wrap">{displayNotes}</p>
                    </div>
                )}
            </div>
            
            <div className="pt-4 border-t border-gray-50">
                 <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[9px] bg-gray-100 text-gray-500 font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter">{order.paymentMethod}</span>
                    <span className="font-black text-gray-900 text-xl leading-none">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 
                 {order.paymentMethod === PaymentMethod.CASH && order.changeFor && (
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex justify-between items-center mb-4 animate-in fade-in">
                        <div className="text-left">
                            <p className="text-[8px] font-black text-yellow-600 uppercase leading-none mb-1">Troco para</p>
                            <p className="text-xs font-black text-gray-900">{order.changeFor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-red-500 uppercase leading-none mb-1">Devolver</p>
                            <p className="text-sm font-black text-red-600">{(order.changeFor - order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                 )}

                <div className="flex space-x-2">
                    <button onClick={onPrint} className="p-3 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-[#E6005C] transition-all active:scale-90 shadow-sm">
                        <PrinterIcon className="w-5 h-5"/>
                    </button>
                    {canChangeStatus && getNextStatusText() !== "" && (
                        <button 
                            onClick={handleStatusUpdate}
                            disabled={isLoading}
                            className={`flex-1 text-white text-[10px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest active:scale-95 ${!nextStatus ? 'bg-gray-200 text-gray-900 cursor-not-allowed' : isStaffMeal ? 'bg-blue-600 shadow-blue-100' : 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C] hover:shadow-lg'}`}>
                            {isLoading ? '...' : getNextStatusText()}
                        </button>
                    )}
                    {canChangeStatus && getNextStatusText() === "" && (isPureCashier || isCook) && (
                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center p-3 text-center">
                             <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
                                {(order.status as string) === OrderStatus.DELIVERED ? 'Entrega Confirmada ✅' : 'Em Produção pela Cozinha'}
                             </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { orders, user } = useApp();
    const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = user?.role === 'admin' || user?.role === 'admin_restaurante';
    const isCook = !!user?.isCook;
    const isCashier = !!user?.isCashier;
    const isWaiter = !!user?.isWaiter;
    
    const isPureCashier = isCashier && !isAdmin && !isCook;
    const isPureCook = isCook && !isAdmin;
    const isOperator = isCook || isCashier || isWaiter;

    const filteredOrders = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA');

        const baseOrders = orders.filter(order => {
            const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-CA');
            const currentStatus = order.status as string;

            // Se for Operador de Caixa Puro, não mostra lanches próprios
            if (isPureCashier && order.userId === user?.id) return false;

            if (viewMode === 'active') {
                const isActive = currentStatus !== OrderStatus.DELIVERED && currentStatus !== OrderStatus.CANCELED && currentStatus !== OrderStatus.COMPLETED;
                // REMOÇÃO DA TRAVA DE DATA PARA ATIVOS: Pedido pendente tem que aparecer, mesmo que seja de ontem!
                return isActive;
            } else {
                // No histórico, filtramos por hoje para não sobrecarregar
                const isHistoryStatus = currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.CANCELED || currentStatus === OrderStatus.COMPLETED;
                if (isOperator && !isAdmin) {
                    if (isPureCook && order.waiterName !== user?.name) return false;
                    return isHistoryStatus && orderDateStr === todayStr;
                }
                return isHistoryStatus && (isAdmin || orderDateStr === todayStr);
            }
        });

        return baseOrders.filter(order => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;
            return order.id.toString() === term || (order.customer?.name || '').toLowerCase().includes(term);
        });
    }, [orders, viewMode, searchTerm, isAdmin, isOperator, isPureCook, isPureCashier, user?.id, user?.name]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {printingOrder && <PrintableReceipt order={printingOrder} customer={printingOrder.customer} onClose={() => setPrintingOrder(null)} />}

            <div className="flex flex-col space-y-8">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                        {isPureCashier ? 'Controle de Entregas Staff/Loja' : isPureCook ? 'Cozinha (KDS)' : 'Cozinha (KDS)'}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                        {isPureCook && viewMode === 'history' 
                            ? 'Listando apenas os pedidos que você preparou hoje.' 
                            : isPureCashier 
                                ? 'Gerencie todas as saídas de hoje para clientes e colegas.' 
                                : 'Gerencie os pedidos de clientes recebidos.'}
                    </p>
                </div>

                <div className="flex bg-gray-100/80 p-1.5 rounded-[1.5rem] w-fit border border-gray-100">
                    <button onClick={() => setViewMode('active')} className={`px-8 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${viewMode === 'active' ? 'bg-[#E6005C] text-white shadow-lg' : 'text-gray-400'}`}>Ativos</button>
                    <button onClick={() => setViewMode('history')} className={`px-8 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${viewMode === 'history' ? 'bg-[#333] text-white shadow-lg' : 'text-gray-400'}`}>Histórico Hoje</button>
                </div>

                <div className="relative">
                    <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input type="text" placeholder="Buscar pedido pelo ID ou nome do cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-100 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-orange-100 outline-none shadow-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredOrders.map(order => (
                    <AdminOrderCard key={order.id} order={order} customer={order.customer} onPrint={() => setPrintingOrder(order)} />
                ))}
            </div>
            
            {filteredOrders.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-300 font-black uppercase tracking-widest text-xs">
                        {isPureCook && viewMode === 'history' ? 'Você ainda não preparou nenhum pedido hoje.' : 'Nenhum pedido operacional encontrado para este filtro.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
