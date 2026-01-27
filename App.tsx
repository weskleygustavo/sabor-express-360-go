
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import CustomerView from './pages/customer/CustomerView';
import AdminView from './pages/admin/AdminView';
import ForgotPasswordPage from './pages/ForgotPassword';
import UpdatePasswordPage from './pages/UpdatePassword';
import CustomerLoginPage from './pages/CustomerLoginPage';
import InviteRequestPage from './pages/InviteRequestPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import FAQPage from './pages/FAQPage';
import { Restaurant } from './types';

const AppContainer: React.FC = () => {
    const { authLoading, session, user, route, appError, fetchRestaurantBySlug } = useApp();
    const [showLogin, setShowLogin] = useState(false);
    const [targetRestaurant, setTargetRestaurant] = useState<Restaurant | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(true);
    const [isInviteFlow, setIsInviteFlow] = useState(false);

    useEffect(() => {
        const checkSlug = async () => {
            const path = window.location.pathname;
            
            // Lógica de Convite: /invite/slug-do-restaurante
            if (path.startsWith('/invite/')) {
                const inviteSlug = path.replace('/invite/', '');
                const res = await fetchRestaurantBySlug(inviteSlug);
                if (res) {
                    setTargetRestaurant(res);
                    setIsInviteFlow(true);
                    // Salva para persistir após login
                    sessionStorage.setItem('pending_invite_restaurant_id', res.id);
                    sessionStorage.setItem('pending_invite_slug', res.slug);
                }
            } else {
                const slugPath = path.replace('/', '');
                const systemRoutes = ['', 'forgot-password', 'update-password', 'terms-of-use', 'privacy-policy', 'faq'];
                
                if (slugPath && !systemRoutes.includes(slugPath)) {
                    const res = await fetchRestaurantBySlug(slugPath);
                    if (res) {
                        setTargetRestaurant(res);
                    }
                }
            }
            setIsCheckingSlug(false);
        };
        checkSlug();
    }, [fetchRestaurantBySlug]);

    if (authLoading || isCheckingSlug) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando ambiente...</p>
            </div>
        );
    }

    if (appError) {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center p-4">
                <div className="text-center max-w-lg bg-white p-8 rounded-xl shadow-lg border border-red-200">
                    <h1 className="text-2xl font-bold text-red-700">Erro de Sistema</h1>
                    <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md text-sm font-mono text-left break-words">
                        {appError}
                    </div>
                    <button onClick={() => window.location.href = '/'} className="mt-6 bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Voltar ao Início</button>
                </div>
            </div>
        );
    }

    if (route === '/forgot-password') return <ForgotPasswordPage />;
    if (route === '/update-password') return <UpdatePasswordPage />;
    if (route === '/terms-of-use') return <TermsPage />;
    if (route === '/privacy-policy') return <PrivacyPolicyPage />;
    if (route === '/faq') return <FAQPage />;

    // Fluxo de Convite: Se logado e tiver convite pendente, mostra tela de solicitação
    if (session && user && sessionStorage.getItem('pending_invite_restaurant_id')) {
        // Se o usuário já é staff de algum lugar, talvez não devesse ver isso, 
        // mas permitimos para que ele possa trocar de vínculo se desejar.
        return <InviteRequestPage />;
    }

    // Caso o usuário não esteja logado
    if (!session) {
        if (targetRestaurant) {
            return <CustomerLoginPage restaurant={targetRestaurant} />;
        }

        if (showLogin) {
            return (
                <div className="relative">
                    <button 
                        onClick={() => setShowLogin(false)}
                        className="fixed top-8 left-8 z-[60] bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl border border-gray-100 hover:scale-105 transition-all"
                    >
                        ← Voltar ao Site
                    </button>
                    <LoginPage />
                </div>
            );
        }
        return <LandingPage onAuth={() => setShowLogin(true)} />;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando dados...</p>
            </div>
        );
    }

    const isAdmin = user.role === 'admin' || user.role === 'admin_restaurante';
    const isStaff = !!user.isWaiter || !!user.isCashier || !!user.isCook;

    if (isAdmin || isStaff) {
        return <AdminView />;
    }

    return <CustomerView />;
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContainer />
        </AppProvider>
    );
};

export default App;
