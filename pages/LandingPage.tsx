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
                { q: "Já tentei V-Ray e Lumion e achei difícil. Por que a Render XYZ é diferente?", a: "Ferramentas tradicionais exigem que você seja um técnico. A Render XYZ usa IA para 'ler' seu projeto como um humano, eliminando sliders e configurações complexas." },
                { q: "E se eu não gostar do resultado?", a: "Sem risco. Se a IA não entregar o prometido, você pode regenerar ou solicitar o estorno dos créditos. Sua satisfação é nossa prioridade." },
                { q: "Preciso de um computador potente?", a: "Não! Todo o processamento pesado acontece em nossos servidores com GPUs H100. Você pode renderizar até do celular." },
                { q: "Quanto tempo leva para gerar um render?", a: "A maioria dos renders é gerada em menos de 60 segundos, permitindo que você itere rapidamente sobre seus designs." },
                { q: "Posso usar as imagens comercialmente?", a: "Sim! Todos os renders gerados com seus créditos pertencem 100% a você para uso comercial irrestrito." },
                { q: "Os créditos expiram?", a: "Não! Seus créditos são vitalícios e você pode usar quando quiser." },
            ]} />
            <CTA onStartNow={() => onAuth('register')} />
            <Footer />
        </div>
    );
};
