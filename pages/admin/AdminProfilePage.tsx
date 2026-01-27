
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

const AdminProfilePage: React.FC = () => {
    const { user, updateUserProfile, deleteAccount, restaurant } = useApp();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [street, setStreet] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [number, setNumber] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [referencePoint, setReferencePoint] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setWhatsapp(user.whatsapp || '');
            setStreet(user.address?.street || '');
            setNeighborhood(user.address?.neighborhood || '');
            setNumber(user.address?.number || '');
            setCity(user.address?.city || '');
            setState(user.address?.state || '');
            setReferencePoint(user.address?.referencePoint || '');
            setPhoto(user.photoUrl);
        }
    }, [user]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile({
                name,
                whatsapp,
                address: { street, neighborhood, number, city, state, referencePoint }
            }, photoFile || undefined);
            alert('Perfil atualizado com sucesso!');
        } catch (error: any) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEverything = async () => {
        const isAdmin = user?.role === 'admin_restaurante';
        const msg = isAdmin 
            ? `ATENÇÃO GESTOR: Você está prestes a excluir sua conta e o restaurante "${restaurant?.name}" PERMANENTEMENTE. Todos os pedidos, cardápio e dados financeiros serão apagados. Deseja continuar?`
            : "Você tem certeza que deseja excluir sua conta de colaborador?";

        if (confirm(msg)) {
            setLoading(true);
            try {
                await deleteAccount();
            } catch (error: any) {
                alert('Erro ao excluir dados: ' + error.message);
                setLoading(false);
            }
        }
    };
    
    const inputClass = "mt-2 block w-full bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-orange-50 focus:border-[#FF8C00] p-4 font-bold text-gray-800 transition-all";
    const disabledInputClass = "mt-2 block w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-400 cursor-not-allowed shadow-inner";

    if (!user) return <div className="py-20 text-center font-black text-gray-400 uppercase tracking-widest animate-pulse">Carregando perfil...</div>;

    const userRoleLabel = user.role === 'admin' ? 'ADMINISTRADOR' : user.isCashier ? 'OPERADOR DE CAIXA' : user.isCook ? 'COZINHEIRO' : 'COLABORADOR';
    const isOwner = user.role === 'admin_restaurante';

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="text-left mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Meu Perfil</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">GERENCIE AS INFORMAÇÕES DO SEU PERFIL DE {userRoleLabel}.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-10 text-left">
                <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-10 px-2">
                    <img src={photo || `https://ui-avatars.com/api/?name=${name || 'A'}&background=random`} alt="Foto de perfil" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl shadow-gray-100" />
                    <div className="space-y-4 text-center sm:text-left flex-1">
                        <div>
                            <label htmlFor="photo-upload" className="cursor-pointer inline-block bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black px-8 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-100 text-[11px] uppercase tracking-widest">
                                Trocar Foto
                            </label>
                            <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange}/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Nome Completo</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">E-mail de Acesso</label>
                        <input type="email" value={email} disabled className={disabledInputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">WhatsApp</label>
                        <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Rua</label>
                        <input type="text" value={street} onChange={e => setStreet(e.target.value)} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Número</label>
                        <input type="text" value={number} onChange={e => setNumber(e.target.value)} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Bairro</label>
                        <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Cidade</label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Estado</label>
                        <input type="text" value={state} onChange={e => setState(e.target.value)} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Ponto de Referência</label>
                        <input type="text" value={referencePoint} onChange={e => setReferencePoint(e.target.value)} className={inputClass} placeholder="Ex: Próximo ao banco..." />
                    </div>
                </div>
                 <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button 
                        type="button" 
                        onClick={handleDeleteEverything}
                        disabled={loading}
                        className="w-full md:w-auto text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline py-3 px-6 transition-all disabled:opacity-50"
                    >
                        {isOwner ? 'Encerrar Restaurante e Minha Conta' : 'Excluir Minha Conta'}
                    </button>
                    <button type="submit" disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-orange-100 transition-all hover:scale-105 active:scale-95 text-[11px] uppercase tracking-[0.2em]">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfilePage;
