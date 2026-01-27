
import React from 'react';
import { XIcon, UtensilsIcon } from '../icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-500 mb-4">
                        <UtensilsIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Faça o Login</h2>
                    <p className="text-gray-600 mb-6">Você precisa estar logado para adicionar itens ao carrinho.</p>
                    <p className="text-sm text-gray-500">
                        Este é um app de demonstração. Por favor, faça o logout e entre com uma conta de cliente para continuar.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
