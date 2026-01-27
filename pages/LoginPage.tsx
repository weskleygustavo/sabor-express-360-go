
import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useApp } from '../contexts/AppContext';

const LoginPage: React.FC = () => {
    const { restaurant, refreshData, setRoute } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [restaurantName, setRestaurantName] = useState(''); 
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isSignUp) {
                if (!restaurantName.trim()) throw new Error("O nome do restaurante é obrigatório.");

                // 1. Criar usuário no Auth do Supabase
                const { data: authData, error: authError } = await supabase.auth.signUp({ 
                    email, 
                    password
                });
                
                if (authError) {
                    if (authError.message.includes("already registered")) {
                        throw new Error("E-mail já cadastrado. Use o SQL Editor para limpar.");
                    }
                    throw authError;
                }
                
                if (!authData.user) throw new Error("Erro ao gerar conta de acesso.");

                // Calcula data de fim do trial (7 dias)
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + 7);

                // 2. Criar o Restaurante vinculado ao ID do usuário recém criado
                const { data: resData, error: resError } = await supabase.from('restaurant').insert({
                    name: restaurantName,
                    owner_id: authData.user.id,
                    address: 'Endereço não configurado',
                    operating_hours: '09:00 - 22:00',
                    delivery_fee: 0,
                    service_charge: 10,
                    delivery_time: '30-45 min',
                    trial_ends_at: trialEnd.toISOString()
                }).select().single();

                if (resError) {
                    console.error("Erro restaurante:", resError);
                    throw new Error("Não foi possível registrar o restaurante.");
                }

                // 3. Promover a Admin via RPC (Remote Procedure Call)
                const { error: rpcError } = await supabase.rpc('create_admin_restaurant', {
                    target_user_id: authData.user.id,
                    target_res_id: resData.id
                });

                if (rpcError) {
                    console.error("Erro promoção via RPC:", rpcError);
                    throw new Error("Erro de privilégios. Verifique se executou o script SQL.");
                }

                if (authData.session) {
                    setMessage('Restaurante cadastrado! Redirecionando para o painel em instantes...');
                    await refreshData(); 
                    // Refresh automático de 2 segundos conforme solicitado pelo usuário para sincronizar permissões
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    setMessage('Sucesso! Verifique seu e-mail para validar o acesso.');
                    setIsSignUp(false);
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message || 'Erro na comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const { topNames, highlightedName } = useMemo(() => {
        const fullTitle = isSignUp ? restaurantName : (restaurant?.name || 'Sabor Express 360');
        const parts = fullTitle.trim().split(/\s+/);
        if (parts.length === 1) return { topNames: [], highlightedName: parts[0] };
        const last = parts.pop() || '';
        return { topNames: parts, highlightedName: last };
    }, [restaurant?.name, restaurantName, isSignUp]);

    const gradientTextClass = "text-transparent bg-clip-text bg-gradient-to-br from-[#FF8C00] via-[#E6005C] to-[#C70039]";

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 border border-gray-50">
                <div className="flex items-center justify-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg">
                        {topNames[0]?.[0] || highlightedName?.[0] || 'S'}
                    </div>
                    <div className="flex flex-col text-left">
                        {topNames.length > 0 && (
                            <div className="flex flex-col -space-y-1">
                                {topNames.map((name, idx) => (
                                    <span key={idx} className="text-3xl font-black text-[#333] leading-none">{name}</span>
                                ))}
                            </div>
                        )}
                        <span className={`text-6xl font-black leading-none mt-1 ${gradientTextClass}`}>
                            {highlightedName}
                        </span>
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <p className="text-gray-400 font-bold text-lg tracking-tight uppercase">
                        {isSignUp ? 'Registro de Restaurante' : 'Painel Administrativo'}
                    </p>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-6">
                    {isSignUp && (
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Nome da sua Empresa</label>
                            <input type="text" required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)}
                                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-50 outline-none transition-all"
                                placeholder="Ex: Pizzaria Forno à Lenha" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">E-mail Corporativo</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-5 py-4 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-50 transition-all"
                            placeholder="admin@seunegocio.com" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Senha Segura</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-5 py-4 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-50 outline-none transition-all"
                            placeholder="Mínimo 6 caracteres" />
                        
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

                    {error && <p className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-center font-bold">{error}</p>}
                    {message && <p className="text-sm text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100 text-center font-bold">{message}</p>}
                    
                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-5 rounded-[1.5rem] shadow-xl text-lg font-black text-white bg-gradient-to-r from-[#FF8C00] to-[#E6005C] hover:scale-[1.02] transition-all disabled:opacity-50">
                        {loading ? 'Processando...' : (isSignUp ? 'Finalizar e Começar' : 'Entrar no Sistema')}
                    </button>
                </form>

                <div className="text-center">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="text-sm font-bold text-[#FF8C00] hover:text-[#E6005C] transition-colors">
                        {isSignUp ? 'Possui conta? Faça o login' : 'Novo por aqui? Registre sua empresa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
