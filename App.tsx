
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
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { authService } from './services/authService';

// Components
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PricingPage } from './pages/PricingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';


// Types & Services
import { MOCK_MODE } from './services/geminiService';
import { Toaster, toast } from 'react-hot-toast';
import { AppUser, CreditPackage, LandingSettings, PricingPlan, RenderHistoryItem, RenderStyle } from './types';
import { stripeService } from './services/stripeService';

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
  const [appLoading, setAppLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [history, setHistory] = useState<RenderHistoryItem[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Settings
  const [landingSettings, setLandingSettings] = useState<LandingSettings>(DEFAULT_LANDING);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(DEFAULT_PRICING_PLANS);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(DEFAULT_CREDIT_PACKAGES);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();

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
          // Only stop loading once we have the user profile
          setAppLoading(false);
        }, (error) => {
          console.error("Error in Profile Snapshot:", error);
          setAppLoading(false); // Ensure we don't hang on error
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
        });

        // 3. Global Settings & Users (if admin)
        const fetchGlobalSettings = async () => {
          try {
            const settingsDoc = await getDoc(doc(db, "settings", "global"));
            if (settingsDoc.exists()) {
              const data = settingsDoc.data();
              if (data.landing) setLandingSettings({ ...DEFAULT_LANDING, ...data.landing });
              if (data.pricing) setPricingPlans(data.pricing);
              if (data.credits) setCreditPackages(data.credits);
            }
          } catch (error) {
            console.error("Error fetching global settings:", error);
          }
        };
        fetchGlobalSettings();

        return () => {
          unsubscribeProfile();
          unsubscribeHistory();
        };
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setHistory([]);
        setAppLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Admin Users Listener
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
  }, [currentUser?.role]);


  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate('/');
    toast.success('Sessão encerrada');
  };

  const handleOpenSelectKey = async () => {
    if (typeof window.aistudio !== 'undefined' && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const onRenderComplete = async (url: string, style: RenderStyle, cost: number = 1) => {
    if (!currentUser) return;
    const newCredits = credits - cost;
    setCredits(newCredits);
    try {
      await updateDoc(doc(db, "users", currentUser.id), { credits: newCredits });
      await addDoc(collection(db, "history"), {
        userId: currentUser.id,
        url,
        style,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error saving render data:", error);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "history", id));
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  // Redirect to dashboard if logged in and trying to access landing/login
  useEffect(() => {
    if (isLoggedIn && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/cadastro')) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      {appLoading ? (
        <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#B6B09F]/30 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <LandingPage
              onAuth={(mode) => navigate(mode === 'login' ? '/login' : '/cadastro')}
              creditPackages={creditPackages}
              onBuyCredits={(pkg) => navigate(`/checkout?pkg=${pkg.id}`)}
              landingSettings={landingSettings}
            />
          } />
          <Route path="/login" element={
            <AuthPage mode="login" onSuccess={() => navigate('/dashboard')} />
          } />
          <Route path="/cadastro" element={
            <AuthPage mode="register" onSuccess={() => navigate('/dashboard')} />
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            isLoggedIn && currentUser ? (
              <DashboardPage
                user={currentUser}
                credits={credits}
                history={history}
                onRenderComplete={onRenderComplete}
                onLogout={handleLogout}
                hasApiKey={hasApiKey}
                handleOpenSelectKey={handleOpenSelectKey}
                setHasApiKey={setHasApiKey}
                onDeleteHistory={deleteFromHistory}
              />
            ) : (
              <Navigate to="/login" />
            )
          } />

          <Route path="/planos" element={
            isLoggedIn ? (
              <PricingPage creditPackages={creditPackages} />
            ) : (
              <Navigate to="/login" />
            )
          } />

          <Route path="/perfil" element={
            isLoggedIn && currentUser ? (
              <ProfilePage user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } />

          <Route path="/admin" element={
            isLoggedIn && currentUser?.role === 'admin' ? (
              <AdminPage
                landingSettings={landingSettings}
                setLandingSettings={setLandingSettings}
                pricingPlans={pricingPlans}
                setPricingPlans={setPricingPlans}
                creditPackages={creditPackages}
                setCreditPackages={setCreditPackages}
                appUsers={appUsers}
                setAppUsers={setAppUsers}
              />
            ) : (
              <Navigate to="/dashboard" />
            )
          } />

          <Route path="/checkout" element={
            isLoggedIn && currentUser ? (
              <CheckoutPage creditPackages={creditPackages} user={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
};

export default App;


