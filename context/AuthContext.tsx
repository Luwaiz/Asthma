import { auth } from '@/firebaseConfig';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    onboardingCompleted: boolean;
    streakCount: number;
    userName: string;
    isAppLocked: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    unlockWithPin: (pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    onboardingCompleted: false,
    streakCount: 0,
    userName: '',
    isAppLocked: false,
    signOut: async () => { },
    refreshProfile: async () => { },
    unlockWithPin: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [streakCount, setStreakCount] = useState(0);
    const [userName, setUserName] = useState('');
    const [isAppLocked, setIsAppLocked] = useState(false);

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

    const checkDailyLock = async () => {
        try {
            const lastLoginDay = await AsyncStorage.getItem('LAST_LOGIN_DAY');
            const today = new Date().toISOString().split('T')[0];

            if (lastLoginDay !== today) {
                setIsAppLocked(true);
            } else {
                setIsAppLocked(false);
            }
        } catch (error) {
            console.error('Error checking daily lock:', error);
        }
    };

    const unlockWithPin = async (inputPin: string): Promise<boolean> => {
        try {
            const profile = await apiService.getUserProfile();
            if (profile && profile.pin === inputPin) {
                const today = new Date().toISOString().split('T')[0];
                await AsyncStorage.setItem('LAST_LOGIN_DAY', today);
                setIsAppLocked(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error unlocking with PIN:', error);
            return false;
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
                await checkDailyLock();
            } else {
                setOnboardingCompleted(false);
                setIsAppLocked(false);
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
        <AuthContext.Provider value={{
            user,
            loading,
            onboardingCompleted,
            streakCount,
            userName,
            isAppLocked,
            signOut,
            refreshProfile,
            unlockWithPin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
