
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ChevronLeftIcon } from '../components/icons';

const FAQItem = ({ question, answer }: { question: string, answer: string | React.ReactNode }) => (
    <div className="border-b border-gray-50 pb-8">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-3">{question}</h3>
        <p className="text-sm text-gray-600 font-medium leading-relaxed">{answer}</p>
    </div>
);

const FAQPage: React.FC = () => {
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
                    <header className="mb-12 border-b border-gray-50 pb-10 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
                            Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#E6005C]">Frequentes</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                            Central de Ajuda e Dúvidas Comuns - Sabor Express 360
                        </p>
                    </header>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.3em] mb-8 border-l-4 border-[#E6005C] pl-4">Planos e Pagamentos</h2>
                            <div className="space-y-8">
                                <FAQItem 
                                    question="1. Como funciona o período de teste grátis?" 
                                    answer="Ao se cadastrar, você ganha automaticamente 07 dias de acesso total a todas as ferramentas (Gestão, PDV, Delivery, KDS). Não pedimos cartão de crédito no cadastro. É só entrar e usar." 
                                />
                                <FAQItem 
                                    question="2. O que acontece depois dos 7 dias?" 
                                    answer="Seu acesso será bloqueado automaticamente. Para continuar usando, você verá um botão na tela para chamar nosso time no WhatsApp e contratar um plano. Se não quiser contratar, não precisa fazer nada e nenhuma cobrança será gerada." 
                                />
                                <FAQItem 
                                    question="3. Quais são as formas de pagamento aceitas?" 
                                    answer="Trabalhamos exclusivamente com PIX, na modalidade pré-paga ('pagou, usou'). Isso garante a liberação imediata do seu sistema sem burocracia de análise de crédito bancário. Não aceitamos cartões de crédito ou boletos." 
                                />
                                <FAQItem 
                                    question="4. Existe multa de cancelamento ou fidelidade?" 
                                    answer="Não. Nossos planos funcionam como crédito de celular: você paga para usar o mês (ou o ano). Se quiser cancelar, basta não renovar o pagamento do próximo ciclo. Sem multas, sem letras miúdas." 
                                />
                                <FAQItem 
                                    question="5. Se eu cancelar no meio do mês, recebo reembolso?" 
                                    answer="Não. Como o modelo é pré-pago, o valor investido garante o acesso até o último dia do ciclo contratado. Você continua usando normalmente até o prazo expirar." 
                                />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.3em] mb-8 border-l-4 border-[#E6005C] pl-4">Segurança e Tecnologia</h2>
                            <div className="space-y-8">
                                <FAQItem 
                                    question="6. Meus dados estão seguros? Outro restaurante pode ver minhas vendas?" 
                                    answer="Seus dados são invioláveis. Utilizamos uma tecnologia de segurança avançada chamada Row Level Security (Segurança em Nível de Linha), que cria uma 'parede invisível' no banco de dados. É tecnicamente impossível que um restaurante veja as informações de outro." 
                                />
                                <FAQItem 
                                    question="7. O sistema é rápido? Onde ficam os servidores?" 
                                    answer="Sim, muito rápido! Diferente de muitos concorrentes que usam servidores nos EUA, nossa infraestrutura de banco de dados está localizada fisicamente em São Paulo, Brasil. Isso garante menor tempo de resposta (latência) e total conformidade com a legislação brasileira." 
                                />
                                <FAQItem 
                                    question="8. Preciso instalar algum programa no computador?" 
                                    answer="Não. O Sabor Express 360 é 100% em nuvem (SaaS). Você acessa tudo pelo navegador do seu computador, tablet ou celular, de qualquer lugar." 
                                />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.3em] mb-8 border-l-4 border-[#E6005C] pl-4">Funcionamento e Operação</h2>
                            <div className="space-y-8">
                                <FAQItem 
                                    question="9. Vocês cadastram meu cardápio para mim?" 
                                    answer="Não. Nossa plataforma é 'Self-Service'. Você tem total liberdade e autonomia para cadastrar, alterar preços e trocar fotos do seu cardápio a qualquer momento, em tempo real." 
                                />
                                <FAQItem 
                                    question="10. O aplicativo faz a entrega dos pedidos (motoboy)?" 
                                    answer="Não. O Sabor Express 360 fornece a tecnologia para você receber os pedidos (App de Delivery e Gestão). A produção da comida e a logística de entrega (motoboys próprios ou terceirizados) são de responsabilidade total do seu restaurante." 
                                />
                                <FAQItem 
                                    question="11. Como meu cliente faz o pedido? Ele precisa baixar um app?" 
                                    answer="Não precisa baixar nada! Você terá um Link Exclusivo do seu restaurante. Seu cliente clica, acessa o cardápio digital no navegador, faz o cadastro rápido e pede. Simples e sem barreiras." 
                                />
                                <FAQItem 
                                    question="12. O que acontece se o cliente pedir fora do horário de funcionamento?" 
                                    answer="O sistema é inteligente. Se o seu restaurante estiver configurado como 'Fechado', o cardápio ficará em preto e branco (escala de cinza) e os botões de compra serão bloqueados automaticamente, impedindo pedidos que você não possa atender." 
                                />
                                <FAQItem 
                                    question="13. Posso criar contas para meus funcionários?" 
                                    answer={
                                        <div className="space-y-3">
                                            <p>Sim! Você pode e deve criar perfis individuais com acessos limitados:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li><strong>Garçom:</strong> Só lança pedidos.</li>
                                                <li><strong>Cozinheiro:</strong> Só vê a tela de produção.</li>
                                                <li><strong>Caixa:</strong> Só fecha contas. Isso organiza sua operação e protege seus dados financeiros.</li>
                                            </ul>
                                        </div>
                                    } 
                                />
                            </div>
                        </section>

                        <section className="border-t border-gray-50 pt-10 text-center">
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Sabor Express 360 - Transparência e Qualidade</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FAQPage;
