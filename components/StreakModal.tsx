import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

const { width } = Dimensions.get('window');

interface StreakModalProps {
    visible: boolean;
    streakCount: number;
    onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ visible, streakCount, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.fireContainer}>
                        <IconSymbol name="flame.fill" size={80} color="#ff4500" />
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{streakCount}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{streakCount} Day Streak!</Text>
                    <Text style={styles.message}>
                        You're doing great! Keep up the daily checks to manage your asthma effectively.
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Awesome!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    fireContainer: {
        marginBottom: 20,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadge: {
        position: 'absolute',
        bottom: 5,
        backgroundColor: 'white',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    countText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff4500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#087179',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
