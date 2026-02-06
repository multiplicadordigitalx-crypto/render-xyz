
import React, { useState, useEffect } from 'react';
import {
  Zap,
  LogIn,
  LogOut,
  Plus,
  Coins,
  Key,
  X,
  Menu,
  Download,
  Trash2,
  User,
  History,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { authService } from './services/authService';

// Components
import { authService as mockAuthService } from './services/authService'; // Keeping for type reference if needed
import { RenderTool } from './components/RenderTool';
import { AuthView } from './components/AuthView';
import { AdminPanel } from './components/AdminPanel';
import { CreditModal } from './components/CreditModal';
import { UserProfile } from './components/UserProfile';
import { CpfModal } from './components/CpfModal';

// Landing Components
import { Hero } from './components/landing/Hero';
import { DemoSlider } from './components/landing/DemoSlider';
import { HowItWorks } from './components/landing/HowItWorks';
import { Testimonials } from './components/landing/Testimonials';
import { Pricing } from './components/landing/Pricing';
import { FAQ } from './components/landing/FAQ';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';

// Types & Services
import { MOCK_MODE } from './services/geminiService';
import { Toaster, toast } from 'react-hot-toast';
import { useScrollReveal } from './services/scrollReveal';
import { PricingPlan, RenderHistoryItem, RenderStyle, CreditPackage, AppUser, LandingSettings, AuthViewMode, UserPlan } from './types';
import { stripeService } from './services/stripeService';
import { PaymentMethodModal } from './components/PaymentMethodModal';
import { PixCheckoutModal } from './components/PixCheckoutModal';

const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    name: "Essencial",
    price: "0",
    period: "/mês",
    features: ["3 renders por mês", "Qualidade 1K Standard", "Marca d'água Render XYZ", "Uso pessoal e testes"],
    buttonText: "Começar Grátis",
    resolutionLabel: "1K"
  },
  {
    name: "Estúdio",
    price: "79",
    period: "/mês",
    features: ["60 renders/mês", "Qualidade 2K HD Pro", "Sem marca d'água", "Créditos acumulativos"],
    buttonText: "Assinar Agora",
    isPopular: true,
    resolutionLabel: "2K",
    externalId: "price_1Sv1OpEQ6obY8Ge944QhB3SZ"
  },
  {
    name: "Elite",
    price: "149",
    period: "/mês",
    features: ["250 renders/mês (Fair Use)", "Qualidade 4K Ultra Pro", "Créditos acumulativos", "Suporte VIP via WhatsApp", "Acesso Antecipado"],
    buttonText: "Acessar Elite",


    externalId: "price_1Sv1PHEQ6obY8Ge93N3Sxiit"
  }
];

const DEFAULT_CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'p1', amount: 20, price: '24,90', description: 'Pack Iniciante', externalId: 'price_1Sv1PwEQ6obY8Ge9m6L0F5V1' },
  { id: 'p2', amount: 100, price: '99,90', description: 'Pack Profissional', externalId: 'price_1Sv1QKEQ6obY8Ge9YxUdxd0A' },
  { id: 'p3', amount: 300, price: '279,90', description: 'Pack Office', externalId: 'price_1Sv1QiEQ6obY8Ge9gtui9ODr' },
];

const DEFAULT_LANDING: LandingSettings = {
  showcaseBefore: "/assets/projeto-sem-render.jpg",
  showcaseAfter: "/assets/renderxyz-dia.jpg",
  heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-architect-working-on-a-digital-tablet-34444-large.mp4",
  heroVideoPoster: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
};

