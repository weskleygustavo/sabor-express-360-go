
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Restaurant } from '../../types';

const SettingsPage: React.FC = () => {
    const { restaurant, updateRestaurant } = useApp();
    const [formData, setFormData] = useState<Partial<Restaurant> | null>(null);
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [bannerPhotoFile, setBannerPhotoFile] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | undefined>(undefined);
    const [bannerPhotoPreview, setBannerPhotoPreview] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (restaurant) {
            setFormData(restaurant);
            setProfilePhotoPreview(restaurant.profilePhotoUrl);
            setBannerPhotoPreview(restaurant.bannerPhotoUrl);
        }
    }, [restaurant]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profile' | 'banner') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (field === 'profile') {
                    setProfilePhotoFile(file);
                    setProfilePhotoPreview(event.target?.result as string);
                } else {
                    setBannerPhotoFile(file);
                    setBannerPhotoPreview(event.target?.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setLoading(true);
        try {
            await updateRestaurant(formData, profilePhotoFile || undefined, bannerPhotoFile || undefined);
            alert('Configurações salvas com sucesso!');
        } catch(error: any) {
            alert('Erro ao salvar configurações: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!formData) {
        return <div className="py-20 text-center font-black text-gray-400 uppercase tracking-widest animate-pulse">Carregando configurações...</div>;
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'slug') {
            // Garante formato de URL: minúsculo, troca espaços por hifen, remove caracteres especiais
            const sanitizedSlug = value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: sanitizedSlug }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const inputClass = "mt-2 block w-full bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-orange-50 focus:border-[#FF8C00] p-4 font-bold text-gray-800 transition-all";

    const restaurantUrl = `${window.location.origin}/${formData.slug || ''}`;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="text-left mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Meu Restaurante</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Personalize a identidade e taxas do seu delivery.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-10 text-left">
                 {/* Link Único do Restaurante - AJUSTE ESTÉTICO MOBILE */}
                 <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 w-full">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Link Único do seu Cardápio</p>
                        <p className="text-[11px] md:text-sm font-bold text-gray-700 break-all leading-tight">{restaurantUrl}</p>
                        <p className="text-[8px] font-black text-orange-400 uppercase mt-2">Lembre-se: alterar o slug mudará o link do seu cardápio.</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(restaurantUrl);
                            alert('Link copiado para a área de transferência!');
                        }}
                        className="w-full md:w-auto bg-white text-orange-600 border border-orange-200 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-sm shrink-0"
                    >
                        Copiar Link
                    </button>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-10">
                    <div className="relative group shrink-0">
                        <img src={profilePhotoPreview || 'https://via.placeholder.com/100'} alt="Foto de perfil" className="w-32 h-32 rounded-full object-cover bg-gray-50 border-4 border-white shadow-xl" />
                        <label htmlFor="profile-photo" className="absolute bottom-1 right-1 bg-gradient-to-tr from-[#FF8C00] to-[#E6005C] p-3 rounded-full text-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center">
                             <span className="text-xs">📸</span>
                        </label>
                        <input id="profile-photo" type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'profile')}/>
                    </div>
                    <div className="flex-1 w-full">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Banner do Cardápio</p>
                        <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white aspect-[3/1] bg-gray-50">
                            <img src={bannerPhotoPreview || 'https://via.placeholder.com/200x100'} alt="Banner" className="w-full h-full object-cover" />
                            <label htmlFor="banner-photo" className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center text-transparent hover:text-white transition-all cursor-pointer font-black uppercase text-[10px] tracking-widest">
                                Clique para trocar Banner
                            </label>
                        </div>
                        <input id="banner-photo" type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'banner')}/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 px-1">Identificador da URL (Slug)</label>
                        <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className={`${inputClass} border-orange-100 bg-orange-50/20`} placeholder="ex: cohens-burgers" />
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-2">* Este nome aparecerá no final do seu link único.</p>
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Nome do Restaurante</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Endereço Completo</label>
                        <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Taxa de Entrega (R$)</label>
                        <input type="number" step="0.01" name="deliveryFee" value={formData.deliveryFee || 0} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Tempo para Entrega</label>
                        <input type="text" name="deliveryTime" value={formData.deliveryTime || ''} onChange={handleChange} className={inputClass} placeholder="Ex: 30-45 min" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Taxa de Serviço (%)</label>
                        <input type="number" step="0.5" name="serviceCharge" value={formData.serviceCharge || 0} onChange={handleChange} className={inputClass} placeholder="Ex: 10" />
                    </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">WhatsApp de Contato</label>
                        <input type="text" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Instagram Link</label>
                        <input type="text" name="instagramLink" value={formData.instagramLink || ''} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/seu-perfil" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Horário de Atendimento (Dias e Horários)</label>
                        <textarea name="operatingHours" value={formData.operatingHours || ''} onChange={handleChange} className={inputClass} rows={3} placeholder="Ex: Seg-Sex: 18:00 - 23:00; Sab: 11:00 - 23:00" />
                        <p className="text-[9px] text-orange-400 font-bold uppercase mt-2">* Use o formato HH:mm - HH:mm para que o status da loja funcione automaticamente.</p>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-orange-100 transition-all hover:scale-105 active:scale-95 text-[11px] uppercase tracking-[0.2em]">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
