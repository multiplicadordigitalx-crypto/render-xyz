import React from 'react';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { DemoSlider } from '../components/landing/DemoSlider';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { FAQ } from '../components/landing/FAQ';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';
import { CreditPackage, PricingPlan } from '../types';

interface LandingPageProps {
    onAuth: (mode: 'login' | 'register') => void;
    creditPackages: CreditPackage[];
    onBuyCredits: (pkg: CreditPackage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuth, creditPackages, onBuyCredits }) => {
    return (
        <div className="min-h-screen bg-[#F2F2F2] text-black overflow-x-hidden">
            <Header onAuth={onAuth} />

            <Hero
                onStartNow={() => onAuth('register')}
                onSeeInAction={() => { document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }) }}
            />
            <DemoSlider />
            <HowItWorks />
            <Testimonials />
            <Pricing
                creditPackages={creditPackages}
                onBuyCredits={onBuyCredits} // This opens the modal which is likely global in App
            />
            <FAQ />
            <CTA onStartNow={() => onAuth('register')} />
            <Footer />
        </div>
    );
};