const FAQS = [
  { q: "Como funcionam os créditos?", a: "Cada crédito permite gerar 1 render de alta qualidade. Você escolhe a resolução (1K, 2K ou 4K) na hora de criar o render. Créditos comprados nunca expiram." },
  { q: "Qual a diferença entre resoluções 1K, 2K e 4K?", a: "1K é ideal para testes e visualizações rápidas. 2K HD é o padrão para apresentações digitais e redes sociais. 4K Ultra oferece nitidez extrema para impressão em grandes formatos e apresentações premium." },
  { q: "Os créditos expiram?", a: "Não! Diferente de outros serviços, na Render XYZ seus créditos nunca expiram. Use no seu ritmo, quando precisar." },
  { q: "Posso usar em projetos comerciais?", a: "Sim! Todos os renders gerados são seus para usar como quiser - portfólio, apresentações para clientes, redes sociais, impressão, etc." },
  { q: "Como funciona a garantia de satisfação?", a: "Se você não estiver satisfeito com o serviço, entre em contato em até 7 dias após a compra e devolvemos seu dinheiro integralmente." },
  { q: "Quanto tempo leva para gerar um render?", a: "Na maioria dos casos, seus renders ficam prontos em segundos. Em horários de pico, pode levar até alguns minutos." },
];

