
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Table, Order, OrderStatus, OrderType, CartItem, PaymentMethod } from '../../types';
import { XIcon, PrinterIcon, TableIcon, CheckIcon } from '../../components/icons';
import PrintableReceipt from '../../components/admin/PrintableReceipt';

const paymentMethodDetails = {
    [PaymentMethod.PIX]: { icon: '❖', text: 'PIX' },
    [PaymentMethod.CARD]: { icon: '💳', text: 'Cartão' },
    [PaymentMethod.CASH]: { icon: '💵', text: 'Dinheiro' },
};

const TableDetailsModal: React.FC<{ table: Table, orders: Order[], onClose: () => void }> = ({ table, orders, onClose }) => {
    const { restaurant, closeTableOrders, user } = useApp();
    const [loading, setLoading] = useState(false);
    const [isPrintingPreview, setIsPrintingPreview] = useState(false);
    
    // Regra de Negócio: Somente Admin e Caixa fecham contas.
    const canCloseTable = user?.role === 'admin' || user?.role === 'admin_restaurante' || !!user?.isCashier;

    const [overrideServiceCharge, setOverrideServiceCharge] = useState<number>(restaurant?.serviceCharge ?? 10);
    const [finalPaymentMethod, setFinalPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);

    const groupedItems = useMemo(() => {
        const itemsMap: Record<string, { item: CartItem, totalQty: number, servedQty: number }> = {};
        orders.forEach(order => {
            const isServed = order.status === OrderStatus.OUT_FOR_DELIVERY || order.status === OrderStatus.DELIVERED;
            
            order.items.forEach(item => {
                if (!itemsMap[item.id]) {
                    itemsMap[item.id] = { item, totalQty: 0, servedQty: 0 };
                }
                itemsMap[item.id].totalQty += item.quantity;
                if (isServed) {
                    itemsMap[item.id].servedQty += item.quantity;
                }
            });
        });
        return Object.values(itemsMap);
    }, [orders]);

    const subtotal = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
    
    const serviceChargeValue = useMemo(() => {
        const rate = Math.max(0, overrideServiceCharge) / 100;
        return subtotal * rate;
    }, [subtotal, overrideServiceCharge]);

    const total = subtotal + serviceChargeValue;

    const firstOrderTime = useMemo(() => {
        if (orders.length === 0) return null;
        return new Date(Math.min(...orders.map(o => o.createdAt.getTime())));
    }, [orders]);

    const duration = useMemo(() => {
        if (!firstOrderTime) return '';
        const diff = Math.abs(new Date().getTime() - firstOrderTime.getTime());
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m`;
    }, [firstOrderTime]);

    const waiterNames = useMemo(() => {
        const names = new Set(orders.map(o => o.waiterName).filter(Boolean));
        if (names.size === 0) return 'Auto-atendimento';
        return Array.from(names).join(', ');
    }, [orders]);

    const handleCloseTab = async () => {
        if (loading || !canCloseTable) return; 
        
        setLoading(true);
        try {
            await closeTableOrders(table.id, finalPaymentMethod);
            onClose(); 
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 text-left">
            {isPrintingPreview && (
                <PrintableReceipt 
                    tableOrders={orders} 
                    tableName={table.name} 
                    serviceChargeOverride={overrideServiceCharge}
                    onClose={() => setIsPrintingPreview(false)} 
                />
            )}
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{table.name}</h2>
                        <span className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.2em] mt-1">Comanda em Aberto</span>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-2xl transition-all active:scale-90">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow px-6 py-6 space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center space-x-3">
                            <span className="text-lg">👤</span>
                            <div className="min-w-0">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Equipe Resp.</p>
                                <p className="text-xs font-black text-gray-800 truncate">{waiterNames}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center space-x-3">
                            <span className="text-lg">🕒</span>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Permanência</p>
                                <p className="text-xs font-black text-gray-800">{duration}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consumo da Mesa</h3>
                            <span className="h-px bg-gray-100 flex-grow ml-4"></span>
                        </div>
                        <div className="space-y-1">
                            {groupedItems.map(({ item, totalQty, servedQty }) => {
                                const isReady = servedQty === totalQty;
                                return (
                                    <div key={item.id} className="flex justify-between items-center py-2 px-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <span className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-lg transition-colors ${isReady ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-[#FF8C00]'}`}>
                                                    {totalQty}
                                                </span>
                                                {isReady && (
                                                    <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                                        <CheckIcon className="w-2.5 h-2.5" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-sm font-bold ${isReady ? 'text-gray-900' : 'text-gray-700'}`}>{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{(item.price * totalQty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {canCloseTable && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Forma de Pagamento</h3>
                                <span className="h-px bg-gray-100 flex-grow ml-4"></span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.values(PaymentMethod).map(method => (
                                    <button 
                                        key={method}
                                        onClick={() => setFinalPaymentMethod(method)}
                                        className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                                            finalPaymentMethod === method 
                                            ? 'border-[#E6005C] bg-[#E6005C]/5 text-[#E6005C] scale-105 shadow-sm' 
                                            : 'border-transparent bg-gray-50 text-gray-400'
                                        }`}
                                    >
                                        <span className="text-xl mb-1">{paymentMethodDetails[method].icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{paymentMethodDetails[method].text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-6 bg-gray-50 border-t border-gray-100 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                            <span>Subtotal Consumo</span>
                            <span className="text-gray-900">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Taxa Serviço (%)</span>
                                <input 
                                    type="number" 
                                    disabled={!canCloseTable}
                                    value={overrideServiceCharge}
                                    onChange={(e) => setOverrideServiceCharge(parseFloat(e.target.value) || 0)}
                                    className="w-12 py-1 bg-orange-50 border-none rounded-lg text-center font-black text-orange-600 focus:ring-0 text-xs"
                                    min="0" max="100"
                                />
                            </div>
                            <span className="text-xs font-black text-gray-900">
                                {serviceChargeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-4 px-1">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">TOTAL GERAL</span>
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                        <button onClick={() => setIsPrintingPreview(true)} className="p-4 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-[#E6005C] transition-all active:scale-90 shadow-sm">
                            <PrinterIcon className="w-6 h-6"/>
                        </button>
                        <button 
                            onClick={handleCloseTab}
                            disabled={loading || subtotal === 0 || !canCloseTable}
                            className={`flex-1 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-100 uppercase tracking-widest text-xs active:scale-[0.98] ${
                                loading || subtotal === 0 || !canCloseTable ? 'opacity-50 cursor-not-allowed grayscale bg-gray-400' : 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C] hover:opacity-90'
                            }`}>
                            {loading ? 'Processando...' : canCloseTable ? 'FECHAR E RECEBER' : 'MESA EM ATENDIMENTO'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TableManagementPage: React.FC = () => {
    const { tables, orders, addTable, updateTable, deleteTable, user, acknowledgeTableOrders } = useApp();
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedTableForDetails, setSelectedTableForDetails] = useState<Table | null>(null);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [tableName, setTableName] = useState('');
    const [tableNumber, setTableNumber] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);

    // CORREÇÃO: isAdmin deve incluir admin_restaurante
    const isAdmin = user?.role === 'admin' || user?.role === 'admin_restaurante';
    const isCashier = !!user?.isCashier;
    
    const activeOrdersByTable = useMemo(() => {
        const map: Record<string, Order[]> = {};
        orders.forEach(o => {
            if (o.orderType === OrderType.DINE_IN && o.tableId && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED) {
                if (!map[o.tableId]) map[o.tableId] = [];
                map[o.tableId].push(o);
            }
        });
        return map;
    }, [orders]);

    const handleOpenConfigModal = (table: Table | null) => {
        if (!isAdmin) return;
        setEditingTable(table);
        setTableName(table ? table.name : '');
        setTableNumber(table ? table.number : '');
        setIsConfigModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsConfigModalOpen(false);
        setEditingTable(null);
        setSelectedTableForDetails(null);
    };

    const handleSave = async () => {
        if (!tableName || tableNumber === '') return;
        setLoading(true);
        try {
            if (editingTable) {
                await updateTable(editingTable.id, tableName, Number(tableNumber));
            } else {
                await addTable(tableName, Number(tableNumber));
            }
            handleCloseModals();
        } catch (error: any) {
            alert("Erro ao salvar mesa: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteTable = async (id: string) => {
        if (!isAdmin) return;
        if(activeOrdersByTable[id]) {
            alert('Não é possível excluir uma mesa que está ocupada.');
            return;
        }
        if (window.confirm('Tem certeza que deseja excluir esta mesa?')) {
            try {
                await deleteTable(id);
            } catch (error: any) {
                alert('Erro ao excluir mesa: ' + error.message);
            }
        }
    }

    const handleAcknowledgeAlert = async (e: React.MouseEvent, tableId: string) => {
        e.stopPropagation();
        if (!isCashier && !isAdmin) return;
        
        try {
            await acknowledgeTableOrders(tableId);
        } catch (error: any) {
            alert('Erro ao confirmar retirada: ' + error.message);
        }
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Mapa de Mesas</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Acompanhe o consumo em tempo real.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => handleOpenConfigModal(null)} className="bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-orange-100 active:scale-95 text-[10px] uppercase tracking-widest">
                        + ADICIONAR MESA
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {tables.map(table => {
                    const tableOrders = activeOrdersByTable[table.id] || [];
                    const isOccupied = tableOrders.length > 0;
                    const totalConsumo = tableOrders.reduce((sum, o) => sum + o.total, 0);
                    
                    const hasReadyOrders = tableOrders.some(o => 
                        o.status === OrderStatus.OUT_FOR_DELIVERY && 
                        (!o.notes || !o.notes.includes('[SERVIDO]'))
                    );

                    return (
                        <div 
                            key={table.id} 
                            onClick={() => isOccupied ? setSelectedTableForDetails(table) : null}
                            className={`relative p-8 rounded-[2.5rem] shadow-sm border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 flex flex-col items-center justify-center min-h-[180px] ${
                                isOccupied 
                                ? hasReadyOrders 
                                    ? 'bg-red-50 border-red-500 shadow-xl shadow-red-100 ring-4 ring-red-50 animate-pulse' 
                                    : 'bg-red-50 border-red-100 shadow-xl shadow-red-50 ring-4 ring-white' 
                                : 'bg-white border-gray-50 hover:border-orange-200'
                            }`}
                        >
                            {isOccupied && hasReadyOrders && (
                                <button 
                                    onClick={(e) => handleAcknowledgeAlert(e, table.id)}
                                    className={`absolute -top-3 -right-3 bg-red-600 text-white p-3 rounded-full shadow-lg border-4 border-white z-20 animate-bounce transition-all ${(isCashier || isAdmin) ? 'hover:scale-110 active:scale-90 hover:bg-green-600' : 'cursor-default'}`}
                                >
                                    <span className="text-lg">🚨</span>
                                </button>
                            )}

                            <div className="flex flex-col items-center space-y-3 text-center">
                                <div className={`transition-all duration-500 group-hover:rotate-12 ${isOccupied ? hasReadyOrders ? 'text-red-600' : 'text-[#E6005C]' : 'text-gray-100'}`}>
                                    <TableIcon className="w-16 h-16" />
                                </div>
                                <h3 className="font-black text-gray-900 text-lg leading-tight tracking-tighter">{table.name}</h3>
                                {isOccupied ? (
                                    <>
                                        <p className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${hasReadyOrders ? 'bg-red-600 text-white animate-pulse' : 'bg-red-100/50 text-[#E6005C]'}`}>
                                            {hasReadyOrders ? 'PRONTO P/ SERVIR' : 'OCUPADA'}
                                        </p>
                                        <p className="text-xl font-black text-gray-900 mt-1 tracking-tighter">{totalConsumo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </>
                                ) : (
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Livre</p>
                                )}
                            </div>
                            
                            {isAdmin && (
                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenConfigModal(table); }} className="p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 hover:text-blue-600 transition-all text-sm">✏️</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id); }} className="p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 hover:text-red-600 transition-all text-sm">🗑️</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedTableForDetails && (
                <TableDetailsModal 
                    table={selectedTableForDetails} 
                    orders={activeOrdersByTable[selectedTableForDetails.id] || []}
                    onClose={handleCloseModals}
                />
            )}

            {isConfigModalOpen && isAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-gray-100 text-left">
                        <h2 className="text-2xl font-black mb-8 text-gray-800 tracking-tighter">{editingTable ? "Editar Mesa" : "Nova Mesa"}</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nome ou Apelido</label>
                                <input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Ex: Mesa VIP 01" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all" />
                            </div>
                             <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Número de Ordem</label>
                                <input type="number" value={tableNumber} onChange={(e) => setTableNumber(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all" />
                            </div>
                        </div>
                        <div className="mt-10 flex space-x-4">
                            <button onClick={handleCloseModals} className="flex-1 text-gray-400 font-black px-4 py-4 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
                            <button onClick={handleSave} disabled={loading} className="flex-[2] bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-sm tracking-widest">
                                {loading ? '...' : 'SALVAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableManagementPage;
