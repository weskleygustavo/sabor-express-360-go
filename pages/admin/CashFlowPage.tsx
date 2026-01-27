
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { OrderStatus, PaymentMethod, CashierSession } from '../../types';
import { XIcon, PrinterIcon, BarChartIcon, WalletIcon } from '../../components/icons';

const CashierDetailModal: React.FC<{ session: Partial<CashierSession>, onClose: () => void }> = ({ session, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
             <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-gray-100 text-left animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Detalhamento do Caixa</h2>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Relatório Analítico de Conferência (Total do Dia)</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Operadores</p>
                            <p className="text-sm font-black text-gray-700">{session.operator_name || 'Diversos'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Data Referência</p>
                            <p className="text-sm font-black text-gray-700">{session.opened_at ? new Date(session.opened_at).toLocaleDateString('pt-BR') : '--'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl">
                             <span className="text-xs font-black text-gray-500 uppercase tracking-widest">💵 DINHEIRO</span>
                             <span className="text-base font-black text-gray-900">{session.total_sales_cash?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl">
                             <span className="text-xs font-black text-gray-500 uppercase tracking-widest">💳 CARTÃO</span>
                             <span className="text-base font-black text-gray-900">{session.total_sales_card?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl">
                             <span className="text-xs font-black text-gray-500 uppercase tracking-widest">❖ PIX</span>
                             <span className="text-base font-black text-gray-900">{session.total_sales_pix?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                         <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                            <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Total Fundo Abertura</p>
                            <p className="text-lg font-black text-orange-700">+{session.starting_balance?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                         <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Total Saídas</p>
                            <p className="text-lg font-black text-red-700">-{session.total_expenses?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-[2rem] text-center shadow-xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">SALDO CONSOLIDADO DO DIA</p>
                        <p className="text-4xl font-black text-white tracking-tighter">
                            {session.final_balance?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </p>
                    </div>
                </div>
             </div>
        </div>
    );
};

const ShiftOperatorView: React.FC<{
    currentSession: CashierSession | null;
    currentTotals: any;
    startingBalance: string;
    setStartingBalance: (v: string) => void;
    onOpen: () => void;
    onCloseShift: () => void;
    loading: boolean;
}> = ({ currentSession, currentTotals, startingBalance, setStartingBalance, onOpen, onCloseShift, loading }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!currentSession ? (
                <div className="bg-white p-12 md:p-20 rounded-[3.5rem] border border-gray-100 shadow-sm text-center space-y-10">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-500 mx-auto shadow-inner mb-6">
                            <WalletIcon className="w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Abrir Novo Turno</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Inicie as operações informando o valor em espécie disponível no fundo do caixa.</p>
                    </div>
                    
                    <div className="max-w-sm mx-auto space-y-6">
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 group-focus-within:text-orange-500 transition-colors">R$</span>
                            <input 
                                type="number" 
                                value={startingBalance} 
                                onChange={e => setStartingBalance(e.target.value)} 
                                placeholder="0,00" 
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 pl-16 text-left text-3xl font-black focus:ring-8 focus:ring-orange-50 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder-gray-200" 
                            />
                        </div>
                        <button 
                            onClick={onOpen} 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
                        >
                            {loading ? 'PROCESSANDO...' : 'INICIAR TRABALHOS'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center hover:shadow-lg transition-all group">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-gray-900">💵 DINHEIRO EM ESPÉCIE</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{currentTotals?.cash.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center hover:shadow-lg transition-all group">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-gray-900">💳 CARTÕES (DÉBITO/CRÉDITO)</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{currentTotals?.card.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center hover:shadow-lg transition-all group">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-gray-900">❖ PIX INSTANTÂNEO</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{currentTotals?.pix.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><WalletIcon className="w-40 h-40 text-white" /></div>
                         <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3 relative z-10">VALOR TOTAL EM CAIXA (ESTE TURNO)</p>
                         <p className="text-7xl font-black text-white tracking-tighter relative z-10">{currentTotals?.final.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                         
                         <div className="flex justify-center space-x-12 mt-8 pt-8 border-t border-white/5 relative z-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Fundo Abertura</p>
                                <p className="text-xl font-black text-white">+{currentTotals?.float.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Pagamentos Saída</p>
                                <p className="text-xl font-black text-white">-{currentTotals?.dailyExpenses.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                            </div>
                         </div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                        <button 
                            onClick={onCloseShift} 
                            disabled={loading} 
                            className="w-full max-w-md bg-red-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl shadow-red-100 hover:bg-red-700 hover:scale-105 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                        >
                            {loading ? 'FECHANDO...' : 'ENCERRAR MEU TURNO'}
                        </button>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">⚠️ Após o fechamento, as vendas não poderão ser editadas.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const CashFlowPage: React.FC = () => {
    const { orders, expenses, user, currentCashierSession, openCashierSession, closeCashierSession, allCashierSessions } = useApp();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isTodayOnly, setIsTodayOnly] = useState(false);
    
    // NOVO: Controle de visualização para Admins (Operação vs BI)
    const [viewMode, setViewMode] = useState<'bi' | 'operator'>((!!user?.isCashier && !user?.role.includes('admin')) ? 'operator' : 'bi');
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<Partial<CashierSession> | null>(null);
    const [startingBalanceInput, setStartingBalanceInput] = useState('');
    const [loading, setLoading] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'admin_restaurante';

    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const years = [2026, 2027, 2028, 2029, 2030];

    // Lógica consolidada de totais do turno atual
    const currentTotals = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const sales = orders.filter(o => o.status === OrderStatus.DELIVERED && new Date(o.createdAt).toISOString().split('T')[0] === todayStr);
        const cash = sales.filter(o => o.paymentMethod === PaymentMethod.CASH).reduce((s, o) => s + o.total, 0);
        const card = sales.filter(o => o.paymentMethod === PaymentMethod.CARD).reduce((s, o) => s + o.total, 0);
        const pix = sales.filter(o => o.paymentMethod === PaymentMethod.PIX).reduce((s, o) => s + o.total, 0);
        const dailyExpenses = expenses.filter(e => e.payment_date === todayStr).reduce((s, e) => s + e.amount, 0);
        
        const float = currentCashierSession?.starting_balance || 0;
        const totalSales = cash + card + pix;
        const final = (float + totalSales) - dailyExpenses;
        return { cash, card, pix, dailyExpenses, float, totalSales, final };
    }, [currentCashierSession, orders, expenses]);

    const handleOpenSession = async () => {
        setLoading(true);
        try {
            await openCashierSession(Number(startingBalanceInput) || 0);
            setStartingBalanceInput('');
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    }

    const handleCloseSession = async () => {
        if (!currentTotals || !confirm('Deseja realmente fechar o caixa agora?')) return;
        setLoading(true);
        try {
            await closeCashierSession({
                total_sales_cash: currentTotals.cash,
                total_sales_card: currentTotals.card,
                total_sales_pix: currentTotals.pix,
                total_expenses: currentTotals.dailyExpenses,
                final_balance: currentTotals.final,
            });
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    }

    const historicalData = useMemo(() => {
        const sortedOrders = [...orders].filter(o => o.status === OrderStatus.DELIVERED).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
        const sortedExpenses = [...expenses].filter(e => !!e.payment_date).sort((a,b) => new Date(a.payment_date!).getTime() - new Date(b.payment_date!).getTime());
        
        const datesSet = new Set<string>();
        sortedOrders.forEach(o => datesSet.add(new Date(o.createdAt).toISOString().split('T')[0]));
        sortedExpenses.forEach(e => datesSet.add(e.payment_date!));
        allCashierSessions.forEach(s => datesSet.add(new Date(s.opened_at).toISOString().split('T')[0]));
        
        const allDates = Array.from(datesSet).sort();
        
        let runningAccumulatedBalance = 0;
        const dailyHistory: Record<string, any> = {};

        allDates.forEach(dateStr => {
            const dayOrders = sortedOrders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr);
            const dayExpenses = sortedExpenses.filter(e => e.payment_date === dateStr);
            const daySessions = allCashierSessions.filter(s => new Date(s.opened_at).toISOString().split('T')[0] === dateStr);
            
            const totalFloat = daySessions.reduce((sum, s) => sum + s.starting_balance, 0);
            const inflow = dayOrders.reduce((sum, o) => sum + o.total, 0);
            const outflow = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            
            const openingBalance = runningAccumulatedBalance + totalFloat;
            const finalBalance = openingBalance + inflow - outflow;
            
            const operatorsSet = new Set(daySessions.map(s => s.operator_name).filter(Boolean));
            const operatorsNames = operatorsSet.size > 0 ? Array.from(operatorsSet).join(', ') : 'Sistema';

            dailyHistory[dateStr] = {
                dateStr,
                prevAccumulated: runningAccumulatedBalance,
                float: totalFloat,
                openingBalance,
                inflow,
                outflow,
                finalBalance,
                session: {
                    operator_name: operatorsNames,
                    opened_at: new Date(dateStr + 'T12:00:00Z'),
                    total_sales_cash: dayOrders.filter(o => o.paymentMethod === PaymentMethod.CASH).reduce((s,o) => s+o.total, 0),
                    total_sales_card: dayOrders.filter(o => o.paymentMethod === PaymentMethod.CARD).reduce((s,o) => s+o.total, 0),
                    total_sales_pix: dayOrders.filter(o => o.paymentMethod === PaymentMethod.PIX).reduce((s,o) => s+o.total, 0),
                    total_expenses: outflow,
                    starting_balance: totalFloat,
                    final_balance: finalBalance
                }
            };
            
            runningAccumulatedBalance = finalBalance;
        });

        return dailyHistory;
    }, [orders, expenses, allCashierSessions]);

    const dailyDataView = useMemo(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        let days = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const data = historicalData[dateStr];
            
            if (data) {
                days.push(data);
            } else {
                const pastDates = Object.keys(historicalData).filter(dt => dt < dateStr).sort();
                const lastBalance = pastDates.length > 0 ? historicalData[pastDates[pastDates.length - 1]].finalBalance : 0;
                
                days.push({
                    dateStr,
                    day: d,
                    prevAccumulated: lastBalance,
                    float: 0,
                    openingBalance: lastBalance,
                    inflow: 0,
                    outflow: 0,
                    finalBalance: lastBalance,
                    empty: true
                });
            }
        }

        const todayStr = new Date().toLocaleDateString('en-CA'); 
        if (isTodayOnly) return days.filter(d => d.dateStr === todayStr);
        return days.reverse();
    }, [historicalData, selectedMonth, selectedYear, isTodayOnly]);

    const monthSummary = useMemo(() => {
        const currentMonthData = dailyDataView.filter(d => !d.empty);
        const totalIn = currentMonthData.reduce((s, d) => s + d.inflow, 0);
        const totalOut = currentMonthData.reduce((s, d) => s + d.outflow, 0);
        const lastDay = dailyDataView[0]; 
        return { totalIn, totalOut, finalBalance: lastDay?.finalBalance || 0 };
    }, [dailyDataView]);

    return (
        <div className="space-y-10 pb-20 text-left">
            {isDetailModalOpen && <CashierDetailModal session={isDetailModalOpen} onClose={() => setIsDetailModalOpen(null)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none uppercase">
                        {viewMode === 'operator' ? 'Operação de Caixa' : 'Fluxo de Caixa Diário'}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                        {viewMode === 'operator' ? 'Controle de entradas e saídas do seu turno atual.' : 'Controle histórico com arraste de saldo acumulado.'}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Botão de Alternância para Admins */}
                    {isAdmin && (
                        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100 mr-4">
                            <button 
                                onClick={() => setViewMode('bi')}
                                className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'bi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                            >
                                Visão BI Histórica
                            </button>
                            <button 
                                onClick={() => setViewMode('operator')}
                                className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'operator' ? 'bg-[#E6005C] text-white shadow-md' : 'text-gray-400'}`}
                            >
                                Caixa do Dia (Operar)
                            </button>
                        </div>
                    )}

                    {viewMode === 'bi' && (
                        <>
                            <button 
                                onClick={() => setIsTodayOnly(!isTodayOnly)}
                                className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center ${isTodayOnly ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span className={`mr-2 h-2 w-2 rounded-full ${isTodayOnly ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></span>
                                {isTodayOnly ? 'Ver Mês Completo' : 'Hoje'}
                            </button>

                            <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent border-none font-black text-xs uppercase cursor-pointer outline-none">{months.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
                                <div className="w-px h-4 bg-gray-200"></div>
                                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent border-none font-black text-xs cursor-pointer outline-none">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'operator' ? (
                <ShiftOperatorView 
                    currentSession={currentCashierSession}
                    currentTotals={currentTotals}
                    startingBalance={startingBalanceInput}
                    setStartingBalance={setStartingBalanceInput}
                    onOpen={handleOpenSession}
                    onCloseShift={handleCloseSession}
                    loading={loading}
                />
            ) : (
                <>
                    {/* Resumo do Mês Selecionado */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Entradas {isTodayOnly ? '(Hoje)' : '(Mês)'}</p>
                            <p className="text-4xl font-black text-green-600 tracking-tighter leading-none">+{monthSummary.totalIn.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Saídas {isTodayOnly ? '(Hoje)' : '(Mês)'}</p>
                            <p className="text-4xl font-black text-red-600 tracking-tighter leading-none">-{monthSummary.totalOut.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                        <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-all">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Saldo Consolidado Período</p>
                            <p className="text-4xl font-black text-white tracking-tighter leading-none">{monthSummary.finalBalance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                        </div>
                    </div>

                    <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                        {dailyDataView.length > 0 ? dailyDataView.map((day) => (
                            <div key={day.dateStr} className={`bg-white rounded-[2.5rem] shadow-sm border overflow-hidden hover:shadow-xl transition-all ${day.empty ? 'opacity-40 grayscale border-gray-50' : 'border-gray-100'} ${isTodayOnly ? 'ring-4 ring-orange-100 border-orange-200' : ''}`}>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
                                    <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-50 pb-6 md:pb-0">
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter uppercase">DIA {new Date(day.dateStr + 'T12:00:00Z').getDate().toString().padStart(2, '0')}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{new Date(day.dateStr + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                                    </div>
                                    
                                    <div className="md:col-span-3">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Composição de Abertura</p>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                                                <span>Saldo Acumulado Ontem:</span>
                                                <span>{day.prevAccumulated.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px] font-bold text-orange-500 uppercase tracking-tighter">
                                                <span>(+) Soma dos Fundos:</span>
                                                <span>{day.float.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-black text-gray-900 border-t border-gray-100 pt-2 uppercase tracking-tighter">
                                                <span>(=) Saldo Inicial Dia:</span>
                                                <span>{day.openingBalance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-4 grid grid-cols-2 gap-6 border-l border-r border-gray-50 px-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Entradas (+)</p>
                                            <p className="text-2xl font-black text-green-600 tracking-tighter">{day.inflow.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Saídas (-)</p>
                                            <p className="text-2xl font-black text-red-600 tracking-tighter">{day.outflow.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">VALOR EM CAIXA</p>
                                        <p className={`text-2xl font-black tracking-tighter leading-none mb-4 ${day.finalBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>{day.finalBalance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                        {!day.empty && (
                                            <button onClick={() => setIsDetailModalOpen(day.session)} className="w-full bg-white border border-gray-200 text-gray-600 font-black py-3 rounded-xl text-[9px] uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm active:scale-95">DETALHES DO DIA</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100 text-center">
                                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Nenhuma movimentação registrada para este período.</p>
                                {isTodayOnly && <button onClick={() => setIsTodayOnly(false)} className="mt-4 text-[#E6005C] font-black text-[10px] uppercase tracking-widest hover:underline">Ver mês completo</button>}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CashFlowPage;
