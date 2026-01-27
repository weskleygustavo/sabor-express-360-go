
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ChevronLeftIcon } from '../components/icons';

const PrivacyPolicyPage: React.FC = () => {
    const { setRoute } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="flex items-center text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-2" />
                        Voltar ao Início
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FF8C00] to-[#E6005C] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md text-center">S</div>
                        <span className="font-black text-sm text-gray-900 tracking-tighter uppercase">Sabor Express <span className="text-[#E6005C]">360</span></span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-16">
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 md:p-16 text-left">
                    <header className="mb-12 border-b border-gray-50 pb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
                            Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#E6005C]">Privacidade</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            Plataforma: Sabor Express 360 Versão 1.0 – Data de Atualização: 21 de Janeiro de 2026
                        </p>
                    </header>

                    {/* Destaque LGPD */}
                    <section className="bg-blue-50 rounded-[2rem] p-8 mb-12 border border-blue-100">
                        <h2 className="text-blue-600 font-black text-sm uppercase tracking-[0.2em] mb-4 flex items-center">
                            <span className="mr-3 text-xl">🛡️</span> COMPROMISSO COM A SEGURANÇA
                        </h2>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">
                            A SABOR EXPRESS 360 está comprometida com a segurança e a privacidade dos dados de seus usuários. Esta Política descreve como coletamos, usamos, armazenamos e protegemos as informações pessoais em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                        </p>
                    </section>

                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">1. INTRODUÇÃO</h3>
                            <p className="text-sm font-medium">Ao utilizar o sistema, você concorda com as práticas descritas neste documento. Esta política aplica-se tanto aos Restaurantes (Contratantes) quanto aos Clientes Finais (Consumidores).</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">2. COLETA DE DADOS</h3>
                            <p className="text-sm font-medium mb-4">Coletamos apenas os dados estritamente necessários para o funcionamento da plataforma e a realização dos pedidos de delivery.</p>
                            <ul className="list-disc pl-5 space-y-4 text-sm font-medium">
                                <li><strong>Dados de Cadastro:</strong> Nome Completo, E-mail e Senha (armazenada via hash criptográfico).</li>
                                <li><strong>Dados de Perfil (Tela "MEU PERFIL"):</strong> Foto (opcional), Endereço Completo, Ponto de Referência, WhatsApp e E-mail.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">3. FINALIDADE DO TRATAMENTO</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="font-black text-gray-900 uppercase text-[10px] mb-1">Identificação</p>
                                    <p>Permitir o acesso seguro através de login e senha.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="font-black text-gray-900 uppercase text-[10px] mb-1">Operação Logística</p>
                                    <p>Viabilizar a localização e entrega dos pedidos pelo restaurante.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="font-black text-gray-900 uppercase text-[10px] mb-1">Comunicação</p>
                                    <p>Notificações de status do pedido e suporte via WhatsApp/E-mail.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="font-black text-gray-900 uppercase text-[10px] mb-1">Gestão</p>
                                    <p>Gerenciamento de cardápio, estoque e relatórios financeiros.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">4. SEGURANÇA E ARMAZENAMENTO</h3>
                            <div className="space-y-4 text-sm font-medium">
                                <p><strong>4.1. Isolamento de Dados (Row Level Security):</strong> Utilizamos tecnologia RLS que cria uma "parede invisível" entre os dados de diferentes restaurantes. É tecnicamente impossível o acesso cruzado de dados entre estabelecimentos.</p>
                                <p><strong>4.2. Controle de Acesso (RBAC):</strong> O sistema utiliza permissões baseadas em funções (Cozinheiro, Garçom, Caixa, Admin), garantindo que cada colaborador veja apenas o necessário para sua função.</p>
                                <p><strong>4.3. Criptografia:</strong> Todas as senhas e tokens de sessão são protegidos por protocolos modernos (SSL/TLS).</p>
                                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                    <p className="font-black text-gray-900 uppercase text-[10px] mb-2">📍 LOCALIZAÇÃO NACIONAL DOS DADOS (BRASIL)</p>
                                    <p>Para garantir a máxima performance (baixa latência) e total conformidade com a soberania de dados nacional, nossos servidores estão hospedados fisicamente na região de <strong>São Paulo, Brasil</strong>.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">5. COMPARTILHAMENTO DE DADOS</h3>
                            <p className="text-sm font-medium mb-4">Atuamos como Operadores de dados na relação de delivery.</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm font-medium">
                                <li>Compartilhamos dados do Cliente (Nome, Endereço, Fone) apenas com o Restaurante onde o pedido foi feito.</li>
                                <li><strong>NÃO VENDEMOS DADOS:</strong> Em nenhuma hipótese vendemos ou alugamos dados pessoais para fins publicitários de terceiros.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">6. COOKIES E SESSÃO</h3>
                            <p className="text-sm font-medium">Utilizamos cookies técnicos apenas para manter o usuário logado e garantir o funcionamento do carrinho de compras. Não utilizamos rastreamento para marketing externo.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">7. DIREITOS DO TITULAR (LGPD)</h3>
                            <p className="text-sm font-medium mb-4">Você possui os seguintes direitos, exercíveis via painel "MEU PERFIL" ou suporte:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase">Acesso</span>
                                <span className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase">Correção</span>
                                <span className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase">Exclusão</span>
                                <span className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase">Portabilidade</span>
                            </div>
                        </section>

                        <section className="border-t border-gray-50 pt-10 text-center">
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Sabor Express 360 - Privacidade em Primeiro Lugar</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
