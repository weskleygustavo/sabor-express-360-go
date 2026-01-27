
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { CheckIcon, ShoppingCartIcon, BarChartIcon, WalletIcon, TableIcon, ChefHatIcon, BikeIcon, PackageCheckIcon, StoreIcon, ChevronRightIcon, ChevronLeftIcon } from '../components/icons';

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-[#E6005C] mb-8 group-hover:bg-gradient-to-br group-hover:from-[#FF8C00] group-hover:to-[#E6005C] group-hover:text-white transition-all duration-500 shadow-inner">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-12 h-12" })}
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-4 uppercase">{title}</h3>
        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[220px]">{desc}</p>
    </div>
);

const PricingCard = ({ title, price, originalPrice, discount, period, isPopular, features, whatsappLink, buttonLabel, onButtonClick }: any) => (
    <div className={`relative bg-white p-7 md:p-8 rounded-[2.5rem] border-2 transition-all flex flex-col h-full ${isPopular ? 'border-[#E6005C] shadow-2xl scale-105 z-10' : 'border-gray-50 shadow-sm hover:border-orange-200'}`}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white px-5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                Melhor Custo-Benefício
            </div>
        )}
        <div className="text-center mb-6 min-h-[110px] flex flex-col justify-center">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-1">{title}</h3>
            <div className="flex flex-col items-center justify-center">
                {originalPrice && <span className="text-gray-400 line-through text-[11px] font-bold">De {originalPrice}</span>}
                <div className="flex items-end space-x-1">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">{price}</span>
                    <span className="text-gray-400 font-bold text-xs mb-1">/{period}</span>
                </div>
                {discount && (
                    <div className="mt-1.5 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {discount}% de Desconto 🔥
                    </div>
                )}
            </div>
        </div>

        <ul className="space-y-2.5 mb-8 flex-grow">
            {features.map((f: string, i: number) => (
                <li key={i} className="flex items-start text-left">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0 mr-2.5 mt-0.5" />
                    <span className="text-[12px] font-bold text-gray-600 leading-tight">{f}</span>
                </li>
            ))}
        </ul>

        {whatsappLink ? (
            <a 
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-4 rounded-2xl font-black text-center text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isPopular ? 'bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white shadow-xl shadow-red-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
                {buttonLabel || 'Assinar Agora'}
            </a>
        ) : (
            <button 
                onClick={onButtonClick}
                className="w-full py-4 rounded-2xl font-black text-center text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white shadow-xl shadow-orange-100 hover:scale-105"
            >
                {buttonLabel || 'Começar'}
            </button>
        )}
    </div>
);

const FAQAccordionItem = ({ question, answer }: { question: string, answer: string | React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-8 flex justify-between items-center text-left hover:bg-gray-50/50 transition-colors"
            >
                <span className="text-base font-black text-gray-900 uppercase tracking-tighter">{question}</span>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-[#E6005C]' : 'text-gray-300'}`}>
                    <ChevronRightIcon className="w-5 h-5" />
                </div>
            </button>
            {isOpen && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-2 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4">
                        {answer}
                    </div>
                </div>
            )}
        </div>
    );
};

