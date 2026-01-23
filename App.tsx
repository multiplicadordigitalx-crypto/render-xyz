
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
  LayoutDashboard
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
import { CheckoutModal } from './components/CheckoutModal';

// Landing Components
import { Hero } from './components/landing/Hero';
import { DemoSlider } from './components/landing/DemoSlider';
import { HowItWorks } from './components/landing/HowItWorks';
import { Pricing } from './components/landing/Pricing';
import { FAQ } from './components/landing/FAQ';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';

// Types & Services
import { Toaster, toast } from 'react-hot-toast';
import { useScrollReveal } from './services/scrollReveal';
import { PricingPlan, RenderHistoryItem, RenderStyle, CreditPackage, AppUser, LandingSettings, AuthViewMode } from './types';

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
    features: ["60 renders/mês", "Qualidade 2K HD Pro", "Sem marca d'água", "Créditos acumulativos", "Fila de prioridade"],
    buttonText: "Assinar Agora",
    isPopular: true,
    resolutionLabel: "2K"
  },
  {
    name: "Elite",
    price: "149",
    period: "/mês",
    features: ["250 renders/mês (Fair Use)", "Qualidade 4K Ultra Pro", "Créditos acumulativos", "Suporte VIP via WhatsApp", "Acesso Antecipado"],
    buttonText: "Acessar Elite",
    resolutionLabel: "4K"
  }
];

const DEFAULT_CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'p1', amount: 20, price: '14,90', description: 'Pack Iniciante' },
  { id: 'p2', amount: 100, price: '44,90', description: 'Pack Profissional' },
  { id: 'p3', amount: 300, price: '99,90', description: 'Pack Office' },
];

const DEFAULT_LANDING: LandingSettings = {
  showcaseBefore: "/assets/projeto-sem-render.jpg",
  showcaseAfter: "/assets/renderxyz-dia.jpg",
  heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-architect-working-on-a-digital-tablet-34444-large.mp4",
  heroVideoPoster: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
};

