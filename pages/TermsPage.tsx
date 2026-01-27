
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ChevronLeftIcon } from '../components/icons';

const TermsPage: React.FC = () => {
    const { setRoute } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header Simples */}
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
                            Termos e Condições <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#E6005C]">Gerais de Uso</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            Plataforma: Sabor Express 360 Versão 1.0 – Última atualização: 21 de Janeiro de 2026
                        </p>
                    </header>

                    {/* Resumo em destaque */}
                    <section className="bg-orange-50 rounded-[2rem] p-8 mb-12 border border-orange-100">
                        <h2 className="text-orange-600 font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center">
                            <span className="mr-3 text-xl">💡</span> RESUMO (O que você precisa saber antes de começar)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="font-black text-gray-900 text-xs uppercase">Teste Grátis</p>
                                <p className="text-sm text-gray-600 font-medium italic">Você tem 07 (sete) dias de acesso gratuito e irrestrito.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-gray-900 text-xs uppercase">Sem Surpresas</p>
                                <p className="text-sm text-gray-600 font-medium italic">Após o teste, o sistema é bloqueado automaticamente. Não há cobrança automática nem pegadinhas.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-gray-900 text-xs uppercase">Pagamento Exclusivo no PIX</p>
                                <p className="text-sm text-gray-600 font-medium italic">Trabalhamos somente com pagamentos à vista via PIX. Não aceitamos cartão de crédito, boletos ou cheques.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-gray-900 text-xs uppercase">Modelo Pré-pago</p>
                                <p className="text-sm text-gray-600 font-medium italic">O acesso é liberado após a confirmação do PIX. "Pagou, usou".</p>
                            </div>
                        </div>
                    </section>

                    {/* Conteúdo do Contrato */}
                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">1. INTRODUÇÃO E DEFINIÇÕES</h3>
                            <p className="font-medium text-sm mb-4">Bem-vindo ao Sabor Express 360. Este documento regula a relação entre a SABOR EXPRESS 360 (doravante "CONTRATADA") e o estabelecimento comercial ou usuário (doravante "CONTRATANTE").</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm font-medium">
                                <li><strong>Plataforma:</strong> Sistema SaaS híbrido composto por Módulo Administrativo (Backoffice), Módulos Operacionais (PDV, KDS, App Garçom) e Módulo Cliente Final (Delivery App).</li>
                                <li><strong>Restaurante (Contratante):</strong> A pessoa jurídica ou física que contrata a licença de uso para gestão do seu estabelecimento.</li>
                                <li><strong>Usuário Final:</strong> O cliente do restaurante que utiliza a interface de Delivery para realizar pedidos.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">2. ACEITE DOS TERMOS</h3>
                            <p className="font-medium text-sm">Ao realizar o cadastro (Sign Up/Onboarding) e clicar na caixa de seleção "Li e aceito os Termos de Uso", o CONTRATANTE declara ter lido, compreendido e aceito integralmente todas as cláusulas deste instrumento. O uso da plataforma, mesmo durante o período de teste, implica na concordância com estes termos.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">3. ACESSO, CADASTRO E SEGURANÇA</h3>
                            <p className="font-medium text-sm">3.1. O acesso à plataforma é pessoal e intransferível, realizado via autenticação segura (E-mail e Senha). 3.2. O CONTRATANTE é responsável pela veracidade dos dados informados e por manter a confidencialidade de suas credenciais de acesso. 3.3. O CONTRATANTE é o único responsável por criar e gerenciar as contas de sua equipe (Garçom, Caixa, Cozinheiro), atribuindo as permissões corretas para cada função.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">4. MODELO COMERCIAL, PLANOS E PAGAMENTOS</h3>
                            <div className="space-y-4 text-sm font-medium">
                                <p><strong>4.1. Período de Teste (Free Trial):</strong> O CONTRATANTE terá direito a um período de gratuidade de 07 (sete) dias corridos.</p>
                                <p><strong>4.2. Bloqueio Automático:</strong> Ao término do 7º dia, caso não haja a contratação de um plano pago, o acesso será automaticamente suspenso.</p>
                                <p><strong>4.3. Forma de Pagamento (Exclusiva PIX):</strong> A contratação ocorre exclusivamente via PIX através do canal oficial (WhatsApp). Não são aceitos cartões de crédito, débito ou boletos.</p>
                                <p><strong>4.4. Planos e Vigência:</strong> Plano Mensal (30 dias) e Plano Anual (365 dias). Licenciamento temporário e pré-pago.</p>
                                <p><strong>4.5. Cancelamento:</strong> Pode ser solicitado a qualquer momento por não renovação. Devido à natureza pré-paga, não haverá reembolso proporcional.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">5. RESPONSABILIDADES E OBRIGAÇÕES</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <p className="font-black text-gray-900 uppercase mb-2">Da CONTRATADA:</p>
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li>Manter a plataforma disponível e segura.</li>
                                        <li>Garantir a integridade e o backup dos dados em nuvem.</li>
                                        <li>Prestar suporte técnico via canais oficiais.</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase mb-2">Do CONTRATANTE:</p>
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li>Gestão integral de conteúdo (preços, itens, fotos).</li>
                                        <li>Logística de embalagem e entrega de alimentos.</li>
                                        <li>Configuração correta de dados fiscais e tributários.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">6. PROPRIEDADE INTELECTUAL</h3>
                            <p className="font-medium text-sm">O software Sabor Express 360, seu código-fonte, algoritmos e logotipos são propriedade intelectual exclusiva da CONTRATADA. O uso indevido, engenharia reversa ou distribuição sem autorização é estritamente proibido.</p>
                        </section>

                        <section>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">7. PRIVACIDADE (LGPD)</h3>
                            <p className="font-medium text-sm">A coleta de dados tem como única finalidade a execução do contrato. A CONTRATADA compromete-se a não vender ou compartilhar dados com terceiros para fins publicitários sem consentimento expresso.</p>
                        </section>

                        <section className="border-t border-gray-50 pt-10 text-center">
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Sabor Express 360 - Todos os direitos reservados</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;
