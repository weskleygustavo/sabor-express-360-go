
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { XIcon, SearchIcon, PrinterIcon } from '../../components/icons';
import PrintableFinanceReport from '../../components/admin/PrintableFinanceReport';

const AccountsPayablePage: React.FC = () => {
    const { expenseCategories, expenses, addExpenseCategory, deleteExpenseCategory, addExpense, payExpense, deleteExpense, restaurant } = useApp();
    
    // UI State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<Expense | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [newCatName, setNewCatName] = useState('');
    const [selectedCatId, setSelectedCatId] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [dueDate, setDueDate] = useState('');
    const [paymentDateInput, setPaymentDateInput] = useState(new Date().toISOString().split('T')[0]);

    // Filters
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const matchesCat = filterCategory === 'all' || exp.category_id === filterCategory;
            const matchesDateFrom = !dateFrom || exp.due_date >= dateFrom;
            const matchesDateTo = !dateTo || exp.due_date <= dateTo;
            
            const isPaid = !!exp.payment_date;
            const isOverdue = !isPaid && exp.due_date < todayStr;
            
            let matchesStatus = true;
            if (filterStatus === 'pending') matchesStatus = !isPaid;
            if (filterStatus === 'paid') matchesStatus = isPaid;
            if (filterStatus === 'overdue') matchesStatus = isOverdue;
            if (filterStatus === 'early') matchesStatus = isPaid && exp.payment_date! < exp.due_date;
            if (filterStatus === 'ontime') matchesStatus = isPaid && exp.payment_date === exp.due_date;
            if (filterStatus === 'late') matchesStatus = isPaid && exp.payment_date! > exp.due_date;

            return matchesCat && matchesDateFrom && matchesDateTo && matchesStatus;
        });
    }, [expenses, filterCategory, filterStatus, dateFrom, dateTo, todayStr]);

    const handleAddCategory = async () => {
        if (!newCatName) return;
        setLoading(true);
        try {
            await addExpenseCategory(newCatName);
            setNewCatName('');
        } catch (e) { alert(e); } finally { setLoading(false); }
    };

    const handleAddExpense = async () => {
        if (!selectedCatId || !amount || !dueDate) return;
        setLoading(true);
        try {
            await addExpense({ category_id: selectedCatId, amount: Number(amount), due_date: dueDate });
            setIsExpenseModalOpen(false);
            setAmount('');
            setDueDate('');
        } catch (e) { alert(e); } finally { setLoading(false); }
    };

    const handleConfirmPayment = async () => {
        if (!isPaymentModalOpen || !paymentDateInput) return;
        setLoading(true);
        try {
            await payExpense(isPaymentModalOpen.id, paymentDateInput);
            setIsPaymentModalOpen(null);
        } catch (e) { alert(e); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 md:space-y-10 pb-20 w-full overflow-hidden">
            {isPrinting && (
                <PrintableFinanceReport 
                    data={filteredExpenses} 
                    restaurantName={restaurant?.name || 'Sabor Express'} 
                    onClose={() => setIsPrinting(false)} 
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left w-full">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">Contas a Pagar</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                        Controle financeiro e fluxo de despesas.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsPrinting(true)}
                        className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-600 font-black py-3 px-4 md:py-4 md:px-6 rounded-2xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest shadow-sm flex items-center justify-center"
                    >
                        <PrinterIcon className="w-4 h-4 mr-2" /> RELATÓRIO
                    </button>
                    <button onClick={() => setIsCategoryModalOpen(true)} className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-600 font-black py-3 px-4 md:py-4 md:px-6 rounded-2xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">
                        + CATEGORIA
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="w-full md:w-auto bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-3 px-4 md:py-4 md:px-8 rounded-2xl shadow-xl shadow-orange-100 hover:scale-105 transition-all text-[10px] uppercase tracking-widest active:scale-95">
                        + LANÇAR DESPESA
                    </button>
                </div>
            </div>

            {/* Filtros Avançados */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Filtros de Busca</h3>
                    <button onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setDateFrom(''); setDateTo(''); }} className="text-[9px] font-black text-red-500 uppercase">Limpar</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Categoria</label>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-orange-100 outline-none">
                            <option value="all">Todas</option>
                            {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Status</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-orange-100 outline-none">
                            <option value="all">Todos os Status</option>
                            <option value="pending">Pendentes</option>
                            <option value="paid">Pagas</option>
                            <option value="overdue">Atrasadas 🔴</option>
                            <option value="early">Pagas Antecipadas</option>
                            <option value="ontime">Pagas no Prazo</option>
                            <option value="late">Pagas com Atraso</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">De (Vencimento)</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-orange-100 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter ml-1">Até (Vencimento)</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-orange-100 outline-none" />
                    </div>
                </div>
            </div>

            {/* Grid de Despesas */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[11px] font-black uppercase text-gray-400 tracking-widest">
                                <th className="p-6">Status</th>
                                <th className="p-6">Despesa (Categoria)</th>
                                <th className="p-6 text-right">Valor</th>
                                <th className="p-6 text-center">Vencimento</th>
                                <th className="p-6 text-center">Pagamento</th>
                                <th className="p-6 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredExpenses.map(exp => {
                                const isPaid = !!exp.payment_date;
                                const isOverdue = !isPaid && exp.due_date < todayStr;
                                let statusLabel = "Pendente";
                                let statusColor = "bg-gray-100 text-gray-400";
                                
                                if (isOverdue) {
                                    statusLabel = "Atrasada 🔴";
                                    statusColor = "bg-red-50 text-red-500 ring-1 ring-red-100";
                                } else if (isPaid) {
                                    if (exp.payment_date! < exp.due_date) {
                                        statusLabel = "Antecipada";
                                        statusColor = "bg-blue-50 text-blue-600";
                                    } else if (exp.payment_date === exp.due_date) {
                                        statusLabel = "Em Dia";
                                        statusColor = "bg-green-50 text-green-600";
                                    } else {
                                        statusLabel = "Paga (Atraso)";
                                        statusColor = "bg-orange-50 text-orange-600";
                                    }
                                }

                                return (
                                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="p-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-gray-900 text-base">{exp.category?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase mt-0.5">Ref: {exp.id.slice(0,8)}</p>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="font-black text-gray-900 text-base">
                                                {exp.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-sm font-bold text-gray-600">
                                                {new Date(exp.due_date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-sm font-bold text-gray-400 italic">
                                                {exp.payment_date ? new Date(exp.payment_date + 'T12:00:00Z').toLocaleDateString('pt-BR') : '---'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                {!isPaid && (
                                                    <button onClick={() => setIsPaymentModalOpen(exp)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-green-100">
                                                        Pagar
                                                    </button>
                                                )}
                                                <button onClick={() => { if(confirm('Excluir lançamento?')) deleteExpense(exp.id); }} className="text-gray-300 hover:text-red-500 transition-colors">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredExpenses.length === 0 && (
                    <div className="py-24 text-center">
                        <SearchIcon className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-300 font-black uppercase tracking-widest text-sm">Nenhuma despesa para os filtros aplicados</p>
                    </div>
                )}
            </div>

            {/* Modal: Categorias */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md text-left">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Categorias de Despesas</h2>
                            <button onClick={() => setIsCategoryModalOpen(false)}><XIcon className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="flex space-x-2 mb-6">
                            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ex: Energia, Água..." className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-100" />
                            <button onClick={handleAddCategory} className="bg-[#E6005C] text-white font-black px-6 rounded-2xl">+</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {expenseCategories.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="font-bold text-gray-700 text-sm">{c.name}</span>
                                    <button onClick={() => deleteExpenseCategory(c.id)} className="text-red-300 hover:text-red-500">🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Lançar Despesa */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md text-left">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Nova Despesa</h2>
                            <button onClick={() => setIsExpenseModalOpen(false)}><XIcon className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Categoria</label>
                                <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black">
                                    <option value="">Selecione...</option>
                                    {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Valor (R$)</label>
                                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Vencimento</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black" />
                                </div>
                            </div>
                            <button onClick={handleAddExpense} disabled={loading} className="w-full bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-100 uppercase tracking-widest text-xs">
                                {loading ? 'SALVANDO...' : 'LANÇAR DESPESA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Pagamento */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm text-left">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-gray-800 tracking-tighter">Registrar Pagamento</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Despesa: {isPaymentModalOpen.category?.name}</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Data do Pagamento</label>
                                <input type="date" value={paymentDateInput} onChange={e => setPaymentDateInput(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black" />
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => setIsPaymentModalOpen(null)} className="flex-1 text-gray-400 font-black uppercase text-[10px] tracking-widest">Voltar</button>
                                <button onClick={handleConfirmPayment} disabled={loading} className="flex-[2] bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 uppercase tracking-widest text-xs">
                                    {loading ? '...' : 'CONFIRMAR'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPayablePage;
