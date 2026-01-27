
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '../../types';
import { useApp } from '../../contexts/AppContext';

const StaffManagementPage: React.FC = () => {
    const { user: currentUser, restaurant, refreshData } = useApp();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    // Estado para seleção de cargo no momento da aprovação
    const [approvalRoles, setApprovalRoles] = useState<Record<string, { isWaiter: boolean, isCashier: boolean, isCook: boolean }>>({});

    const formatUsers = (data: any[]): User[] => {
        return data.map((u: any) => ({
            id: u.id,
            name: u.name || 'Usuário sem nome',
            email: u.email || '',
            role: u.role || 'customer',
            photoUrl: u.photo_url,
            isWaiter: !!u.is_waiter,
            isCashier: !!u.is_cashier,
            isCook: !!u.is_cook,
            whatsapp: u.whatsapp || '',
            address: u.address || null,
            restaurantId: u.restaurant_id
        }));
    };

    const fetchCurrentStaff = async () => {
        setLoading(true);
        try {
            // Buscamos usuários vinculados ao restaurante
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('restaurant_id', currentUser?.restaurantId)
                .order('name');
                
            if (error) throw error;
            setAllUsers(formatUsers(data || []));
        } catch (error: any) {
            console.error('Erro ao buscar equipe:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentStaff();
    }, [currentUser?.restaurantId]);

    // Separa usuários entre equipe ativa e solicitações pendentes
    const { activeStaff, pendingRequests } = useMemo(() => {
        return {
            activeStaff: allUsers.filter(u => u.role !== 'customer' && u.id !== currentUser?.id),
            pendingRequests: allUsers.filter(u => u.role === 'customer')
        };
    }, [allUsers, currentUser?.id]);

    const handleToggleFlag = async (targetUser: User, flag: 'isWaiter' | 'isCashier' | 'isCook') => {
        const isManager = currentUser?.role === 'admin' || currentUser?.role === 'admin_restaurante';
        
        if (!isManager) {
            alert("Apenas administradores podem gerenciar a equipe.");
            return;
        }

        if (updatingUserId) return;

        setUpdatingUserId(targetUser.id);
        const newStatus = !targetUser[flag];
        const dbColumn = flag === 'isWaiter' ? 'is_waiter' : flag === 'isCashier' ? 'is_cashier' : 'is_cook';
        
        try {
            const willStillBeStaff = 
                (flag === 'isWaiter' ? newStatus : !!targetUser.isWaiter) ||
                (flag === 'isCashier' ? newStatus : !!targetUser.isCashier) ||
                (flag === 'isCook' ? newStatus : !!targetUser.isCook);
            
            let newRole = targetUser.role;
            if (targetUser.role !== 'admin' && targetUser.role !== 'admin_restaurante') {
                newRole = willStillBeStaff ? 'staff' : 'customer';
            }

            const updatePayload: any = { 
                [dbColumn]: newStatus,
                role: newRole 
            };

            const { error } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', targetUser.id);

            if (error) throw error;

            setAllUsers(prev => prev.map(u => 
                u.id === targetUser.id ? { ...u, [flag]: newStatus, role: newRole as any } : u
            ));

            if (targetUser.id === currentUser?.id) {
                await refreshData();
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleApproveRequest = async (targetUser: User) => {
        const roles = approvalRoles[targetUser.id] || { isWaiter: false, isCashier: false, isCook: false };
        
        if (!roles.isWaiter && !roles.isCashier && !roles.isCook) {
            alert("Por favor, selecione pelo menos um cargo para o colaborador.");
            return;
        }

        setUpdatingUserId(targetUser.id);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: 'staff',
                    is_waiter: roles.isWaiter,
                    is_cashier: roles.isCashier,
                    is_cook: roles.isCook
                })
                .eq('id', targetUser.id);

            if (error) throw error;

            setAllUsers(prev => prev.map(u => 
                u.id === targetUser.id ? { 
                    ...u, 
                    role: 'staff', 
                    isWaiter: roles.isWaiter, 
                    isCashier: roles.isCashier, 
                    isCook: roles.isCook 
                } : u
            ));
            
            alert(`${targetUser.name} agora faz parte da sua equipe!`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleRejectRequest = async (targetUser: User) => {
        if (!confirm(`Deseja recusar a solicitação de ${targetUser.name}? o vínculo será removido.`)) return;
        
        setUpdatingUserId(targetUser.id);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ restaurant_id: null })
                .eq('id', targetUser.id);

            if (error) throw error;

            setAllUsers(prev => prev.filter(u => u.id !== targetUser.id));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const toggleApprovalRole = (userId: string, role: 'isWaiter' | 'isCashier' | 'isCook') => {
        setApprovalRoles(prev => {
            const userRoles = prev[userId] || { isWaiter: false, isCashier: false, isCook: false };
            return {
                ...prev,
                [userId]: { ...userRoles, [role]: !userRoles[role] }
            };
        });
    };

    const StaffRoleToggle = ({ label, active, onClick, disabled, isUpdating }: { label: string, active: boolean, onClick: () => void, disabled: boolean, isUpdating: boolean }) => (
        <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-tighter whitespace-nowrap">{label}</span>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
                    active ? 'bg-orange-500 shadow-md shadow-orange-100' : 'bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
            >
                {isUpdating ? (
                    <span className="w-full flex justify-center">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    </span>
                ) : (
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                )}
            </button>
        </div>
    );

    const inviteLink = `${window.location.origin}/invite/${restaurant?.slug}`;

    return (
        <div className="max-w-5xl mx-auto pb-20 text-left">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Gestão de Equipe</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Visualize e gerencie as funções dos seus colaboradores.</p>
            </div>

            {/* Link de Convite Profissional - AJUSTE ESTÉTICO MOBILE */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-10 space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Convidar Colaboradores</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex-1 min-w-0 w-full">
                        <p className="text-[10px] md:text-[11px] font-bold text-gray-600 break-all leading-tight">{inviteLink}</p>
                    </div>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(inviteLink); alert("Link de convite copiado!"); }}
                        className="w-full md:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-sm shrink-0"
                    >
                        Copiar Link de Convite
                    </button>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight ml-1">* Envie este link para quem deseja trabalhar no seu restaurante.</p>
            </div>

            {/* Solicitações Pendentes */}
            {pendingRequests.length > 0 && (
                <div className="mb-12 space-y-4">
                    <h2 className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.3em] ml-2 mb-4">Solicitações de Vínculo Pendentes</h2>
                    <div className="space-y-4">
                        {pendingRequests.map(u => {
                            const roles = approvalRoles[u.id] || { isWaiter: false, isCashier: false, isCook: false };
                            return (
                                <div key={u.id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border-2 border-orange-100 flex flex-col space-y-6">
                                    <div className="flex items-center space-x-5">
                                        <img src={u.photoUrl || `https://ui-avatars.com/api/?name=${u.name}&background=random`} alt={u.name} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                                        <div className="flex-1">
                                            <h4 className="font-black text-gray-900 text-lg leading-none">{u.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Deseja entrar na equipe</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Selecione os cargos para aprovar:</p>
                                        <div className="flex justify-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                            {['isWaiter', 'isCashier', 'isCook'].map((r: any) => (
                                                <label key={r} className={`flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all border-2 ${roles[r] ? 'bg-orange-500 text-white border-orange-400' : 'bg-white border-gray-100 text-gray-400'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={roles[r]} 
                                                        onChange={() => toggleApprovalRole(u.id, r)} 
                                                    />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {r === 'isWaiter' ? 'Garçom' : r === 'isCashier' ? 'Caixa' : 'Cozinha'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => handleRejectRequest(u)} className="flex-1 border border-gray-200 text-gray-400 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Recusar</button>
                                        <button onClick={() => handleApproveRequest(u)} className="flex-[2] bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-4 rounded-xl shadow-xl shadow-orange-100 text-[10px] uppercase tracking-widest">Aprovar e Ativar</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Equipe Ativa */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 mb-4">Equipe em Operação</h2>
                {activeStaff.map(u => (
                    <div key={u.id} className={`bg-white p-6 rounded-[2.5rem] shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${updatingUserId === u.id ? 'opacity-70 border-orange-200' : 'border-gray-100 hover:shadow-xl hover:shadow-gray-100'}`}>
                        <div className="flex items-center space-x-5">
                            <div className="relative shrink-0">
                                <img 
                                    src={u.photoUrl || `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                                    alt={u.name} 
                                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <div className="absolute -top-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                            </div>
                            <div className="text-left min-w-0">
                                <h3 className="font-black text-gray-900 text-lg leading-none mb-1 truncate">
                                    {u.name} 
                                    <span className="ml-2 px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-tighter bg-orange-100 text-orange-600">
                                        EQUIPE
                                    </span>
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{u.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-around md:justify-end space-x-4 md:space-x-8 bg-gray-50/50 p-5 rounded-[1.5rem] border border-gray-100 flex-grow md:flex-grow-0">
                            <StaffRoleToggle 
                                label="Garçom" 
                                active={u.isWaiter || false} 
                                onClick={() => handleToggleFlag(u, 'isWaiter')} 
                                disabled={!!updatingUserId} 
                                isUpdating={updatingUserId === u.id}
                            />
                            <StaffRoleToggle 
                                label="OP. Caixa" 
                                active={u.isCashier || false} 
                                onClick={() => handleToggleFlag(u, 'isCashier')} 
                                disabled={!!updatingUserId} 
                                isUpdating={updatingUserId === u.id}
                            />
                            <StaffRoleToggle 
                                label="Cozinha" 
                                active={u.isCook || false} 
                                onClick={() => handleToggleFlag(u, 'isCook')} 
                                disabled={!!updatingUserId} 
                                isUpdating={updatingUserId === u.id}
                            />
                        </div>
                    </div>
                ))}
                
                {activeStaff.length === 0 && !loading && (
                    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                         <p className="text-gray-300 font-black uppercase tracking-widest text-xs">Nenhum colaborador ativo na equipe.</p>
                    </div>
                )}
                
                {loading && (
                    <div className="py-10 text-center">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffManagementPage;
