import { auth } from '@/firebaseConfig';
import { apiService } from '@/services/api';
import { signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    onboardingCompleted: boolean;
    streakCount: number;
    userName: string;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    onboardingCompleted: false,
    streakCount: 0,
    userName: '',
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [streakCount, setStreakCount] = useState(0);
    const [userName, setUserName] = useState('');

    const refreshProfile = async () => {
        try {
            const profile = await apiService.getUserProfile();
            if (profile) {
                setOnboardingCompleted(!!profile.onboardingCompleted);
                setStreakCount(profile.streakCount || 0);
                if (profile.displayName) {
                    setUserName(profile.displayName);

                    // Proactive Name Sync:
                    // If backend name is a fallback (email-like) but Firebase has a real name, sync it.
                    if (user?.displayName &&
                        (profile.displayName.includes('@') || profile.displayName === user.email?.split('@')[0]) &&
                        profile.displayName !== user.displayName) {
                        console.log('Syncing Firebase displayName to backend profile...');
                        apiService.updateUserProfile({ displayName: user.displayName }).catch(console.error);
                        setUserName(user.displayName);
                    }
                } else if (user?.displayName) {
                    // Fallback to Firebase displayName if backend has none
                    setUserName(user.displayName);
                    apiService.updateUserProfile({ displayName: user.displayName }).catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    useEffect(() => {
        // Fail-safe: If authentication doesn't resolve within 10 seconds, force loading to false.
        // This prevents the app from hanging forever on the loading screen if Firebase config is missing.
        const timer = setTimeout(() => {
            if (loading) {
                console.warn('Auth initialization timed out. Forcing loading state to false.');
                setLoading(false);
            }
        }, 10000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(timer);
            setUser(user);
            if (user) {
                setLoading(true);
                await refreshProfile();
            } else {
                setOnboardingCompleted(false);
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, onboardingCompleted, streakCount, userName, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
