
import React, { useState } from 'react';
import CustomerHeader from '../../components/customer/CustomerHeader';
import HomePage from './HomePage';
import OrdersPage from './OrdersPage';
import ProfilePage from './ProfilePage';
import CheckoutPage from './CheckoutPage';
import CustomerFooter from '../../components/customer/CustomerFooter';

export type CustomerPage = 'home' | 'orders' | 'profile' | 'checkout';

const CustomerView: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<CustomerPage>('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden min-h-[80vh] shadow-sm">
                        <div className="p-8 border-b border-gray-50 text-left">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Fazer meu Pedido Pessoal</h2>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Pedido de consumo próprio (Apenas Delivery).</p>
                        </div>
                        <HomePage onCheckout={() => setCurrentPage('checkout')} />
                    </div>
                );
            case 'orders':
                return <OrdersPage />;
            case 'profile':
                return <ProfilePage />;
            case 'checkout':
                return <CheckoutPage setPage={setCurrentPage} isSalesTerminal={false} />;
            default:
                return <HomePage onCheckout={() => setCurrentPage('checkout')} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <CustomerHeader currentPage={currentPage} setPage={setCurrentPage} />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
                <div key={currentPage} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderPage()}
                </div>
            </main>
            <CustomerFooter />
        </div>
    );
};

export default CustomerView;
