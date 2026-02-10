import React, { useEffect } from 'react';
import { AuthView } from '../components/AuthView';
import { AuthViewMode, AppUser } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthPageProps {
    mode: AuthViewMode;
    onSuccess: (user: AppUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSuccess }) => {
    const navigate = useNavigate();

    return (
        <AuthView
            initialMode={mode}
            onSuccess={(user) => {
                onSuccess(user);
                navigate('/dashboard');
            }}
            onBack={() => navigate('/')}
            // These props can be enhanced if we want to support URL params for prefilling
            prefilledEmail={undefined}
            lockedEmail={false}
            pendingPlanName={undefined}
        />
    );
};
