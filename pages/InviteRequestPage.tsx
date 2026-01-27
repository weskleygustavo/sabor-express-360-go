
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';

const InviteRequestPage: React.FC = () => {
    const { user, logout } = useApp();
    const [step, setStep] = useState<'initial' | 'success'>('initial');
    const [loading, setLoading] = useState(false);

    const resId = sessionStorage.getItem('pending_invite_restaurant_id');

    const handleRequestLink = async () => {
        if (!user || !resId) return;
        setLoading(true);
        try {
            // Atualiza o perfil do usuário com o restaurant_id do convite
            const { error } = await supabase
                .from('profiles')
                .update({ restaurant_id: resId })
                .eq('id', user.id);

            if (error) throw error;
            
            // Limpa imediatamente os dados do convite para evitar loops
            sessionStorage.removeItem('pending_invite_restaurant_id');
            sessionStorage.removeItem('pending_invite_slug');
            
            setStep('success');

        } catch (error: any) {
            alert("Erro ao solicitar vínculo: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center font-sans">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 space-y-8 border border-gray-100">
                
                {step === 'initial' ? (
                    <>
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
                                👋
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                Olá, {user?.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
                                Você recebeu um convite para fazer parte da equipe. Clique abaixo para confirmar seu interesse e enviar para o gestor.
                            </p>
                        </div>

                        <button 
                            onClick={handleRequestLink}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-6 rounded-2xl shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
                        >
                            {loading ? 'PROCESSANDO...' : 'SOLICITAR VÍNCULO'}
                        </button>
                    </>
                ) : (
                    <div className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-green-500 w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl shadow-xl shadow-green-100">
                                ✓
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                                Solicitação enviada!
                            </h2>
                            <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest leading-relaxed px-2">
                                Por favor, aguarde o Gestor do Restaurante concluir seu acesso.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase leading-tight">
                                    Importante: Você deve voltar a fazer login somente após o dono do restaurante informar que seu vínculo foi aprovado.
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => logout()}
                            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-black transition-all text-[10px] uppercase tracking-widest"
                        >
                            ENTENDIDO, SAIR DO SISTEMA
                        </button>
                    </div>
                )}
            </div>
            
            <p className="mt-8 text-[9px] font-black text-gray-300 uppercase tracking-widest tracking-[0.3em]">Sabor Express 360 &copy; Operação Staff</p>
        </div>
    );
};

export default InviteRequestPage;