const FAQS = [
  { q: "O que são créditos acumulativos (Rollover)?", a: "Diferente de outros serviços, na Render XYZ seus créditos não expiram no fim do mês. Se você não usar todos os seus renders, eles acumulam para o próximo ciclo." },
  { q: "Qual a diferença entre resoluções 1K, 2K e 4K?", a: "1K é ideal para testes. 2K HD é o padrão para apresentações digitais, e 4K Ultra oferece nitidez extrema para impressão em grandes formatos." },
  { q: "Como funciona o upgrade ou cancelamento?", a: "Você tem controle total. Pode fazer upgrade ou cancelar sua assinatura a qualquer momento diretamente no seu painel." },
  { q: "Existe um limite real no plano Elite?", a: "O plano Elite oferece um limite de Uso Justo de 250 renders por mês para garantir processamento em velocidade máxima para todos." }
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
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [history, setHistory] = useState<RenderHistoryItem[]>([]);
  const [landingSettings, setLandingSettings] = useState<LandingSettings>(DEFAULT_LANDING);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(DEFAULT_PRICING_PLANS);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(DEFAULT_CREDIT_PACKAGES);

  useScrollReveal();

  useEffect(() => {
    // 1. Check API Key
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();

    // 2. Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setIsLoggedIn(true);

        // Fetch/Sync User Data
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          setCurrentUser(userData);
          setCredits(userData.credits);
        }

        // Real-time History Listener
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
        });

        return () => unsubscribeHistory();
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setCurrentUser(null);
        setHistory([]);
      }
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

    // 4. Admin: Listen to all users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppUser));
      setAppUsers(usersList);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
    };
  }, []);

  const handleAuthSuccess = (user: AppUser) => {
    // onAuthStateChanged will handle the state update
    setShowAuth(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
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

  const buyCredits = async (amount: number) => {
    if (!currentUser) return;
    const newCredits = credits + amount;

    try {
      await updateDoc(doc(db, "users", currentUser.id), {
        credits: newCredits
      });
      setCredits(newCredits);
    } catch (error) {
      console.error("Error updating credits:", error);
    }
    setShowCreditModal(false);
  };

  const handlePlanSelection = (plan: PricingPlan) => {
    if (!isLoggedIn) {
      setAuthMode('register');
      setShowAuth(true);
      return;
    }
    setSelectedPlan(plan);
  };

  const confirmSubscription = async () => {
    if (currentUser && selectedPlan) {
      const planCredits = parseInt(selectedPlan.price) > 0 ? 60 : 3;
      const newCredits = credits + planCredits;

      try {
        await updateDoc(doc(db, "users", currentUser.id), {
          plan: selectedPlan.name,
          credits: newCredits
        });
        setCredits(newCredits);
      } catch (error) {
        console.error("Error updating subscription:", error);
      }
    }
    setSelectedPlan(null);
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

  if (showAuth) return <AuthView initialMode={authMode} onSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)} />;

  if (isLoggedIn) {
    if (!hasApiKey) {
      return (
        <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#EAE4D5] border border-[#B6B09F]/30 rounded-[35px] p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8"><Key className="text-white w-8 h-8" /></div>
            <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 tracking-tighter">Ativação</h2>
            <p className="text-[#B6B09F] text-xs font-bold uppercase tracking-widest mb-10">Vincule uma chave API Studio para iniciar.</p>
            <button onClick={handleOpenSelectKey} className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Selecionar Chave</button>
            <button onClick={handleLogout} className="mt-8 text-[9px] font-black uppercase tracking-widest text-[#B6B09F]">Sair</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F2F2F2] text-black">
        <header className="h-16 md:h-20 border-b border-[#B6B09F]/20 bg-[#EAE4D5]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/assets/logo.png" alt="Render XYZ" className="h-6 md:h-8" />
          </a>
          <div className="flex items-center space-x-4 md:space-x-8">
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-all"
            >
              <User className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-black text-white px-3 md:px-5 py-1.5 md:py-2 rounded-xl shadow-lg">
              <Coins className="w-3 h-3 md:w-4 md:h-4 mr-2 text-[#B6B09F]" />
              <span className="text-xs md:text-sm font-black">{credits}</span>
              <button onClick={() => setShowCreditModal(true)} className="ml-3 md:ml-6 bg-[#B6B09F] text-black p-1 rounded transition-all"><Plus className="w-3 h-3" /></button>
            </div>
            <button onClick={handleLogout} className="p-2 bg-black/5 rounded-full"><LogOut className="w-3 h-3" /></button>
          </div>
        </header>

        {showProfile && currentUser && (
          <UserProfile
            user={currentUser}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}

        {showCreditModal && (
          <CreditModal
            creditPackages={creditPackages}
            onBuyCredits={buyCredits}
            onClose={() => setShowCreditModal(false)}
          />
        )}

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <section className="mb-12 md:mb-20">
            <div className="mb-6 md:mb-10 flex flex-col md:items-end md:flex-row justify-between border-b border-[#B6B09F]/20 pb-4 md:pb-6">
              <div><h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Studio Pro</h1><p className="text-[#B6B09F] text-[9px] md:text-[11px] font-black uppercase tracking-widest">Fidelidade Extrema Ativa</p></div>
              <div className="mt-4 md:mt-0 flex items-center bg-[#B6B09F]/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase"><div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse" />ONLINE</div>
            </div>
            <div className="bg-[#EAE4D5] border border-[#B6B09F]/30 p-4 md:p-10 rounded-[35px] md:rounded-[50px]">
              <RenderTool onRenderComplete={onRenderComplete} credits={credits} onKeyReset={() => setHasApiKey(false)} />
            </div>
          </section>

          <section>
            <div className="mb-6 border-b border-[#B6B09F]/20 pb-4"><h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Galeria Recente</h2></div>
            {history.length === 0 ? (
              <div className="bg-[#EAE4D5]/40 border border-dashed border-[#B6B09F]/40 rounded-[30px] p-20 text-center text-[#B6B09F] font-black uppercase tracking-widest text-[10px]">Aguardando primeiro render</div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-black overflow-x-hidden">
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

      <nav className="fixed top-0 w-full z-50 glass h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
        <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/assets/logo.png" alt="Render XYZ" className="h-8 md:h-10" />
        </a>

        <div className="md:hidden flex items-center space-x-4">
          <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Acessar</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2"><Menu /></button>
        </div>

        <div className="hidden md:flex items-center space-x-12 text-[10px] font-black uppercase tracking-widest">
          <a href="#demo" className="hover:text-[#B6B09F]">Portfólio</a>
          <a href="#how-it-works" className="hover:text-[#B6B09F]">Processo</a>
          <a href="#pricing" className="hover:text-[#B6B09F]">Preços</a>
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

      <Pricing
        plans={pricingPlans}
        onSelectPlan={handlePlanSelection}
      />

      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onConfirm={confirmSubscription}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      <FAQ items={FAQS} />

      <CTA onStartNow={() => { setAuthMode('register'); setShowAuth(true); }} />

      <Footer onAdminClick={() => setIsAdminMode(true)} />
    </div>
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
