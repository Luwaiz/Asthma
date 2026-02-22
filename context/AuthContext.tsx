import { auth } from '@/firebaseConfig';
import { apiService } from '@/services/api';
import { signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    onboardingCompleted: boolean;
    streakCount: number;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    onboardingCompleted: false,
    streakCount: 0,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [streakCount, setStreakCount] = useState(0);

    const refreshProfile = async () => {
        try {
            const profile = await apiService.getUserProfile();
            if (profile) {
                setOnboardingCompleted(!!profile.onboardingCompleted);
                setStreakCount(profile.streakCount || 0);
            }
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                setLoading(true);
                await refreshProfile();
            } else {
                setOnboardingCompleted(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, onboardingCompleted, streakCount, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
