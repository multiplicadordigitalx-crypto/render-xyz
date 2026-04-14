import React from 'react';
import { useScrollReveal } from '../services/scrollReveal';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { InterestSection } from '../components/landing/InterestSection';
import { Features } from '../components/landing/Features';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { FAQ } from '../components/landing/FAQ';
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
        <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden font-sans">
            <Header onAuth={onAuth} />

            {/* Attention */}
            <Hero
                onStartNow={() => onAuth('register')}
                onSeeInAction={() => { document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }) }}
            />

            {/* Interest */}
            <InterestSection
                heroVideoUrl={landingSettings.heroVideoUrl}
                heroVideoPoster={landingSettings.heroVideoPoster}
            />
            <Features />
            <CapabilitiesSection />

            {/* Desire */}
            <ComparisonSection />

            <Testimonials />

            {/* Action */}
            <Pricing
                creditPackages={creditPackages}
                onBuyCredits={onBuyCredits}
            />

            <FAQ />

            <Footer />
        </div>
    );
};
