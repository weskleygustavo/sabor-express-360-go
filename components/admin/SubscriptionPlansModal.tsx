import React from 'react';
import { supabase } from '../../supabaseClient';
import { XIcon } from '../icons';

interface SubscriptionPlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId?: string;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({ isOpen, onClose, restaurantId }) => {
    if (!isOpen) return null;

    const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
        try {
            const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
                body: {
                    planType,
                    restaurantId
                }
            });
            if (error) throw error;
            if (data?.url) window.location.href = data.url;
        } catch (e: any) {
            alert('Erro ao iniciar pagamento: ' + e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Renovar Assinatura</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plano Mensal */}
                    <button
                        onClick={() => handleSubscribe('monthly')}
                        className="group relative w-full bg-gray-50 hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 rounded-3xl p-6 transition-all duration-300 text-left"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-orange-500">Plano Mensal</span>
                            <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">30 Dias</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-black text-gray-900">R$ 59,99</span>
                            <span className="text-sm font-bold text-gray-400">/mês</span>
                        </div>
                    </button>

                    {/* Plano Anual */}
                    <button
                        onClick={() => handleSubscribe('yearly')}
                        className="group relative w-full bg-gradient-to-br from-gray-900 to-gray-800 hover:from-orange-600 hover:to-red-600 rounded-3xl p-6 transition-all duration-300 text-left text-white shadow-xl transform hover:scale-[1.02]"
                    >
                        <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wide">
                            Mais Popular
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-white/80">Plano Anual</span>
                            <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-sm">365 Dias</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-black text-white">R$ 449,99</span>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-white/80">/ano</span>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                        Pagamento seguro via Stripe
                    </p>
                </div>
            </div>
        </div>
    );
};
