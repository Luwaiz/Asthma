import { IconSymbol } from '@/components/ui/icon-symbol';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Card = ({
    title,
    subtitle,
    backgroundColor,
    children,
    actionText,
    onPress,
    videoUrl,
}: any) => {
    const handlePress = async () => {
        if (videoUrl) {
            await WebBrowser.openBrowserAsync(videoUrl);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <View style={[styles.card, { backgroundColor }]}>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            <View style={{ marginVertical: 12 }}>{children}</View>
            {actionText && (
                <TouchableOpacity style={styles.button} onPress={handlePress}>
                    <Text style={styles.buttonText}>{actionText}</Text>
                    <IconSymbol name="chevron.right" size={16} color="#087179" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default function Learn() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Education</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* HOW DO INHALERS WORK */}
                <Card
                    title="How Do Inhalers Work?"
                    subtitle="Short Answer"
                    backgroundColor="#E6F4F5"
                    actionText="Learn More"
                    videoUrl="https://youtu.be/8hgEorF0vyY?si=JF1E6kRlUrIkC_e1"
                >
                    <Text style={styles.text}>
                        Inhalers deliver medicine directly to your lungs to help open your
                        airways and make breathing easier.
                    </Text>
                </Card>

                {/* ASTHMA ACTION PLAN */}
                <Card
                    title="What is an Asthma Action Plan?"
                    subtitle="My Asthma Action Plan"
                    backgroundColor="#FFF4E6"
                    actionText="Learn More"
                    videoUrl="https://youtu.be/mgW8d-xPSZU?si=KQYLuvp5BT9wr6Sc"
                >
                    <View style={styles.zoneContainer}>
                        <View style={styles.zoneRow}>
                            <View style={[styles.zoneDot, { backgroundColor: '#10b981' }]} />
                            <Text style={styles.zoneText}>Green Zone — Breathing feels good</Text>
                        </View>
                        <View style={styles.zoneRow}>
                            <View style={[styles.zoneDot, { backgroundColor: '#f59e0b' }]} />
                            <Text style={styles.zoneText}>Yellow Zone — Keep taking daily meds</Text>
                        </View>
                        <View style={styles.zoneRow}>
                            <View style={[styles.zoneDot, { backgroundColor: '#ef4444' }]} />
                            <Text style={styles.zoneText}>Red Zone — Get medical help</Text>
                        </View>
                    </View>
                </Card>

                {/* SEASONAL TRIGGERS */}
                <Card
                    title="Seasonal Asthma Triggers"
                    subtitle="Did you know?"
                    backgroundColor="#F0F9F4"
                    actionText="Learn More"
                    videoUrl="https://youtu.be/5LwnfpIxQCM?si=SMfwrW2_fqG3NfNc"
                >
                    <Text style={styles.text}>
                        Asthma can be worse in certain seasons. Watch out for:
                    </Text>

                    <View style={styles.seasonRow}>
                        <View style={styles.seasonItem}>
                            <Text style={styles.seasonEmoji}>🌸</Text>
                            <Text style={styles.seasonLabel}>Spring</Text>
                        </View>
                        <View style={styles.seasonItem}>
                            <Text style={styles.seasonEmoji}>☀️</Text>
                            <Text style={styles.seasonLabel}>Summer</Text>
                        </View>
                        <View style={styles.seasonItem}>
                            <Text style={styles.seasonEmoji}>🍂</Text>
                            <Text style={styles.seasonLabel}>Fall</Text>
                        </View>
                    </View>
                </Card>

                {/* FOOD TRIGGERS */}
                <Card
                    title="Can Foods Trigger Asthma?"
                    backgroundColor="#FFF0F0"
                    actionText="Learn More"
                    videoUrl="https://youtu.be/UAUcNMB-zt4?si=jyjftuCtObrmZtCe"
                >
                    <Text style={styles.text}>
                        Some foods can cause or worsen asthma in some people:
                    </Text>
                    <View style={styles.listContainer}>
                        <View style={styles.listItem}>
                            <IconSymbol name="circle.fill" size={8} color="#087179" />
                            <Text style={styles.listItemText}>Dairy products</Text>
                        </View>
                        <View style={styles.listItem}>
                            <IconSymbol name="circle.fill" size={8} color="#087179" />
                            <Text style={styles.listItemText}>Processed foods</Text>
                        </View>
                        <View style={styles.listItem}>
                            <IconSymbol name="circle.fill" size={8} color="#087179" />
                            <Text style={styles.listItemText}>Shellfish</Text>
                        </View>
                    </View>
                </Card>

                {/* BREATHING EXERCISES */}
                <Card
                    title="Breathing Exercises"
                    subtitle="Practice Daily"
                    backgroundColor="#F4F9F9"
                    actionText="Learn More"
                    videoUrl="https://youtu.be/FyjZLPmZ534?si=OPGXMPjxMl2tz8Ky"
                >
                    <Text style={styles.text}>
                        Regular breathing exercises can help strengthen your lungs and reduce asthma symptoms.
                    </Text>
                    <View style={styles.exerciseContainer}>
                        <View style={styles.exerciseStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <Text style={styles.exerciseText}>Breathe in slowly through your nose</Text>
                        </View>
                        <View style={styles.exerciseStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <Text style={styles.exerciseText}>Hold for 3-4 seconds</Text>
                        </View>
                        <View style={styles.exerciseStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <Text style={styles.exerciseText}>Breathe out slowly through your mouth</Text>
                        </View>
                    </View>
                </Card>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        paddingTop: StatusBar.currentHeight || 70,
    },

    header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },

    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
        color: '#1f2937',
    },

    cardSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#087179',
        marginBottom: 8,
    },

    text: {
        fontSize: 15,
        lineHeight: 22,
        color: '#4b5563',
        fontWeight: '500',
    },

    button: {
        marginTop: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#338b912c',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },

    buttonText: {
        fontWeight: '700',
        color: '#087179',
        fontSize: 14,
    },

    zoneContainer: {
        gap: 10,
        marginTop: 4,
    },

    zoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    zoneDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },

    zoneText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },

    seasonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
    },

    seasonItem: {
        alignItems: 'center',
        gap: 8,
    },

    seasonEmoji: {
        fontSize: 32,
    },

    seasonLabel: {
        fontWeight: '600',
        fontSize: 14,
        color: '#4b5563',
    },

    listContainer: {
        marginTop: 12,
        gap: 10,
    },

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    listItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },

    exerciseContainer: {
        marginTop: 12,
        gap: 12,
    },

    exerciseStep: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#087179',
        justifyContent: 'center',
        alignItems: 'center',
    },

    stepNumberText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },

    exerciseText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
});