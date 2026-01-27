
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useApp } from '../contexts/AppContext';
import { UtensilsIcon } from '../components/icons';

const UpdatePasswordPage: React.FC = () => {
    const { session, setRoute, logout } = useApp();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // O cliente Supabase no AppContext já deve ter processado o hash da URL
        // e estabelecido uma sessão se o token for válido.
        if (!session) {
            // Se não houver sessão, o link pode ser inválido ou expirado.
            setError("Link de redefinição inválido ou expirado. Por favor, solicite um novo link.");
        }
    }, [session]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            setError("Sessão não encontrada. Não é possível atualizar a senha.");
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage('Senha atualizada com sucesso! Agora você deve fazer login com sua nova senha.');
            
            // Força o logout da sessão de recuperação e redireciona para o login.
            setTimeout(async () => {
                await logout();
                // O logout já redireciona a rota para '/', então não precisamos de outro setRoute.
            }, 3000);

        } catch (error: any) {
            setError(error.message || 'Não foi possível atualizar a senha.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!session) {
         return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                 <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Erro</h1>
                    <p className="text-red-600">{error || "Verificando o link..."}</p>
                     <button onClick={() => setRoute('/')} className="font-medium text-orange-600 hover:text-orange-500">
                        Ir para o Login
                    </button>
                 </div>
            </div>
         )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-orange-500 p-3 rounded-full text-white">
                        <UtensilsIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Crie uma Nova Senha</h1>
                    <p className="text-gray-500">Digite sua nova senha abaixo.</p>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Nova Senha</label>
                        <input id="password" name="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Pelo menos 6 caracteres" />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                    {message && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-lg">{message}</p>}
                    
                    <div>
                        <button type="submit" disabled={loading || !!message}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300">
                            {loading ? 'Atualizando...' : 'Atualizar Senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
