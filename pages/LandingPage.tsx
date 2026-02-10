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
                { q: "Quanto tempo leva para gerar um render?", a: "A maioria dos renders é gerada em menos de 60 segundos, permitindo que você itere rapidamente sobre seus designs." },
                { q: "Quais formatos de arquivo são suportados?", a: "Você pode fazer upload de arquivos .SKP, .OBJ, .FBX e imagens de referência. Entregamos os resultados em alta resolução JPG ou PNG." },
                { q: "Posso usar as imagens comercialmente?", a: "Sim! Todos os renders gerados no plano Pago (Estúdio ou Elite) pertencem 100% a você para uso comercial irrestrito." },
                { q: "Preciso de um computador potente?", a: "Não. Todo o processamento é feito em nossa nuvem. Você pode renderizar projetos complexos até mesmo do seu celular ou tablet." },
                { q: "Os créditos expiram?", a: "Não! Seus créditos são vitalícios e você pode usar quando quiser." },
                { q: "Posso cancelar a compra?", a: "Sim, oferecemos reembolso total em até 7 dias caso não utilize os créditos." },
            ]} />
            <CTA onStartNow={() => onAuth('register')} />
            <Footer />
        </div>
    );
};
