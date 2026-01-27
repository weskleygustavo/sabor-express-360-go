
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PaymentMethod, CartItem, User, OrderType, OrderStatus } from '../../types';
import { CustomerPage } from './CustomerView';
import { XIcon } from '../../components/icons';

interface CheckoutPageProps {
    // Atualizado para aceitar modo forçado de vendas
    setPage: (page: CustomerPage, forceSalesMode?: boolean) => void;
    isSalesTerminal?: boolean; 
}

const paymentMethodDetails = {
    [PaymentMethod.PIX]: { icon: '❖', text: 'PIX' },
    [PaymentMethod.CARD]: { icon: '💳', text: 'Cartão' },
    [PaymentMethod.CASH]: { icon: '💵', text: 'Dinheiro' },
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ setPage, isSalesTerminal = false }) => {
    const { user, cart, removeFromCart, getCartTotal, restaurant, placeOrder, tables } = useApp();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
    const [cashAmount, setCashAmount] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmAddress, setConfirmAddress] = useState(true);
    const [orderType, setOrderType] = useState<OrderType>(OrderType.DELIVERY);
    const [selectedTableId, setSelectedTableId] = useState<string>('');

    const [isManualAddress, setIsManualAddress] = useState(false);
    const [manualAddress, setManualAddress] = useState({
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        reference: ''
    });

    const isPersonalOrder = !isSalesTerminal;
    const isRegularCustomer = user?.role === 'customer';
    const isCook = !!user?.isCook;
    const isCashier = !!user?.isCashier;
    const isWaiter = !!user?.isWaiter;
    const isAdmin = user?.role === 'admin';
    
    const forceDeliveryOnly = isPersonalOrder && (isRegularCustomer || (isCook && !isCashier && !isAdmin));

    const availableTables = useMemo(() => tables, [tables]);

    useEffect(() => {
        if (forceDeliveryOnly) {
            setOrderType(OrderType.DELIVERY);
        }
    }, [forceDeliveryOnly]);

    useEffect(() => {
        if(orderType === OrderType.DINE_IN && availableTables.length > 0 && !selectedTableId){
            setSelectedTableId(availableTables[0].id);
        }
    }, [orderType, availableTables, selectedTableId]);
    
    useEffect(() => {
        if (orderType === OrderType.DINE_IN) {
            setPaymentMethod(PaymentMethod.CASH);
        }
    }, [orderType]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = getCartTotal(orderType);

    const isProfileComplete = (currentUser: User | null): boolean => {
        if (!currentUser) return false;
        const { name, whatsapp, address } = currentUser;
        if (!name || !whatsapp || !address) return false;
        const { street, number, neighborhood, city, state, referencePoint } = address;
        return !!(street && number && neighborhood && city && state && referencePoint);
    };

    const handlePlaceOrder = async () => {
        if (orderType === OrderType.DELIVERY) {
            if (isSalesTerminal && isManualAddress) {
                if (!manualAddress.street || !manualAddress.number || !manualAddress.neighborhood) {
                    alert('Por favor, preencha o endereço completo do cliente.');
                    return;
                }
            } else if (!isSalesTerminal) {
                if (!isProfileComplete(user)) {
                    alert('Por favor, preencha seu endereço no perfil para receber seu pedido pessoal.');
                    setPage('profile' as any);
                    return;
                }
                if (!confirmAddress) {
                    alert('Confirme seu endereço de entrega.');
                    return;
                }
            }
        }

        if (orderType === OrderType.DINE_IN && !selectedTableId) {
            alert('Por favor, selecione uma mesa.');
            return;
        }

        setLoading(true);
        try {
            const tag = isSalesTerminal ? '[VENDA_LOJA] ' : '';
            let content = '';

            if (isSalesTerminal && isManualAddress) {
                const addrStr = `📍 ENDEREÇO CLIENTE: ${manualAddress.street}, ${manualAddress.number} - ${manualAddress.neighborhood} (${manualAddress.city}). REF: ${manualAddress.reference}`;
                content = `${addrStr}\n---\nOBS: ${orderNotes}`;
            } else {
                content = orderNotes;
            }

            const finalNotes = `${tag}${content}`.trim();

            await placeOrder({
                paymentMethod, 
                orderType,
                tableId: orderType === OrderType.DINE_IN ? selectedTableId : undefined,
                changeFor: (paymentMethod === PaymentMethod.CASH && orderType === OrderType.DELIVERY) ? parseFloat(cashAmount) : undefined,
                notes: finalNotes
            });
            
            alert('Pedido realizado com sucesso!');
            
            // LÓGICA DE REDIRECIONAMENTO INTELIGENTE:
            if (isAdmin || isCook) {
                // Gestores e Cozinheiros sempre voltam para a Produção para controle total
                setPage('dashboard' as any);
            } else if (isCashier || isWaiter) {
                // Operadores de Caixa e Garçons sempre voltam para o Terminal de Vendas (Modo Comercial)
                // mesmo que tenham acabado de pedir um lanche pessoal.
                setPage('order_menu' as any, true); // O 'true' força o modo Terminal
            } else {
                // Clientes puros seguem vendo seus pedidos
                setPage('orders' as any);
            }
            
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
            <div className="text-left mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                    {isSalesTerminal ? 'Terminal de Vendas' : 'Finalizar Meu Pedido'}
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                    {isSalesTerminal ? 'OPERANDO COMO ATENDENTE DE LOJA' : 'PEDIDO PARA CONSUMO PESSOAL (DELIVERY)'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-left">
                        <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest flex items-center">
                             <span className="mr-3">📦</span> Itens do Pedido
                        </h2>
                        <ul className="divide-y divide-gray-50">
                            {cart.map((item: CartItem) => (
                                <li key={item.id} className="py-5 flex items-center justify-between group">
                                    <div className="flex items-center space-x-5">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                        <div className="min-w-0">
                                            <p className="font-black text-gray-900 leading-none mb-1 truncate">{item.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.quantity} x {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                       <p className="font-black text-gray-900 text-sm">{(item.quantity * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                       <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-xl transition-all"><XIcon className="w-5 h-5"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-left">
                        <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest flex items-center">
                             <span className="mr-3">📝</span> Observações Adicionais
                        </h2>
                        <textarea 
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Sem gelo, Mal passado, Molho extra..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-gray-800 focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none min-h-[100px]"
                        />
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-left">
                        {!forceDeliveryOnly && (
                            <div className="space-y-6 mb-8">
                                <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest flex items-center">
                                    <span className="mr-3">🛎️</span> Local de Consumo
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setOrderType(OrderType.DELIVERY)} 
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center space-y-2 ${orderType === OrderType.DELIVERY ? 'border-[#FF8C00] bg-orange-50/50 shadow-md' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                                    >
                                        <span className="text-2xl">🛵</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${orderType === OrderType.DELIVERY ? 'text-[#FF8C00]' : ''}`}>Delivery</span>
                                    </button>
                                    <button 
                                        onClick={() => setOrderType(OrderType.DINE_IN)} 
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center space-y-2 ${orderType === OrderType.DINE_IN ? 'border-[#E6005C] bg-red-50/50 shadow-md' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                                    >
                                        <span className="text-2xl">🍽️</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${orderType === OrderType.DINE_IN ? 'text-[#E6005C]' : ''}`}>No Local (Mesa)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div>
                        {orderType === OrderType.DELIVERY && (
                            <div className="space-y-6">
                                {forceDeliveryOnly && (
                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className="bg-[#FF8C00] text-white p-2 rounded-lg text-xs">🛵</span>
                                        <span className="text-xs font-black text-[#FF8C00] uppercase tracking-widest">Modalidade: Apenas Delivery</span>
                                    </div>
                                )}
                                
                                {isSalesTerminal ? (
                                    <div className="space-y-4">
                                        {!isManualAddress ? (
                                            <button 
                                                onClick={() => setIsManualAddress(true)}
                                                className="w-full bg-blue-50 text-blue-600 border border-blue-100 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all"
                                            >
                                                ➕ ADICIONAR ENDEREÇO DO CLIENTE
                                            </button>
                                        ) : (
                                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 animate-in fade-in">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Endereço de Entrega Manual</h4>
                                                    <button onClick={() => setIsManualAddress(false)} className="text-red-500 font-black text-[9px] uppercase">Remover</button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <input placeholder="Rua / Logradouro" value={manualAddress.street} onChange={e => setManualAddress({...manualAddress, street: e.target.value})} className="col-span-2 p-3 bg-white rounded-xl border border-gray-200 font-bold text-xs" />
                                                    <input placeholder="Nº" value={manualAddress.number} onChange={e => setManualAddress({...manualAddress, number: e.target.value})} className="p-3 bg-white rounded-xl border border-gray-200 font-bold text-xs" />
                                                    <input placeholder="Bairro" value={manualAddress.neighborhood} onChange={e => setManualAddress({...manualAddress, neighborhood: e.target.value})} className="p-3 bg-white rounded-xl border border-gray-200 font-bold text-xs" />
                                                    <input placeholder="Cidade" value={manualAddress.city} onChange={e => setManualAddress({...manualAddress, city: e.target.value})} className="p-3 bg-white rounded-xl border border-gray-200 font-bold text-xs" />
                                                    <input placeholder="Ponto de Referência" value={manualAddress.reference} onChange={e => setManualAddress({...manualAddress, reference: e.target.value})} className="p-3 bg-white rounded-xl border border-gray-200 font-bold text-xs" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    user?.address?.street ? (
                                        <div className="p-6 rounded-[2rem] bg-orange-50/30 border border-orange-100 flex items-start space-x-5">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl shrink-0">🏠</div>
                                            <div>
                                                <p className="font-black text-gray-900 leading-none mb-2">Meu Endereço de Entrega</p>
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                                                    {`${user.address.street}, ${user.address.number} - ${user.address.neighborhood}`}
                                                </p>
                                                <label className="flex items-center mt-4 cursor-pointer select-none">
                                                    <input type="checkbox" checked={confirmAddress} onChange={() => setConfirmAddress(!confirmAddress)} className="h-5 w-5 text-[#FF8C00] rounded-lg" />
                                                    <span className="ml-3 text-[10px] text-gray-700 font-black uppercase">Confirmar Endereço</span>
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center py-4 text-red-500 font-black text-xs">Cadastre seu endereço no perfil para pedir!</p>
                                    )
                                )}
                            </div>
                        )}

                        {orderType === OrderType.DINE_IN && !forceDeliveryOnly && (
                             <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selecione a Mesa</label>
                                <select value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-black text-gray-900 focus:ring-4 focus:ring-orange-50 appearance-none outline-none">
                                    {availableTables.map(table => <option key={table.id} value={table.id}>{table.name}</option>)}
                                </select>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-left">
                        <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest">Financeiro</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase">
                                <span>Subtotal</span>
                                <span className="text-gray-900 font-black">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            {orderType === OrderType.DELIVERY && (
                                <div className="flex justify-between text-[11px] font-bold text-green-600 uppercase">
                                    <span>Entrega</span>
                                    <span className="font-black">{(restaurant?.deliveryFee || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-50 pt-5 mt-5">
                                <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">TOTAL</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tighter">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                    </div>
                     
                    {orderType === OrderType.DELIVERY && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-left">
                            <h2 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest">Pagamento</h2>
                            <div className="space-y-3">
                                {Object.values(PaymentMethod).map(method => (
                                    <button 
                                        key={method} 
                                        onClick={() => setPaymentMethod(method)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentMethod === method ? 'border-[#E6005C] bg-red-50' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl">{paymentMethodDetails[method].icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{paymentMethodDetails[method].text}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {paymentMethod === PaymentMethod.CASH && (
                                <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block">Troco para quanto?</label>
                                    <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-lg font-black outline-none" />
                                </div>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={handlePlaceOrder} 
                        disabled={loading} 
                        className={`w-full text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50 ${isSalesTerminal ? 'bg-gray-900' : 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C]'}`}
                    >
                        {loading ? 'Processando...' : isSalesTerminal ? 'CONCLUIR VENDA' : 'PEDIR AGORA'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
