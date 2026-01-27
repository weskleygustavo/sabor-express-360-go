
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { UserIcon } from '../../components/icons';

const ProfilePage: React.FC = () => {
    const { user, updateUserProfile, deleteAccount } = useApp();
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

    const handleDelete = async () => {
        if (confirm("ATENÇÃO: Você tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.")) {
            setLoading(true);
            try {
                await deleteAccount();
            } catch (error: any) {
                alert('Erro ao excluir conta: ' + error.message);
                setLoading(false);
            }
        }
    };
    
    const inputClass = "mt-2 block w-full bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3 transition-colors focus:bg-white";
    const disabledInputClass = "mt-2 block w-full bg-gray-100 border border-gray-200 rounded-lg shadow-inner p-3 text-gray-400 cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-600";


    if (!user) return <p>Carregando perfil...</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-800">Meu Perfil</h1>
                <p className="text-gray-500 mt-2">Atualize suas informações pessoais e de entrega.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-left">
                <div className="flex flex-col items-center space-y-4 mb-10">
                    <img src={photo || `https://ui-avatars.com/api/?name=${name || ' '}&background=random&color=fff&size=128`} alt="Foto de perfil" className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-white" />
                    <div>
                        <label htmlFor="photo-upload" className="cursor-pointer bg-white border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                            Alterar Imagem
                        </label>
                        <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange}/>
                    </div>
                </div>

                <fieldset className="mb-8">
                    <legend className="text-lg font-semibold text-gray-700 border-b w-full pb-2 mb-6">Informações Pessoais</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass} htmlFor="name">Nome Completo</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Seu nome completo" required />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="email">E-mail</label>
                            <input id="email" type="email" value={email} disabled className={disabledInputClass} />
                        </div>
                         <div>
                            <label className={labelClass} htmlFor="whatsapp">WhatsApp</label>
                            <input id="whatsapp" type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputClass} placeholder="(99) 99999-9999" required />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                     <legend className="text-lg font-semibold text-gray-700 border-b w-full pb-2 mb-6">Endereço de Entrega</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className={labelClass} htmlFor="street">Rua</label>
                            <input id="street" type="text" value={street} onChange={e => setStreet(e.target.value)} className={inputClass} placeholder="Nome da sua rua" required />
                        </div>
                         <div>
                            <label className={labelClass} htmlFor="number">Número</label>
                            <input id="number" type="text" value={number} onChange={e => setNumber(e.target.value)} className={inputClass} placeholder="Ex: 123A" required />
                        </div>
                         <div>
                            <label className={labelClass} htmlFor="neighborhood">Bairro</label>
                            <input id="neighborhood" type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={inputClass} placeholder="Nome do seu bairro" required />
                        </div>
                         <div>
                            <label className={labelClass} htmlFor="city">Cidade</label>
                            <input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} className={inputClass} placeholder="Sua cidade" required />
                        </div>
                         <div>
                            <label className={labelClass} htmlFor="state">Estado</label>
                            <input id="state" type="text" value={state} onChange={e => setState(e.target.value)} className={inputClass} placeholder="Seu estado" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass} htmlFor="referencePoint">Ponto de Referência</label>
                            <input id="referencePoint" type="text" value={referencePoint} onChange={e => setReferencePoint(e.target.value)} className={inputClass} placeholder="Ex: Próximo ao mercado X, em frente a farmácia Y" required />
                        </div>
                     </div>
                </fieldset>
                 
                 <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full md:w-auto border-2 border-red-100 text-red-500 font-bold py-3 px-8 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        Excluir Minha Conta
                    </button>
                    <button type="submit" disabled={loading} className="w-full md:w-auto bg-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-700 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:bg-orange-400 disabled:cursor-not-allowed">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
