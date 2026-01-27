
import React from 'react';
import { OrderStatus } from '../../types';
import { ReceiptIcon, ChefHatIcon, BikeIcon, PackageCheckIcon, CheckIcon } from '../icons';

interface OrderStatusTrackerProps {
    currentStatus: OrderStatus;
}

const statusSteps = [
    OrderStatus.RECEIVED,
    OrderStatus.PREPARING,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
];

const statusDetails: { [key in OrderStatus]?: { icon: React.ReactNode; label: string } } = {
    [OrderStatus.RECEIVED]: { icon: <ReceiptIcon />, label: 'Pedido Recebido' },
    [OrderStatus.PREPARING]: { icon: <ChefHatIcon />, label: 'Em Preparo' },
    [OrderStatus.OUT_FOR_DELIVERY]: { icon: <BikeIcon />, label: 'Saiu p/ Entrega' },
    [OrderStatus.DELIVERED]: { icon: <PackageCheckIcon />, label: 'Entregue' },
};


const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
    const currentIndex = statusSteps.indexOf(currentStatus);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative px-2">
                {/* Linha de fundo */}
                <div className="absolute top-6 left-10 right-10 h-1 bg-gray-100 rounded-full -z-0"></div>
                
                {statusSteps.map((status, index) => {
                    if (!statusDetails[status]) return null;

                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    const circleClasses = isCompleted 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                        : isCurrent 
                            ? 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white shadow-xl shadow-orange-100' 
                            : 'bg-white text-gray-300 border-2 border-gray-100';

                    const textClasses = isCompleted || isCurrent
                        ? 'text-gray-900 font-black'
                        : 'text-gray-300 font-bold';

                    return (
                        <div key={status} className="flex flex-col items-center relative z-10 w-1/4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ${circleClasses} ${isCurrent && status !== OrderStatus.DELIVERED ? 'scale-110' : ''}`}>
                                {isCompleted ? (
                                    <CheckIcon className="w-6 h-6" />
                                ) : (
                                    React.cloneElement(statusDetails[status]!.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })
                                )}
                            </div>
                            <p className={`mt-4 text-[8px] uppercase tracking-widest text-center leading-tight transition-all duration-700 ${textClasses}`}>
                                {statusDetails[status]!.label}
                            </p>
                            {isCurrent && status !== OrderStatus.DELIVERED && (
                                <div className="mt-1 w-1 h-1 bg-orange-500 rounded-full animate-ping"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusTracker;
