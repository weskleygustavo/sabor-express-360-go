
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { OrderStatus, MenuItem, InventoryEntry } from '../../types';
import { SearchIcon, PackageCheckIcon, XIcon, PrinterIcon } from '../../components/icons';
import PrintableInventoryReport from '../../components/admin/PrintableInventoryReport';

const InventoryPage: React.FC = () => {
    const { menuItems, inventoryEntries, addInventoryEntry, orders, restaurant } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Form State
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [unitCost, setUnitCost] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);

    // Cálculos de estoque baseados em entradas e pedidos vendidos
    const inventorySummary = useMemo(() => {
        // Filtramos para processar apenas itens marcados para controle de estoque
        return menuItems
            .filter(item => item.trackInventory)
            .map(item => {
                // Soma de todas as entradas deste item
                const totalIn = inventoryEntries
                    .filter(entry => entry.menu_item_id === item.id)
                    .reduce((sum, entry) => sum + entry.quantity, 0);

                // Soma de todas as saídas (pedidos entregues)
                const totalSold = orders
                    .filter(order => order.status === OrderStatus.DELIVERED)
                    .reduce((sum, order) => {
                        const itemInOrder = order.items.find(oi => oi.id === item.id);
                        return sum + (itemInOrder ? itemInOrder.quantity : 0);
                    }, 0);

                const lastEntryDate = inventoryEntries
                    .filter(entry => entry.menu_item_id === item.id)
                    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0]?.created_at;

                const lastUnitCost = inventoryEntries
                    .filter(entry => entry.menu_item_id === item.id)
                    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0]?.unit_cost || item.cost;

                const stockCount = totalIn - totalSold;
                
                // Cálculo de alerta (20% do total que já entrou)
                const threshold = totalIn * 0.2;
                const isCritical = totalIn > 0 && stockCount <= threshold;
                
                return {
                    ...item,
                    totalIn,
                    totalSold,
                    stockCount,
                    lastEntryDate,
                    lastUnitCost,
                    isCritical,
                    soldValue: totalSold * item.price,
                    stockValue: stockCount * item.price
                };
            }).filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [menuItems, inventoryEntries, orders, searchTerm]);

    const handleAddEntry = async () => {
        if (!selectedItemId || !quantity || !unitCost) {
            alert('Preencha todos os campos corretamente.');
            return;
        }
        setLoading(true);
        try {
            await addInventoryEntry({
                menu_item_id: selectedItemId,
                quantity: Number(quantity),
                unit_cost: Number(unitCost)
            });
            setIsEntryModalOpen(false);
            setSelectedItemId('');
            setQuantity('');
            setUnitCost('');
        } catch (error: any) {
            alert('Erro ao salvar entrada: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 pb-20 w-full overflow-hidden">
            {isPrinting && (
                <PrintableInventoryReport 
                    data={inventorySummary} 
                    restaurantName={restaurant?.name || 'Sabor Express'} 
                    onClose={() => setIsPrinting(false)} 
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left w-full">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">Gestão de Estoque</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                        Controle seletivo para produtos de revenda (Atacado p/ Varejo).
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsPrinting(true)}
                        className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-600 font-black py-3 px-4 md:py-4 md:px-6 rounded-2xl hover:bg-gray-50 transition-all text-[11px] uppercase tracking-widest shadow-sm flex items-center justify-center"
                    >
                        <PrinterIcon className="w-4 h-4 mr-2" /> INVENTÁRIO
                    </button>
                    <button 
                        onClick={() => setIsEntryModalOpen(true)}
                        className="flex-1 md:flex-none bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-3 px-4 md:py-4 md:px-10 rounded-2xl shadow-xl shadow-orange-100 hover:scale-105 transition-all text-[11px] uppercase tracking-widest active:scale-95 flex items-center justify-center"
                    >
                        <span className="mr-2 text-lg">📥</span> ENTRADA
                    </button>
                </div>
            </div>

            {/* Alertas Rápidos */}
            {inventorySummary.some(i => i.isCritical) && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center space-x-4 text-red-600 animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <span className="text-2xl">🔴</span>
                    <p className="text-sm font-black uppercase tracking-wider">
                        Atenção: Você possui itens com estoque abaixo de 20%.
                    </p>
                </div>
            )}

            {/* Barra de Pesquisa */}
            <div className="relative">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                    type="text" 
                    placeholder="Pesquisar itens controlados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-3xl py-4 md:py-5 pl-14 pr-6 text-sm md:text-base font-bold focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all placeholder-gray-300 shadow-sm"
                />
            </div>

            {/* Grid de Gestão */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-[11px] font-black uppercase text-gray-400 tracking-widest">
                                <th className="p-6">Produto</th>
                                <th className="p-6">Última Entrada</th>
                                <th className="p-6 text-right">Custo Unit.</th>
                                <th className="p-6 text-center">Qtd. Total</th>
                                <th className="p-6 text-center">Vendidos</th>
                                <th className="p-6 text-center">Em Estoque</th>
                                <th className="p-6 text-right">Vendas (R$)</th>
                                <th className="p-6 text-right">Valor Estoque</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {inventorySummary.map(item => (
                                <tr key={item.id} className={`hover:bg-gray-50/50 transition-all group ${item.isCritical ? 'bg-red-50/30' : ''}`}>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform"/>
                                                {item.isCritical && (
                                                    <span className="absolute -top-1 -right-1 text-[14px] animate-bounce">🔴</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    <p className="font-black text-gray-900 text-base leading-none">{item.name}</p>
                                                    {item.isCritical && <span className="ml-2 text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-100 px-2 py-0.5 rounded-md">Baixa Qtd.</span>}
                                                </div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase mt-1.5 tracking-wider">Ref: {item.id.slice(0,8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                                            {item.lastEntryDate ? item.lastEntryDate.toLocaleDateString('pt-BR') : '--/--/--'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="font-black text-gray-700 text-sm">
                                            {item.lastUnitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-sm font-black inline-block min-w-[40px]">
                                            {item.totalIn}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-sm font-black inline-block min-w-[40px]">
                                            {item.totalSold}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`px-4 py-1.5 rounded-xl text-sm font-black inline-block min-w-[40px] ${item.isCritical ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-green-50 text-green-600'}`}>
                                                {item.stockCount}
                                            </span>
                                            {item.isCritical && <span className="text-[10px] font-black text-red-500 mt-1.5 uppercase tracking-tighter">Reposição!</span>}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="font-black text-gray-900 text-sm">
                                            {item.soldValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="font-black text-[#E6005C] text-sm">
                                            {item.stockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {inventorySummary.length === 0 && (
                    <div className="py-24 text-center">
                        <PackageCheckIcon className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                        <p className="text-gray-300 font-black uppercase tracking-widest text-base">Nenhum produto controlado em estoque</p>
                    </div>
                )}
            </div>

            {/* Modal de Entrada */}
            {isEntryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-gray-100 text-left">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Entrada de Mercadoria</h2>
                            <button onClick={() => setIsEntryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Selecionar Produto (Apenas Revenda)</label>
                                <select 
                                    value={selectedItemId} 
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-gray-900 focus:ring-4 focus:ring-orange-50 transition-all appearance-none"
                                >
                                    <option value="">Escolha um item...</option>
                                    {menuItems.filter(item => item.trackInventory).map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Quantidade</label>
                                    <input 
                                        type="number" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')} 
                                        placeholder="Ex: 24"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black focus:ring-4 focus:ring-orange-50 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Preço de Custo (UN)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={unitCost} 
                                        onChange={(e) => setUnitCost(e.target.value ? Number(e.target.value) : '')} 
                                        placeholder="R$ 2,50"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black focus:ring-4 focus:ring-orange-50 outline-none" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex space-x-4">
                            <button onClick={() => setIsEntryModalOpen(false)} className="flex-1 text-gray-400 font-black px-4 py-4 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
                            <button 
                                onClick={handleAddEntry} 
                                disabled={loading}
                                className="flex-[2] bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-xs tracking-widest disabled:opacity-50"
                            >
                                {loading ? 'PROCESSANDO...' : 'CONFIRMAR ENTRADA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
