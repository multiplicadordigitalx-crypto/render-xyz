
import React from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  resolutionLabel?: string;
  externalId?: string;
}

export type RenderStyle = 'Dia' | 'Noite' | 'Fim de Tarde' | 'Nublado';
export type RenderResolution = '1K' | '2K' | '4K';

export interface RenderHistoryItem {
  id: string;
  url: string;
  style: RenderStyle;
  timestamp: number;
}

export interface CreditPackage {
  id: string;
  amount: number;
  price: string;
  description: string;
  externalId?: string;
}

export type UserPlan = 'free' | 'studio' | 'elite';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  cpf: string; // Armazenado de forma segura no backend
  credits: number;
  joinedAt: number;
  plan: UserPlan;
  role?: 'admin' | 'user';
}

export interface LandingSettings {
  showcaseBefore: string;
  showcaseAfter: string;
  heroVideoUrl: string;
  heroVideoPoster: string;
}

export type AuthViewMode = 'login' | 'register' | 'forgot-password' | 'verify-email';
