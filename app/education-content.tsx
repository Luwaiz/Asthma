import { IconSymbol } from "@/components/ui/icon-symbol";
import { router, Stack } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";

const { width } = Dimensions.get("window");

function TakeawayCard() {
    return (
        <View style={styles.takeawayCard}>
            <View style={styles.takeawayHeader}>
                <IconSymbol name="sparkles" size={20} color="#087179" />
                <Text style={styles.takeawayHeaderText}>Key Takeaways</Text>
            </View>
            <View style={styles.takeawayItem}>
                <View style={styles.bullet} />
                <Text style={styles.takeawayText}>Identify your triggers (pollen, dust, etc.)</Text>
            </View>
            <View style={styles.takeawayItem}>
                <View style={styles.bullet} />
                <Text style={styles.takeawayText}>Always keep your rescue inhaler handy</Text>
            </View>
            <View style={styles.takeawayItem}>
                <View style={styles.bullet} />
                <Text style={styles.takeawayText}>Check air quality levels daily</Text>
            </View>
        </View>
    );
}

const EducationContent = () => {
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require("../assets/images/asthma.png")}
                        style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay} />

                    <View style={styles.backButtonContainer}>
                        <Pressable style={styles.circleButton} onPress={() => router.back()}>
                            <IconSymbol name="chevron.left" size={24} color="white" />
                        </Pressable>
                        <Pressable style={styles.circleButton}>
                            <IconSymbol name="bookmark" size={20} color="white" />
                        </Pressable>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>PREVENTION</Text>
                        </View>
                        <Text style={styles.heroTitle}>Understanding Asthma & Managing Triggers</Text>
                        <View style={styles.metaInfo}>
                            <View style={styles.metaItem}>
                                <IconSymbol name="clock" size={14} color="#e0e0e0" />
                                <Text style={styles.metaText}>8 min read</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <IconSymbol name="chart.bar.fill" size={14} color="#e0e0e0" />
                                <Text style={styles.metaText}>Intermediate</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentBody}>
                    <Text style={styles.paragraph}>
                        Asthma is a condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, a whistling sound (wheezing) when you breathe out and shortness of breath.
                    </Text>

                    <Text style={styles.sectionHeading}>Common Asthma Triggers</Text>
                    <Text style={styles.paragraph}>
                        Exposure to various irritants and substances that trigger allergies (allergens) can set off signs and symptoms of asthma. Asthma triggers are different from person to person and can include:
                    </Text>

                    <View style={styles.listItem}>
                        <Text style={styles.listText}>• Airborne substances, such as pollen, dust mites, mold spores, pet dander or particles of cockroach waste</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.listText}>• Respiratory infections, such as the common cold</Text>
                    </View>
                    <View style={styles.listItem}>
                        <Text style={styles.listText}>• Physical activity (exercise-induced asthma)</Text>
                    </View>

                    <TakeawayCard />

                    <Text style={styles.sectionHeading}>Management Strategies</Text>
                    <Text style={styles.paragraph}>
                        The best way to prevent asthma attacks is to follow your asthma action plan. Work with your doctor to write a step-by-step plan for taking medications and managing an asthma attack. Then be sure to follow your plan.
                    </Text>

                    {/* Related Topics */}
                    <View style={styles.relatedSection}>
                        <Text style={styles.relatedHeading}>Related Topics</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                            <View style={styles.relatedCard}>
                                <Image source={require("../assets/images/asthma.png")} style={styles.relatedImage} />
                                <Text style={styles.relatedTitle} numberOfLines={2}>Breathing Exercises</Text>
                            </View>
                            <View style={styles.relatedCard}>
                                <Image source={require("../assets/images/asthma.png")} style={styles.relatedImage} />
                                <Text style={styles.relatedTitle} numberOfLines={2}>Medication Guide</Text>
                            </View>
                            <View style={styles.relatedCard}>
                                <Image source={require("../assets/images/asthma.png")} style={styles.relatedImage} />
                                <Text style={styles.relatedTitle} numberOfLines={2}>Peak Flow Meters</Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default EducationContent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    heroContainer: {
        height: 380,
        width: "100%",
    },
    heroImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    backButtonContainer: {
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        zIndex: 10,
    },
    circleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(10px)",
    },
    heroContent: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
    },
    categoryBadge: {
        backgroundColor: "#087179",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    categoryText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        lineHeight: 34,
    },
    metaInfo: {
        flexDirection: "row",
        marginTop: 15,
        gap: 20,
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        color: "#e0e0e0",
        fontSize: 13,
    },
    contentBody: {
        padding: 20,
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        color: "#4b5563",
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 12,
        marginTop: 10,
    },
    listItem: {
        marginBottom: 10,
        paddingLeft: 10,
    },
    listText: {
        fontSize: 15,
        color: "#4b5563",
        lineHeight: 22,
    },
    takeawayCard: {
        backgroundColor: "#f0f9f9",
        borderRadius: 20,
        padding: 20,
        marginVertical: 25,
        borderWidth: 1,
        borderColor: "#d1eaea",
    },
    takeawayHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 15,
    },
    takeawayHeaderText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#087179",
    },
    takeawayItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#087179",
    },
    takeawayText: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "500",
    },
    relatedSection: {
        marginTop: 30,
    },
    relatedHeading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 15,
    },
    relatedScroll: {
        gap: 16,
    },
    relatedCard: {
        width: 140,
    },
    relatedImage: {
        width: 140,
        height: 100,
        borderRadius: 16,
        marginBottom: 8,
    },
    relatedTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
});
