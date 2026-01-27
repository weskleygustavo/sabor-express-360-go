
import React from 'react';
import { useApp } from '../../contexts/AppContext';

const CustomerFooter: React.FC = () => {
    const { restaurant } = useApp();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white mt-8">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
                 <p className="text-sm">
                    {restaurant?.name || 'Sabor Express 360'} &copy; {currentYear} - COPYRIGHT. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
};

export default CustomerFooter;
