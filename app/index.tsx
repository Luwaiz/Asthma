import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const { user, loading, onboardingCompleted } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' }}>
                <ActivityIndicator size="large" color="#087179" />
            </View>
        );
    }

    if (user) {
        if (!onboardingCompleted) {
            return <Redirect href="/intro-survey" />;
        }
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/login" />;
}
