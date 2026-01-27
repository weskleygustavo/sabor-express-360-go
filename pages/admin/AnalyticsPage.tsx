
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { OrderStatus, OrderType } from '../../types';
import PrintableAnalyticsReport from '../../components/admin/PrintableAnalyticsReport';

const SummaryCard: React.FC<{ title: string; value: string; sub: string, colorClass: string }> = ({ title, value, sub, colorClass }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</h3>
        <p className={`text-4xl font-black tracking-tighter ${colorClass}`}>{value}</p>
        <p className="text-[10px] font-bold text-gray-400 mt-2">{sub}</p>
    </div>
);

const AnalyticsPage: React.FC = () => {
    const { orders, restaurant } = useApp();
    const [printing, setPrinting] = useState(false);
    
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState<'all' | OrderType.DELIVERY | OrderType.DINE_IN>('all');
    const [selectedCook, setSelectedCook] = useState<string>('all');

    const cooksList = useMemo(() => {
        const names = new Set<string>();
        orders.forEach(o => {
            if (o.waiterName && (o.status === OrderStatus.DELIVERED || o.status === OrderStatus.OUT_FOR_DELIVERY)) {
                names.add(o.waiterName);
            }
        });
        return Array.from(names).sort();
    }, [orders]);

    const analyticsData = useMemo(() => {
        const filteredOrders = orders.filter(o => {
            const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
            const matchesDate = dateStr >= dateFrom && dateStr <= dateTo;
            const matchesStatus = o.status === OrderStatus.DELIVERED;
            const matchesType = filterType === 'all' || o.orderType === filterType;
            const matchesCook = selectedCook === 'all' || o.waiterName === selectedCook;
            return matchesDate && matchesStatus && matchesType && matchesCook;
        });

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalProfit = filteredOrders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + (i.price - i.cost) * i.quantity, 0), 0);
        
        const productStats: Record<string, any> = {};
        const waiterStats: Record<string, any> = {};
        let totalItemsPrepared = 0;

        filteredOrders.forEach(o => {
            o.items.forEach(i => {
                if (!productStats[i.id]) productStats[i.id] = { name: i.name, quantity: 0, profit: 0 };
                productStats[i.id].quantity += i.quantity;
                productStats[i.id].profit += (i.price - i.cost) * i.quantity;
                totalItemsPrepared += i.quantity;
            });

            if (o.waiterName) {
                if (!waiterStats[o.waiterName]) waiterStats[o.waiterName] = { name: o.waiterName, count: 0, commission: 0, items: 0 };
                waiterStats[o.waiterName].count++;
                waiterStats[o.waiterName].items += o.items.reduce((s, i) => s + i.quantity, 0);
                const commRate = (restaurant?.serviceCharge || 10) / 100;
                waiterStats[o.waiterName].commission += o.total * (commRate / (1 + (restaurant?.serviceCharge ? commRate : 0)));
            }
        });

        return {
            totalRevenue, totalProfit, orderCount: filteredOrders.length, totalItemsPrepared,
            avgTicket: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
            products: Object.values(productStats).sort((a, b) => b.profit - a.profit).slice(0, 5),
            waiters: Object.values(waiterStats).sort((a, b) => b.count - a.count),
            period: `${dateFrom} até ${dateTo}`,
            filter: filterType
        };
    }, [orders, dateFrom, dateTo, restaurant, filterType, selectedCook]);

    return (
        <div className="space-y-12">
            {printing && (
                <PrintableAnalyticsReport 
                    data={{
                        ...analyticsData,
                        operatingProfit: analyticsData.totalProfit,
                        deliveredOrdersCount: analyticsData.orderCount,
                        averageTicket: analyticsData.avgTicket,
                        canceledOrdersCount: 0,
                        financialLoss: 0,
                        sortedProducts: analyticsData.products.map(p => ({ ...p, revenue: 0 })),
                        sortedWaiters: analyticsData.waiters.map(w => ({ ...w, ordersCount: w.count, totalRevenue: 0, totalCommission: w.commission }))
                    }} 
                    restaurantName={restaurant?.name || 'Sabor Express'} 
                    onClose={() => setPrinting(false)} 
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                <div className="text-left space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Análises e Relatórios</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Acompanhe o desempenho do seu negócio e produtividade da equipe.</p>
                </div>
                
                <button onClick={() => setPrinting(true)} className="bg-[#E6005C] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-pink-100 hover:scale-105 active:scale-95 transition-all">
                    IMPRIMIR RELATÓRIO
                </button>
            </div>

            {/* Filtros Estilo Profissional */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 text-left">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">PAINEL DE FILTRAGEM INTELIGENTE</h3>
                    <button onClick={() => { setDateFrom(new Date().toISOString().split('T')[0]); setDateTo(new Date().toISOString().split('T')[0]); setSelectedCook('all'); setFilterType('all'); }} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">REINICIAR FILTROS</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Início do Período</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-black outline-none focus:ring-4 focus:ring-pink-50 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Fim do Período</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-black outline-none focus:ring-4 focus:ring-pink-50 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Cozinheiro Responsável</label>
                        <select value={selectedCook} onChange={e => setSelectedCook(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-black outline-none focus:ring-4 focus:ring-pink-50 transition-all appearance-none">
                            <option value="all">Todos os Operadores</option>
                            {cooksList.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Pedido</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-black outline-none focus:ring-4 focus:ring-pink-50 transition-all appearance-none">
                            <option value="all">Geral (Loja + Delivery)</option>
                            <option value={OrderType.DELIVERY}>Apenas Delivery</option>
                            <option value={OrderType.DINE_IN}>Apenas Mesas</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <SummaryCard title="Faturamento Bruto" value={analyticsData.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub={`${analyticsData.orderCount} pedidos entregues`} colorClass="text-gray-900" />
                <SummaryCard title="Lucro Bruto (CMV)" value={analyticsData.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub="Ganho real sobre produtos" colorClass="text-green-500" />
                <SummaryCard title="Produtividade Cozinha" value={analyticsData.totalItemsPrepared.toString()} sub="Itens individuais produzidos" colorClass="text-blue-500" />
                <SummaryCard title="Pedidos do Período" value={analyticsData.orderCount.toString()} sub="Volume total de produção" colorClass="text-[#E6005C]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-left">
                    <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center tracking-tighter uppercase">
                        <span className="mr-4 text-2xl">🍕</span> Ranking de Produtos (Lucratividade)
                    </h3>
                    <div className="space-y-6">
                        {analyticsData.products.map((p: any) => (
                            <div key={p.name} className="flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="font-black text-gray-800 text-sm uppercase tracking-tight">{p.name}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.quantity} un. preparadas</span>
                                </div>
                                <span className="font-black text-green-600 text-lg">+{p.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        ))}
                        {analyticsData.products.length === 0 && <p className="text-gray-400 text-xs font-bold uppercase py-10 text-center border-2 border-dashed border-gray-50 rounded-3xl">Nenhum dado registrado.</p>}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-left">
                    <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center tracking-tighter uppercase">
                        <span className="mr-4 text-2xl">🧑‍🍳</span> Ranking de Produção (Equipe)
                    </h3>
                    <div className="space-y-6">
                        {analyticsData.waiters.map((w: any) => (
                            <div key={w.name} className="flex items-center justify-between py-1">
                                <div className="flex flex-col">
                                    <span className="font-black text-gray-800 text-sm uppercase tracking-tight">{w.name}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{w.items} itens em {w.count} pedidos</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl font-black text-[#E6005C] tracking-tighter">{w.count}</span>
                                    <span className="text-[8px] font-black text-gray-300 uppercase vertical-text tracking-widest">Pedidos</span>
                                </div>
                            </div>
                        ))}
                        {analyticsData.waiters.length === 0 && <p className="text-gray-400 text-xs font-bold uppercase py-10 text-center border-2 border-dashed border-gray-50 rounded-3xl">Nenhuma produção registrada.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
