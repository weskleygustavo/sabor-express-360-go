
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Restaurant } from '../types';
import { useApp } from '../contexts/AppContext';

interface CustomerLoginPageProps {
    restaurant: Restaurant;
}

const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({ restaurant }) => {
    const { setRoute } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                if (!name.trim()) throw new Error("Seu nome é obrigatório.");

                const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
                if (authError) throw authError;
                if (!authData.user) throw new Error("Erro ao gerar conta.");

                // Vincula o usuário como CONSUMER do restaurante específico
                const { error: profileError } = await supabase.from('profiles').update({
                    name: name,
                    restaurant_id: restaurant.id,
                    role: 'customer'
                }).eq('id', authData.user.id);

                if (profileError) throw profileError;
                alert("Cadastro realizado! Verifique seu e-mail ou faça login.");
                setIsSignUp(false);
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                // O AppContext cuidará do redirecionamento após o login
            }
        } catch (err: any) {
            setError(err.message || 'Erro na comunicação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 border border-gray-100">
                <div className="text-center space-y-4">
                    <img src={restaurant.profilePhotoUrl} className="w-24 h-24 rounded-full mx-auto shadow-lg border-4 border-white" alt="Logo" />
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{restaurant.name}</h1>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Acesse sua conta para pedir</p>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    {isSignUp && (
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Seu Nome Completo</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-50 outline-none transition-all font-bold"
                                placeholder="João Silva" />
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">E-mail</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-50 outline-none transition-all font-bold"
                            placeholder="seu@email.com" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Senha</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-50 outline-none transition-all font-bold"
                            placeholder="••••••••" />
                        
                        {!isSignUp && (
                            <div className="text-right mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setRoute('/forgot-password')} 
                                    className="text-[10px] font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest transition-colors"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-xs text-red-500 text-center font-bold">{error}</p>}
                    
                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-5 rounded-2xl shadow-xl text-xs font-black text-white bg-gradient-to-r from-[#FF8C00] to-[#E6005C] hover:scale-[1.02] transition-all disabled:opacity-50 uppercase tracking-widest">
                        {loading ? '...' : (isSignUp ? 'Criar Conta Grátis' : 'Entrar no Cardápio')}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-widest">
                        {isSignUp ? 'Já tem conta? Faça Login' : 'Não tem conta? Cadastre-se agora'}
                    </button>
                </div>
            </div>
            
            <p className="mt-8 text-[9px] font-black text-gray-300 uppercase tracking-widest">Powered by Sabor Express 360</p>
        </div>
    );
};

export default CustomerLoginPage;
