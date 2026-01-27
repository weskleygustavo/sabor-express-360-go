
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MenuItem, Category } from '../../types';

// Add missing restaurant_id property to satisfy MenuItem type requirements
const emptyMenuItem: Omit<MenuItem, 'id' | 'imageUrl'> = {
    restaurant_id: '',
    name: '',
    description: '',
    price: 0,
    cost: 0,
    categoryId: '',
    isAvailable: true,
    trackInventory: false,
};

const ChevronDown: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
)

const MenuManagementPage: React.FC = () => {
    const { menuItems, categories, updateMenuItem, addMenuItem, addCategory, updateCategory, deleteCategory } = useApp();
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [newItem, setNewItem] = useState(emptyMenuItem);
    const [itemPhotoFile, setItemPhotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => ({...prev, [categoryId]: !prev[categoryId]}));
    }
    
    const handleEditItem = (item: MenuItem) => {
        setEditingItem({ ...item });
        setItemPhotoFile(null);
    };

    const handleOpenNewItemModal = () => {
        setNewItem({...emptyMenuItem, categoryId: categories[0]?.id || ''});
        setItemPhotoFile(null);
        setIsNewItemModalOpen(true);
    };

    const handleCloseModals = () => {
        setEditingItem(null);
        setIsNewItemModalOpen(false);
        setItemPhotoFile(null);
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryName('');
    };

    const handleSaveItem = async () => {
        setLoading(true);
        try {
            if (isNewItemModalOpen) {
                if (!itemPhotoFile) {
                    alert('Por favor, adicione uma foto para o novo item.');
                    setLoading(false);
                    return;
                }
                await addMenuItem(newItem, itemPhotoFile);
            } else if (editingItem) {
                await updateMenuItem(editingItem, itemPhotoFile || undefined);
            }
            handleCloseModals();
        } catch (error: any) {
            alert("Erro ao salvar item: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!categoryName) return;
        setLoading(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryName);
            } else {
                await addCategory(categoryName);
            }
            handleCloseModals();
        } catch (error: any) {
            alert("Erro ao salvar categoria: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar itens de menu existentes.')) {
            try {
                await deleteCategory(id);
            } catch (error: any) {
                alert('Erro ao excluir categoria: ' + error.message);
            }
        }
    }
    
    const handleOpenCategoryModal = (category: Category | null) => {
        setEditingCategory(category);
        setCategoryName(category ? category.name : '');
        setIsCategoryModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, isNew: boolean) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const setter = isNew ? setNewItem : setEditingItem;
        setter(prev => {
            if (!prev) return null;
            if (type === 'checkbox') return { ...prev, [name]: checked };
            if (type === 'number') return { ...prev, [name]: parseFloat(value) };
            return { ...prev, [name]: value };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setItemPhotoFile(e.target.files[0]);
    };

    const currentModalItem = isNewItemModalOpen ? newItem : editingItem;
    const inputClass = "w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-orange-500 focus:border-orange-500 shadow-sm";

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Gerenciamento de Cardápio</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Organize seus produtos e categorias com facilidade.</p>
                </div>
                <div className="flex space-x-3 w-full md:w-auto">
                    <button onClick={() => handleOpenCategoryModal(null)} className="flex-1 md:flex-none border border-gray-200 text-gray-600 font-black py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest active:scale-95 shadow-sm">
                        + Nova Categoria
                    </button>
                    <button onClick={handleOpenNewItemModal} className="flex-1 md:flex-none bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-orange-100 hover:scale-105 transition-all text-[10px] uppercase tracking-widest active:scale-95">
                        + Adicionar Item
                    </button>
                </div>
            </div>

            <div className="space-y-6">
            {categories.map(cat => {
                const itemsInCategory = menuItems.filter(item => item.categoryId === cat.id);
                const isExpanded = !!expandedCategories[cat.id];
                return (
                    <div key={cat.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <button onClick={() => toggleCategory(cat.id)} className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center">
                                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{cat.name}</h2>
                                <span className="ml-3 text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{itemsInCategory.length} ITENS</span>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-3">
                                    <span onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 tracking-wider">Editar</span>
                                    <span onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 tracking-wider">Excluir</span>
                                </div>
                                <ChevronDown className={`transform transition-transform text-gray-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {isExpanded && (
                            <div className="border-t border-gray-50 p-4">
                               {itemsInCategory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-gray-400">
                                                <tr className="text-[9px] font-black uppercase tracking-widest">
                                                    <th className="p-4">Produto</th>
                                                    <th className="p-4">Preço</th>
                                                    <th className="p-4">Estoque</th>
                                                    <th className="p-4">Disponível</th>
                                                    <th className="p-4">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemsInCategory.map(item => (
                                                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-all rounded-xl">
                                                        <td className="p-4 flex items-center space-x-4">
                                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shadow-sm"/>
                                                            <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                                                        </td>
                                                        <td className="p-4 text-sm font-black text-gray-900">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${item.trackInventory ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                                                {item.trackInventory ? 'Ativo' : 'Não'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {item.isAvailable ? 'Sim' : 'Não'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <button onClick={() => handleEditItem(item)} className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-800 tracking-widest">Editar</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                               ) : (
                                   <p className="p-8 text-sm text-gray-400 font-bold uppercase tracking-widest text-center italic">Nenhum item nesta categoria.</p>
                               )}
                            </div>
                        )}
                    </div>
                );
            })}
            </div>

            {/* Item Modal */}
            {(editingItem || isNewItemModalOpen) && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto text-left">
                        <h2 className="text-2xl font-black mb-6 text-gray-800 tracking-tighter">{isNewItemModalOpen ? "Adicionar Novo Item" : `Editar Item`}</h2>
                        <div className="space-y-6">
                             <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Foto do Produto</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-100 border-dashed rounded-3xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                    <div className="space-y-2 text-center">
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer font-black text-orange-600 hover:text-orange-500 uppercase text-[10px] tracking-widest">
                                                <span>Clique para escolher</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[200px]">{itemPhotoFile ? itemPhotoFile.name : 'Nenhum ficheiro selecionado'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nome</label>
                                <input name="name" value={currentModalItem?.name} onChange={(e) => handleChange(e, isNewItemModalOpen)} className={inputClass}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Descrição</label>
                                <textarea name="description" value={currentModalItem?.description} onChange={(e) => handleChange(e, isNewItemModalOpen)} rows={3} className={inputClass}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Venda (R$)</label>
                                    <input name="price" type="number" step="0.01" value={currentModalItem?.price} onChange={(e) => handleChange(e, isNewItemModalOpen)} className={inputClass}/>
                                </div>
                                 <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Custo (CMV)</label>
                                    <input name="cost" type="number" step="0.01" value={currentModalItem?.cost} onChange={(e) => handleChange(e, isNewItemModalOpen)} className={inputClass}/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Categoria</label>
                                <select name="categoryId" value={currentModalItem?.categoryId} onChange={(e) => handleChange(e, isNewItemModalOpen)} className={inputClass}>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <input name="isAvailable" type="checkbox" checked={currentModalItem?.isAvailable} onChange={(e) => handleChange(e, isNewItemModalOpen)} className="h-5 w-5 text-[#E6005C] border-gray-300 rounded-lg focus:ring-[#E6005C]"/>
                                    <label className="ml-3 text-[10px] font-black uppercase text-gray-600 tracking-widest">Visível</label>
                                </div>
                                <div className="flex items-center p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <input name="trackInventory" type="checkbox" checked={currentModalItem?.trackInventory} onChange={(e) => handleChange(e, isNewItemModalOpen)} className="h-5 w-5 text-[#FF8C00] border-gray-300 rounded-lg focus:ring-[#FF8C00]"/>
                                    <label className="ml-3 text-[10px] font-black uppercase text-orange-600 tracking-widest">Controle Estoque</label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex space-x-4">
                            <button onClick={handleCloseModals} className="flex-1 text-gray-400 font-black px-4 py-4 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
                            <button onClick={handleSaveItem} disabled={loading} className="flex-[2] bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-sm tracking-widest">
                                {loading ? '...' : 'SALVAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
             {/* Category Modal */}
            {isCategoryModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md text-left">
                        <h2 className="text-2xl font-black mb-6 text-gray-800 tracking-tighter">{editingCategory ? "Editar Categoria" : "Nova Categoria"}</h2>
                        <div>
                             <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Nome da Categoria</label>
                             <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className={inputClass} placeholder="Ex: Bebidas, Hamburgueres..."/>
                        </div>
                         <div className="mt-8 flex space-x-4">
                            <button onClick={handleCloseModals} className="flex-1 text-gray-400 font-black px-4 py-4 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
                            <button onClick={handleSaveCategory} disabled={loading} className="flex-[2] bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-sm tracking-widest">
                                {loading ? '...' : 'SALVAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagementPage;