const LandingPage: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
    const whatsappNumber = "5584999828713";
    const waBase = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20Sabor%20Express%20360%20no%20plano%20`;

    const commonFeatures = [
        "Gestão de Pedidos Omnichannel",
        "Business Intelligence (BI) Real-time",
        "PDV de Alta Performance",
        "Fluxo de Caixa e Contas a Pagar",
        "Controle de Estoque Inteligente",
        "App Cardápio Digital (Delivery)",
        "Mapa de Mesas e Atendimento Local",
        "Gestão de Equipe e Permissões",
        "Impressão de Cupons e Relatórios",
        "Suporte Prioritário VIP"
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
            {/* Header Fixo */}
            <nav className="bg-white/80 backdrop-blur-md fixed top-0 left-0 w-full z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C00] to-[#E6005C] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">S</div>
                        <span className="font-black text-2xl text-gray-900 tracking-tighter uppercase">Sabor Express <span className="text-[#E6005C]">360</span></span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#E6005C] transition-colors">Recursos</a>
                        <a href="#pricing" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#E6005C] transition-colors">Planos</a>
                        <a href="#faq" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#E6005C] transition-colors">FAQ</a>
                        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#E6005C] transition-colors">Suporte</a>
                        <button 
                            onClick={onAuth}
                            className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gray-200"
                        >
                            ENTRAR / CADASTRAR
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Ajustado pt-40 para compensar o header fixed */}
            <section className="relative pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-10">
                    <div className="inline-block bg-orange-100 text-[#FF8C00] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 animate-bounce">
                        🚀 ERP SaaS HÍBRIDO (ON + OFF PREMISE)
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none max-w-5xl mx-auto uppercase">
                        Controle total do seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#E6005C]">NEGÓCIO</span> em um só lugar
                    </h1>
                    <p className="text-gray-500 font-bold text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        O sabor Express 360 é ideal para Bares, Restaurantes, Lanchonetes, Pizzarias e Sorveterias, é a solução definitiva para unificar Delivery, Atendimento de Mesa, Cozinha e Financeiro. Projetado para escalar o seu negócio.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={onAuth} className="w-full sm:w-auto bg-gradient-to-r from-[#FF8C00] to-[#E6005C] text-white px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-200 hover:scale-105 transition-all">
                            Começar Agora Gratuitamente
                        </button>
                    </div>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-orange-400/10 blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E6005C]/10 blur-[150px] -z-10"></div>
            </section>

            {/* Features Detail */}
            <section id="features" className="py-24 bg-white px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.4em] mb-4">Por que escolher o APP Sabor Express 360?</h2>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-20">Funcionalidades de um ERP Moderno que atende as demandas de mercado</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        <FeatureCard icon={<ShoppingCartIcon/>} title="Order Management" desc="Centralização de pedidos multicanal: Mesa e Delivery em uma única fila inteligente." />
                        <FeatureCard icon={<BarChartIcon/>} title="Business Intelligence" desc="Dashboard executivo com KPIs financeiros, lucro bruto, CMV e ranking de produtos." />
                        <FeatureCard icon={<WalletIcon/>} title="Gestão Financeira" desc="Controle total de fluxo de caixa diário com arraste de saldo e gestão de contas a pagar." />
                        <FeatureCard icon={<PackageCheckIcon/>} title="Estoque Inteligente" desc="Monitoramento de valor em estoque e alerta automático de ruptura (20% do saldo)." />
                        <FeatureCard icon={<TableIcon/>} title="Gestão de Mesas" desc="Mapeamento visual, comanda cumulativa e status de produção individualizado." />
                        <FeatureCard icon={<ChefHatIcon/>} title="Cozinha (KDS)" desc="Painel de produção unificado para cozinheiros com feedback em tempo real para o staff." />
                        <FeatureCard icon={<BikeIcon/>} title="Delivery Próprio" desc="Cardápio digital integrado para o cliente final, com bloqueio automático por horário." />
                        <FeatureCard icon={<StoreIcon/>} title="Perfil de Restaurante" desc="Painel para criar e configurar as informações de seu restaurante, taxas e entrega, redes sociais e contatos." />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 bg-gray-50 relative">
                <div className="max-w-[80rem] mx-auto text-center">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4">Planos que cabem no seu bolso</h2>
                    <p className="text-gray-500 font-bold text-lg mb-16">Assine a melhor ferramenta de gestão do mercado com condições exclusivas de lançamento.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
                        <PricingCard 
                            title="Plano Free (Trial)"
                            price="R$ 0,00"
                            period="7 dias"
                            buttonLabel="TESTAR AGORA"
                            onButtonClick={onAuth}
                            features={[
                                "7 dias de testes com todas as funções",
                                "Acesso total ao Painel Gestor",
                                "Configure seu Cardápio Digital",
                                "Teste o App com sua Equipe",
                                "Sem Cartão de Crédito necessário",
                                "Suporte Especializado"
                            ]}
                        />
                        <PricingCard 
                            title="Plano Mensal"
                            price="R$ 59,99"
                            originalPrice="R$ 79,99"
                            discount="25"
                            period="mês"
                            buttonLabel="Assinar Mensal"
                            features={commonFeatures}
                            whatsappLink={`${waBase}Mensal`}
                        />
                        <PricingCard 
                            title="Plano Anual"
                            price="R$ 449,99"
                            originalPrice="R$ 949,99"
                            discount="52"
                            period="ano"
                            isPopular={true}
                            buttonLabel="Assinar Anual"
                            features={[
                                ...commonFeatures,
                                "Preço Congelado por 12 meses",
                                "Equivalente a R$ 37,49/mês",
                                "Economia de R$ 500,00/ano"
                            ]}
                            whatsappLink={`${waBase}Anual`}
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-32 bg-white px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-[10px] font-black text-[#E6005C] uppercase tracking-[0.4em] mb-4">Dúvidas? Nós respondemos</h2>
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-16">Perguntas Frequentes</h3>
                    
                    <div className="space-y-4 text-left">
                        <FAQAccordionItem 
                            question="Como funciona o período de teste grátis?" 
                            answer="Ao se cadastrar, você ganha automaticamente 07 dias de acesso total a todas as ferramentas (Gestão, PDV, Delivery, KDS). Não pedimos cartão de crédito no cadastro. É só entrar e usar." 
                        />
                        <FAQAccordionItem 
                            question="Quais são as formas de pagamento aceitas?" 
                            answer="Trabalhamos exclusivamente com PIX, na modalidade pré-paga ('pagou, usou'). Isso garante a liberação imediata do seu sistema sem burocracia de análise de crédito bancário. Não aceitamos cartões de crédito ou boletos." 
                        />
                        <FAQAccordionItem 
                            question="Meus dados estão seguros?" 
                            answer="Sim! Utilizamos tecnologia de ponta como Row Level Security (Segurança em Nível de Linha) para garantir que cada restaurante tenha sua 'ilha' isolada de dados. Além disso, nossos servidores estão no Brasil para máxima velocidade." 
                        />
                        <FAQAccordionItem 
                            question="Preciso baixar algum app no celular?" 
                            answer="Não! O Sabor Express 360 é uma Web App (SaaS) que funciona direto no navegador. Tanto você quanto seus clientes só precisam clicar no link para acessar tudo, sem downloads pesados." 
                        />
                        <FAQAccordionItem 
                            question="Posso criar contas para meus funcionários?" 
                            answer="Sim! Você pode criar perfis para Garçons, Cozinheiros e Operadores de Caixa com permissões restritas, organizando sua operação e protegendo seus dados financeiros." 
                        />
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Ainda tem dúvidas?</p>
                        <a 
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-3 bg-gray-50 border border-gray-100 text-gray-900 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-sm"
                        >
                            <span>Falar com o Suporte</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left space-y-4">
                        <div className="flex items-center justify-center md:justify-start space-x-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
                            <span className="font-black text-2xl tracking-tighter uppercase">Sabor Express <span className="text-[#E6005C]">360</span></span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm font-medium">ERP SaaS – App Gestão de Bares e Restaurantes. Transforme sua operação em uma máquina de vendas eficiente.</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <div className="flex flex-wrap justify-center gap-6">
                            <a href="/terms-of-use" className="text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest whitespace-nowrap">Termos de Uso</a>
                            <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest whitespace-nowrap">Política de Privacidade</a>
                            <a href="/faq" className="text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest whitespace-nowrap">Perguntas Frequentes</a>
                            <a href={`https://wa.me/${whatsappNumber}`} className="text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest whitespace-nowrap">Suporte</a>
                        </div>
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} Sabor Express 360. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
