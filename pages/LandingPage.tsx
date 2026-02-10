import React from 'react';
import { useScrollReveal } from '../services/scrollReveal';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { DemoSlider } from '../components/landing/DemoSlider';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { FAQ } from '../components/landing/FAQ';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';
import { CreditPackage, LandingSettings } from '../types';

interface LandingPageProps {
    onAuth: (mode: 'login' | 'register') => void;
    creditPackages: CreditPackage[];
    onBuyCredits: (pkg: CreditPackage) => void;
    landingSettings: LandingSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuth, creditPackages, onBuyCredits, landingSettings }) => {
    useScrollReveal([landingSettings]);
    return (
        <div className="min-h-screen bg-[#F2F2F2] text-black overflow-x-hidden">
            <Header onAuth={onAuth} />

            <Hero
                onStartNow={() => onAuth('register')}
                onSeeInAction={() => { document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }) }}
            />
            <DemoSlider showcaseBefore={landingSettings.showcaseBefore} showcaseAfter={landingSettings.showcaseAfter} />
            <HowItWorks heroVideoUrl={landingSettings.heroVideoUrl} heroVideoPoster={landingSettings.heroVideoPoster} />
            <Testimonials />
            <Pricing
                creditPackages={creditPackages}
                onBuyCredits={onBuyCredits}
            />
            <FAQ items={[
                { q: "Como clono meu cartão de crédito?", a: "Nós utilizamos Stripe para processamento seguro. Seus dados nunca tocam nossos servidores." },
                { q: "Os créditos expiram?", a: "Não! Seus créditos são vitalícios e você pode usar quando quiser." },
                { q: "Posso cancelar a compra?", a: "Sim, oferecemos reembolso total em até 7 dias caso não utilize os créditos." },
                // Add more default items or pass via settings if needed, but for now hardcode or use settings if available
            ]} />
            <CTA onStartNow={() => onAuth('register')} />
            <Footer />
        </div>
    );
};
