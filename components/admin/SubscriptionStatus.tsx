import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ClockIcon, ActivityIcon } from '../icons';
import { SubscriptionPlansModal } from './SubscriptionPlansModal';

interface SubscriptionStatusProps {
    variant?: 'default' | 'mini';
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ variant = 'default' }) => {
    const { restaurant, isSubscriptionActive } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const subscriptionInfo = useMemo(() => {
        if (!restaurant) return null;

        const now = new Date();
        // Preferência para assinatura ativa, fallback para trial
        const endDateIso = restaurant.subscription_active_until || restaurant.trial_ends_at;

        if (!endDateIso) return { days: 0, isExpired: true };

        const endDate = new Date(endDateIso);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            days: diffDays,
            isExpired: diffDays <= 0,
            isWarning: diffDays <= 3 && diffDays > 0,
            date: endDate
        };
    }, [restaurant]);

    if (!subscriptionInfo) return null;

    const { days, isWarning, isExpired } = subscriptionInfo;

    // Se for MINI (Topo do Sidebar)
    if (variant === 'mini') {
        return (
            <>
                <div className="w-full flex flex-col items-center justify-center mb-6">
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className={`
                        cursor-pointer group flex flex-col items-center justify-center 
                        px-4 py-2 rounded-xl border transition-all duration-300 w-full relative overflow-hidden
                        ${isExpired
                                ? 'bg-red-50 border-red-100 hover:bg-red-100'
                                : isWarning
                                    ? 'bg-red-50 border-red-200 shadow-sm animate-pulse hover:bg-red-100'
                                    : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 hover:shadow-md'
                            }
                    `}>
                        <div className="flex items-center space-x-1.5 mb-1">
                            {isWarning || isExpired ? (
                                <ActivityIcon className={`w-3 h-3 ${isExpired || isWarning ? 'text-red-500' : 'text-indigo-500'}`} />
                            ) : (
                                <ClockIcon className="w-3 h-3 text-indigo-500" />
                            )}
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isExpired || isWarning ? 'text-red-500' : 'text-indigo-600'}`}>
                                {isExpired ? 'Expirado' : 'Assinatura'}
                            </span>
                        </div>

                        <div className="flex items-baseline space-x-1">
                            <span className={`text-2xl font-black leading-none ${isExpired || isWarning ? 'text-red-600' : 'text-gray-900 group-hover:text-indigo-600 transition-colors'}`}>
                                {days > 0 ? days : 0}
                            </span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                Dias
                            </span>
                        </div>

                        {/* Tooltip text on hover/active could be added here if needed, or simple "Renovar" label */}
                        <div className={`mt-1 text-[8px] font-bold uppercase tracking-wider ${isExpired || isWarning ? 'text-red-500' : 'text-indigo-400 group-hover:text-indigo-600'}`}>
                            Renovar
                        </div>
                    </div>
                </div>

                <SubscriptionPlansModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    restaurantId={restaurant?.id}
                />
            </>
        );
    }

    // Default (Antigo - Rodapé)
    return (
        <>
            <div className="px-4 py-2 w-full">
                <div className={`
                    w-full rounded-2xl p-4 flex flex-col items-center text-center space-y-3 border transition-all duration-300
                    ${isExpired
                        ? 'bg-red-50 border-red-100'
                        : isWarning
                            ? 'bg-red-50 border-red-200 shadow-sm animate-pulse'
                            : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100'
                    }
                `}>
                    <div className="flex items-center space-x-2">
                        {isWarning || isExpired ? (
                            <ActivityIcon className={`w-4 h-4 ${isExpired || isWarning ? 'text-red-500' : 'text-indigo-500'}`} />
                        ) : (
                            <ClockIcon className="w-4 h-4 text-indigo-500" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isExpired || isWarning ? 'text-red-500' : 'text-indigo-600'}`}>
                            {isExpired ? 'Assinatura Expirada' : 'Assinatura Ativa'}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className={`text-4xl font-black leading-none ${isExpired || isWarning ? 'text-red-600' : 'text-gray-900'}`}>
                            {days > 0 ? days : 0}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Dias Restantes
                        </span>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`
                            w-full py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95
                            ${isExpired || isWarning
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
                                : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 hover:shadow-md'
                            }
                        `}
                    >
                        Renovar Agora
                    </button>
                </div>
            </div>

            <SubscriptionPlansModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                restaurantId={restaurant?.id}
            />
        </>
    );
};