// Declare aistudio globally
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthViewMode>('login');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [credits, setCredits] = useState(3);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(!!sessionStorage.getItem('pendingBillId'));
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [history, setHistory] = useState<RenderHistoryItem[]>([]);
  const [landingSettings, setLandingSettings] = useState<LandingSettings>(DEFAULT_LANDING);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(DEFAULT_PRICING_PLANS);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(DEFAULT_CREDIT_PACKAGES);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfBlocking, setCpfBlocking] = useState(false);

  // Payment method selection modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Initial loading state to prevent flash of content
  const [appLoading, setAppLoading] = useState(false);

  // State for direct checkout flow (payment first, then register)
  const [pendingPaymentData, setPendingPaymentData] = useState<{
    email: string;
    planName: string;
    sessionId: string;
  } | null>(null);

  useScrollReveal([isLoggedIn, showAuth]);

  // Payment processing is now handled via Stripe webhook
  useEffect(() => {
    setProcessingPayment(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // LEGACY: Old payment flow for credits (still used for credit packages)
    const legacyPaymentSuccess = params.get('payment_success');
    const creditsPurchased = params.get('credits');
    const subscriptionSuccess = params.get('success');
    const canceled = params.get('canceled');
    const paymentStatus = params.get('payment');
    const planName = params.get('plan'); // AbacatePay returns plan name like "20 Créditos"

    // Store pending credits in sessionStorage BEFORE cleaning URL
    if (legacyPaymentSuccess === 'true' && creditsPurchased) {
      const amount = parseInt(creditsPurchased, 10);
      if (!isNaN(amount) && amount > 0) {
        sessionStorage.setItem('pendingCredits', amount.toString());
      }
    }

    // NEW: Handle AbacatePay return with ?payment=success&plan=X Créditos
    if (paymentStatus === 'success' && planName) {
      // Extract credit amount from plan name (e.g., "20 Créditos" -> 20)
      const creditMatch = planName.match(/(\d+)/);
      if (creditMatch) {
        const amount = parseInt(creditMatch[1], 10);
        if (!isNaN(amount) && amount > 0) {
          sessionStorage.setItem('pendingCredits', amount.toString());
          console.log(`Stored ${amount} pending credits from AbacatePay return`);

          // If user is NOT logged in, show registration screen
          if (!auth.currentUser) {
            // We'll set this after a tiny delay to let React render
            setTimeout(() => {
              setAuthMode('register');
              setShowAuth(true);
              toast.success(`Pagamento confirmado! Crie sua conta para receber ${amount} créditos.`, {
                duration: 5000,
                style: {
                  borderRadius: '15px',
                  background: '#000',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '900',
                  textTransform: 'uppercase'
                }
              });
            }, 100);
          }
        }
      }
    }

    // Store subscription success flag
    if (subscriptionSuccess === 'true') {
      sessionStorage.setItem('subscriptionSuccess', 'true');
    }

    // Clean URL immediately to prevent duplicate processing
    if (legacyPaymentSuccess || subscriptionSuccess || canceled || paymentStatus) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Process canceled payment
    if (canceled === 'true' || paymentStatus === 'canceled') {
      toast.error('Pagamento cancelado', {
        style: {
          borderRadius: '15px',
          background: '#000',
          color: '#fff'
        }
      });
    }
  }, []);

  // Process pending payment if user is logged in (Direct Checkout for Logged Users)
  useEffect(() => {
    if (currentUser && pendingPaymentData && currentUser.email === pendingPaymentData.email) {
      handleAuthSuccess(currentUser);
    }
  }, [currentUser, pendingPaymentData]);

  // Process pending credits when currentUser becomes available
  useEffect(() => {
    if (!currentUser) return;

    const pendingCredits = sessionStorage.getItem('pendingCredits');
    const subscriptionSuccess = sessionStorage.getItem('subscriptionSuccess');

    // Process pending credit purchase
    // pendingCredits logic removed to prevent free credits vulnerability
    // Credits are now securely added via Stripe Webhook only

    // Process subscription success
    if (subscriptionSuccess) {
      sessionStorage.removeItem('subscriptionSuccess');
      toast.success('Pagamento confirmado!', {
        style: {
          borderRadius: '15px',
          background: '#000',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }
      });
    }
  }, [currentUser]); // Process when currentUser becomes available

  useEffect(() => {
    // 1. Check API Key
    const checkKey = async () => {
      if (MOCK_MODE) {
        setHasApiKey(true);
        return;
      }

      if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setAppLoading(false);
    }, 3000);

    // 2. Firebase Auth Listener & Profile Sync
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);

        // Sub 1: Profile real-time
        const unsubscribeProfile = onSnapshot(doc(db, "users", firebaseUser.uid), (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as AppUser;
            setCurrentUser(userData);
            setCredits(userData.credits);
          }
        }, (error) => {
          console.error("Error in Profile Snapshot:", error);
          if (error.code === 'permission-denied') {
            // Handle permission error (common during logout, so we ignore UI alert)
            console.warn('Permission denied (likely logging out).');
          }
        });

        // Sub 2: History real-time
        const historyQuery = query(
          collection(db, "history"),
          where("userId", "==", firebaseUser.uid),
          orderBy("timestamp", "desc")
        );

        const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
          const historyItems = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as RenderHistoryItem));
          setHistory(historyItems);
        }, (error) => {
          console.error("Error in History Snapshot:", error);
        });

        return () => {
          unsubscribeProfile();
          unsubscribeHistory();
        };
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setHistory([]);
      }
      setAppLoading(false); // Authentication check complete
    });

    // 3. Global Settings (Landing, Pricing, Packages)
    const fetchGlobalSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "global"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.landing) setLandingSettings(data.landing);
          if (data.pricing) setPricingPlans(data.pricing);
          if (data.credits) setCreditPackages(data.credits);
        }
      } catch (error) {
        console.error("Error fetching global settings:", error);
      }
    };
    fetchGlobalSettings();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 4. Admin: Listen to all users (Only if admin)
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setAppUsers([]);
      return;
    }

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppUser));
      setAppUsers(usersList);
    });

    return () => unsubscribeUsers();
  }, [currentUser]);


  const handleAuthSuccess = async (user: AppUser) => {
    // 1. Check for pending direct checkout payment
    if (pendingPaymentData && pendingPaymentData.email === user.email) {
      try {
        // Update user plan based on payment
        let plan: UserPlan = 'free';
        if (pendingPaymentData.planName.toLowerCase().includes('estúdio') || pendingPaymentData.planName.toLowerCase().includes('studio')) {
          plan = 'studio';
        } else if (pendingPaymentData.planName.toLowerCase().includes('elite')) {
          plan = 'elite';
        }

        if (plan !== 'free') {
          await updateDoc(doc(db, "users", user.id), {
            plan: plan,
            // Add some credits as bonus if needed, or rely on subscription logic
          });
          toast.success(`Plano ${pendingPaymentData.planName} ativado com sucesso!`, {
            style: { borderRadius: '15px', background: '#000', color: '#fff' }
          });
        }
        setPendingPaymentData(null);
      } catch (error) {
        console.error('Error updating user plan after direct checkout:', error);
        toast.error('Erro ao ativar plano. Entre em contato com o suporte.');
      }
    }

    // 2. Check for pending plan from sessionStorage (Legacy flow)
    const pendingPlanStr = sessionStorage.getItem('pendingPlan');
    if (pendingPlanStr) {
      try {
        const pendingPlan = JSON.parse(pendingPlanStr) as PricingPlan;
        sessionStorage.removeItem('pendingPlan');
        setSelectedPlan(pendingPlan);
      } catch (e) {
        console.error('Error parsing pending plan:', e);
      }
    }

    // onAuthStateChanged will handle the state update
    setShowAuth(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdminMode(false);
    toast.success('Sessão encerrada com sucesso', {
      style: {
        borderRadius: '15px',
        background: '#000',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }
    });
  };

  const onRenderComplete = async (url: string, style: RenderStyle, cost: number = 1) => {
    if (!currentUser) return;

    const newCredits = credits - cost;
    setCredits(newCredits);

    try {
      // 1. Update Credits in Firestore
      await updateDoc(doc(db, "users", currentUser.id), {
        credits: newCredits
      });

      // 2. Add to History in Firestore
      await addDoc(collection(db, "history"), {
        userId: currentUser.id,
        url,
        style,
        timestamp: Date.now()
      });

      // Local state will be updated by the listener in useEffect
    } catch (error) {
      console.error("Error saving render data:", error);
    }
  };

  const handleOpenSelectKey = async () => {
    if (typeof window.aistudio !== 'undefined' && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // buyCredits function removed - credits are now only added via webhook after payment confirmation

  const handleBuyCreditsFromLanding = (pkg: CreditPackage) => {
    // Show payment method selection modal
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePayWithCard = async () => {
    if (!selectedPackage) return;

    const priceString = selectedPackage.price.replace(',', '.');
    const amountInCentavos = Math.round(parseFloat(priceString) * 100);

    setPaymentLoading(true);
    try {
      await stripeService.createCheckoutSession({
        amount: amountInCentavos,
        credits: selectedPackage.amount,
        customerEmail: currentUser?.email,
        userId: currentUser?.id
      });
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      toast.error(error.message || 'Erro ao iniciar pagamento com cartão');
      setPaymentLoading(false);
    }
  };

  const handlePayWithPix = () => {
    if (!currentUser) {
      setShowPaymentModal(false);
      toast('Crie uma conta gratis para pagar com PIX', {
        icon: '🔒',
        style: { borderRadius: '15px', background: '#000', color: '#fff' }
      });
      setAuthMode('register');
      setShowAuth(true);
      return;
    }
    setShowPaymentModal(false);
    setShowPixModal(true);
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "history", id));
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  const downloadHistoryImage = (url: string, style: RenderStyle) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `renderxyz-render-${style.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#B6B09F]/30 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (showAuth) return (
    <AuthView
      initialMode={authMode}
      onSuccess={handleAuthSuccess}
      onBack={() => {
        setShowAuth(false);
        setPendingPaymentData(null); // Clear pending data if user cancels
      }}
      prefilledEmail={pendingPaymentData?.email}
      lockedEmail={!!pendingPaymentData?.email}
      pendingPlanName={pendingPaymentData?.planName}
    />
  );

  if (isLoggedIn) {
    if (!hasApiKey) {
      return (
        <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#EAE4D5] border border-[#B6B09F]/30 rounded-[35px] p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8"><Key className="text-white w-8 h-8" /></div>
            <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Ativação</h2>
            <p className="text-[#7A756A] text-xs font-bold uppercase tracking-widest mb-10">Vincule uma chave API Studio para iniciar.</p>
            <button onClick={handleOpenSelectKey} className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Selecionar Chave</button>
            <button onClick={handleLogout} className="mt-8 text-[9px] font-black uppercase tracking-widest text-[#7A756A]">Sair</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F2F2F2] text-black">
        {isAdminMode && (
          <AdminPanel
            landingSettings={landingSettings}
            setLandingSettings={setLandingSettings}
            pricingPlans={pricingPlans}
            setPricingPlans={setPricingPlans}
            creditPackages={creditPackages}
            setCreditPackages={setCreditPackages}
            appUsers={appUsers}
            setAppUsers={setAppUsers}
            onClose={() => setIsAdminMode(false)}
          />
        )}

        {/* Payment Modals for Logged In User */}
        {selectedPackage && (
          <>
            <PaymentMethodModal
              isOpen={showPaymentModal}
              onClose={() => { setShowPaymentModal(false); setPaymentLoading(false); }}
              package={selectedPackage}
              onSelectCard={handlePayWithCard}
              onSelectPix={handlePayWithPix}
              isLoading={paymentLoading}
            />

            {currentUser && (
              <PixCheckoutModal
                isOpen={showPixModal}
                onClose={() => setShowPixModal(false)}
                selectedPackage={selectedPackage}
                user={currentUser}
              />
            )}
          </>
        )}

        <div className="sticky top-0 z-50">
          {currentUser?.cpf === "" && (
            <div
              onClick={() => { setCpfBlocking(false); setShowCpfModal(true); }}
              className="bg-orange-500 text-white py-2 text-center text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-orange-600 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Ação Necessária: Vincule seu CPF para liberar todas as funcionalidades. <span className="underline">Resolver Agora</span>
              </span>
            </div>
          )}
          <header className="h-16 md:h-20 border-b border-[#B6B09F]/20 bg-[#EAE4D5]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8">
            <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/assets/logo.png" alt="Render XYZ" className="h-6 md:h-8" />
            </a>
            <div className="flex items-center space-x-4 md:space-x-8">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setIsAdminMode(true)}
                  className="p-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-all flex items-center justify-center"
                  title="Painel Admin"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-all"
              >
                <User className="w-4 h-4" />
              </button>
              <div className="flex items-center bg-black text-white px-3 md:px-5 py-1.5 md:py-2 rounded-xl shadow-lg">
                <Coins className="w-3 h-3 md:w-4 md:h-4 mr-2 text-[#7A756A]" />
                <span className="text-xs md:text-sm font-black">{credits}</span>
                <span className="text-[8px] md:text-[9px] font-bold text-[#7A756A] ml-1 uppercase">créditos</span>
                <button onClick={() => setShowCreditModal(true)} className="ml-3 md:ml-6 bg-[#B6B09F] text-black p-1 rounded transition-all"><Plus className="w-3 h-3" /></button>
              </div>
              <button onClick={handleLogout} className="p-2 bg-black/5 rounded-full"><LogOut className="w-3 h-3" /></button>
            </div>
          </header>
        </div>

        {showProfile && currentUser && (
          <UserProfile
            user={currentUser}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}

        {showCpfModal && currentUser && (
          <CpfModal
            user={currentUser}
            onSuccess={() => {
              setShowCpfModal(false);
              // If blocking was true (subscription flow), user can now proceed with checkout manually or we could auto-trigger.
              // For now simpler is to let them click confirm again.
            }}
            onClose={() => setShowCpfModal(false)}
            isBlocking={cpfBlocking}
          />
        )}

        {
          showCreditModal && (
            <CreditModal
              creditPackages={creditPackages}
              onBuyCredits={handleBuyCreditsFromLanding}
              onClose={() => setShowCreditModal(false)}
            />
          )
        }

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <section className="mb-12 md:mb-20">
            <div className="mb-6 md:mb-10 flex flex-col md:items-end md:flex-row justify-between border-b border-[#B6B09F]/20 pb-4 md:pb-6">
              <div><h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Studio Pro</h1><p className="text-[#7A756A] text-[9px] md:text-[11px] font-black uppercase tracking-widest">Fidelidade Extrema Ativa</p></div>
              <div className="mt-4 md:mt-0 flex items-center bg-[#B6B09F]/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase"><div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse" />ONLINE</div>
            </div>
            <div className="bg-[#EAE4D5] border border-[#B6B09F]/30 p-4 md:p-10 rounded-[35px] md:rounded-[50px]">
              <RenderTool
                onRenderComplete={onRenderComplete}
                credits={credits}
                userPlan={currentUser?.plan || 'free'}
                onKeyReset={() => setHasApiKey(false)}
                onUpgrade={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>
          </section>

          <section>
            <div className="mb-6 border-b border-[#B6B09F]/20 pb-4"><h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Galeria Recente</h2></div>
            {history.length === 0 ? (
              <div className="bg-[#EAE4D5]/40 border border-dashed border-[#B6B09F]/40 rounded-[30px] p-20 text-center text-[#7A756A] font-black uppercase tracking-widest text-[10px]">Aguardando primeiro render</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {history.map((item) => (
                  <div key={item.id} className="group bg-[#EAE4D5] border border-[#B6B09F]/30 rounded-[25px] overflow-hidden hover:border-black transition-all">
                    <div className="aspect-[4/3] relative">
                      <img src={item.url} alt="Render" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => downloadHistoryImage(item.url, item.style)} className="p-3 bg-white rounded-xl"><Download className="w-5 h-5" /></button>
                        <button onClick={() => deleteFromHistory(item.id)} className="p-3 bg-black text-white rounded-xl"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div >
    );
  }

  // Show loading while processing payment
  if (processingPayment) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/logo-icon.png" alt="Loading" className="w-20 h-20 mx-auto mb-6 animate-bounce" />
          <h2 className="text-lg font-black uppercase tracking-widest">Processando pagamento...</h2>
          <p className="text-[#7A756A] text-xs font-bold mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Payment Modals */}
      {selectedPackage && (
        <>
          <PaymentMethodModal
            isOpen={showPaymentModal}
            onClose={() => { setShowPaymentModal(false); setPaymentLoading(false); }}
            package={selectedPackage}
            onSelectCard={handlePayWithCard}
            onSelectPix={handlePayWithPix}
            isLoading={paymentLoading}
          />

          {currentUser && (
            <PixCheckoutModal
              isOpen={showPixModal}
              onClose={() => setShowPixModal(false)}
              selectedPackage={selectedPackage}
              user={currentUser}
            />
          )}
        </>
      )}

      <div className="min-h-screen bg-[#F2F2F2] text-black overflow-x-hidden">
        <nav className="fixed top-0 w-full z-50 glass h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/assets/logo.png" alt="Render XYZ" className="h-8 md:h-10" />
          </a>

          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Acessar</button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2"><Menu /></button>
          </div>

          <div className="hidden md:flex items-center space-x-12 text-[10px] font-black uppercase tracking-widest">
            <a href="#demo" className="hover:text-[#7A756A]">Portfólio</a>
            <a href="#how-it-works" className="hover:text-[#7A756A]">Processo</a>
            <a href="#pricing" className="hover:text-[#7A756A]">Preços</a>
            <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="bg-black text-white px-10 py-3.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl">Acessar App</button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[45] bg-[#EAE4D5] pt-24 px-8 md:hidden">
            <div className="flex flex-col space-y-8 text-xl font-black uppercase tracking-tighter">
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>Portfólio</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Processo</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Preços</a>
              <button onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }} className="w-full bg-black text-white py-6 rounded-2xl">Acessar App</button>
            </div>
          </div>
        )}

        <Hero
          onStartNow={() => { setAuthMode('register'); setShowAuth(true); }}
          onSeeInAction={() => { }}
        />

        <DemoSlider
          showcaseBefore={landingSettings.showcaseBefore}
          showcaseAfter={landingSettings.showcaseAfter}
        />

        <HowItWorks
          heroVideoUrl={landingSettings.heroVideoUrl}
          heroVideoPoster={landingSettings.heroVideoPoster}
        />

        <Testimonials />

        <Pricing
          creditPackages={creditPackages}
          onBuyCredits={handleBuyCreditsFromLanding}
        />



        <FAQ items={FAQS} />

        <CTA onStartNow={() => { setAuthMode('register'); setShowAuth(true); }} />

        <Footer />
      </div>
    </>
  );
};

export default function Root() {
  return (
    <>
      <Toaster position="bottom-right" />
      <App />
    </>
  );
}
