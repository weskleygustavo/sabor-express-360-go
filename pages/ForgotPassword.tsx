
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { UtensilsIcon } from '../components/icons';
import { useApp } from '../contexts/AppContext';

const ForgotPasswordPage: React.FC = () => {
    const { setRoute } = useApp();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // CORREÇÃO: A URL de redirecionamento não deve conter o '#'.
        // O Supabase irá adicionar seu próprio fragmento (#access_token=...) para o evento de recuperação.
        // O listener `onAuthStateChange` no AppContext irá capturar esse evento e definir a rota correta.
        // Isso funciona tanto em desenvolvimento quanto em produção (Vercel).
        const redirectTo = window.location.origin;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });
            if (error) throw error;
            setMessage('Um link para redefinir sua senha foi enviado para o seu e-mail.');
        } catch (error: any) {
            setError(error.message || 'Não foi possível enviar o e-mail de redefinição.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-orange-500 p-3 rounded-full text-white">
                        <UtensilsIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Redefinir Senha</h1>
                    <p className="text-gray-500">Digite seu e-mail para receber o link de redefinição.</p>
                </div>
                
                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="seu@email.com" />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                    {message && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-lg">{message}</p>}
                    
                    <div>
                        <button type="submit" disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300">
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <button onClick={() => setRoute('/')} className="font-medium text-orange-600 hover:text-orange-500">
                        Voltar para o Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
