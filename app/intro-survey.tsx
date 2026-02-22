
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const TRIGGERS = [
    "Dust", "Pollen", "Pets", "Smoke", "Cold Air", "Exercise", "Stress", "Perfume", "Mold"
];

const SEVERITY_LEVELS = [
    { label: 'Mild', description: 'Symptoms < 2 days/week' },
    { label: 'Moderate', description: 'Daily symptoms' },
    { label: 'Severe', description: 'Symptoms throughout the day' },
];

const MEDICAL_CONDITIONS = [
    "Asthma", "Diabetes", "Hypertension", "Allergies", "COPD", "Heart Disease", "Sleep Apnea"
];

const SYMPTOM_TYPES = [
    "Shortness of Breath", "Wheezing", "Coughing", "Chest Tightness", "Nighttime Symptoms", "Fatigue"
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function IntroSurveyScreen() {
    const [triggers, setTriggers] = useState<string[]>([]);
    const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
    const [yearOfBirth, setYearOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [yearsWithAsthma, setYearsWithAsthma] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [asthmaLevel, setAsthmaLevel] = useState('Mild');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Medications State
    const [medications, setMedications] = useState<{ id: string, name: string, dosage: string, frequency: string }[]>([]);

    // Dynamic Symptoms State
    const [symptoms, setSymptoms] = useState<{ id: string, type: string, severity: number, duration: string }[]>([]);

    const { refreshProfile } = useAuth();

    const toggleTrigger = (trigger: string) => {
        if (triggers.includes(trigger)) {
            setTriggers(triggers.filter(t => t !== trigger));
        } else {
            setTriggers([...triggers, trigger]);
        }
    };

    const toggleMedicalCondition = (condition: string) => {
        if (medicalConditions.includes(condition)) {
            setMedicalConditions(medicalConditions.filter(c => c !== condition));
        } else {
            setMedicalConditions([...medicalConditions, condition]);
        }
    };

    const addMedication = () => {
        setMedications([...medications, { id: Date.now().toString(), name: '', dosage: '', frequency: '' }]);
    };

    const updateMedication = (index: number, field: string, value: string) => {
        const updated = [...medications];
        updated[index] = { ...updated[index], [field]: value };
        setMedications(updated);
    };

    const removeMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const addSymptom = () => {
        setSymptoms([...symptoms, { id: Date.now().toString(), type: SYMPTOM_TYPES[0], severity: 1, duration: '' }]);
    };

    const updateSymptom = (index: number, field: string, value: any) => {
        const updated = [...symptoms];
        updated[index] = { ...updated[index], [field]: value };
        setSymptoms(updated);
    };

    const removeSymptom = (index: number) => {
        setSymptoms(symptoms.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!yearsWithAsthma || !emergencyName || !emergencyPhone) {
            Alert.alert('Missing Information', 'Please fill in all basic fields to continue.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Update Profile (including Medical Conditions, Age, Gender)
            await apiService.updateUserProfile({
                triggers,
                medicalConditions,
                yearsWithAsthma,
                yearOfBirth: yearOfBirth ? parseInt(yearOfBirth) : undefined,
                gender: gender || undefined,
                emergencyContact: {
                    name: emergencyName,
                    phone: emergencyPhone
                },
                asthmaLevel,
                onboardingCompleted: true
            });

            // 2. Add Medications
            for (const med of medications) {
                if (med.name) {
                    await apiService.addMedication({
                        name: med.name,
                        dosage: med.dosage,
                        frequency: med.frequency,
                        description: `Added during onboarding`
                    });
                }
            }

            // 3. Save Symptoms as first Daily Log
            if (symptoms.length > 0) {
                const formattedSymptoms = symptoms.map(s => ({
                    name: s.type,
                    severity: s.severity,
                    description: `Duration: ${s.duration}`
                }));

                await apiService.saveLog({
                    date: new Date().toISOString(),
                    symptoms: formattedSymptoms,
                    notes: "Initial symptoms recorded during onboarding"
                });
            }

            // Refresh profile state in AuthContext
            await refreshProfile();

            // Navigate to home after successful update
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Survey submission failed:', error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/login');
                        }
                    }}
                >
                    <IconSymbol name="chevron.left" size={24} color="#374151" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <IconSymbol name="list.clipboard.fill" size={32} color="#087179" />
                    </View>
                    <Text style={styles.title}>Let's get to know you more</Text>
                    <Text style={styles.subtitle}>Help us personalize your asthma management journey</Text>
                </View>

                {/* Section 0: Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Year of Birth</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 1990"
                            placeholderTextColor="#9ca3af"
                            value={yearOfBirth}
                            onChangeText={setYearOfBirth}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.chipContainer}>
                            {GENDER_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setGender(option)}
                                    style={[
                                        styles.chip,
                                        gender === option && styles.chipSelected
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        gender === option && styles.chipTextSelected
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Section 1: Years with Asthma */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How long have you had asthma?</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 5 years, since childhood"
                            placeholderTextColor="#9ca3af"
                            value={yearsWithAsthma}
                            onChangeText={setYearsWithAsthma}
                        />
                    </View>
                </View>

                {/* New Section: Medical Conditions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Existing Medical Conditions</Text>
                    <Text style={styles.sectionSubtitle}>(Needed for health risk personalization)</Text>
                    <View style={styles.chipContainer}>
                        {MEDICAL_CONDITIONS.map((condition) => (
                            <TouchableOpacity
                                key={condition}
                                onPress={() => toggleMedicalCondition(condition)}
                                style={[
                                    styles.chip,
                                    medicalConditions.includes(condition) && styles.chipSelected
                                ]}
                            >
                                <Text style={[
                                    styles.chipText,
                                    medicalConditions.includes(condition) && styles.chipTextSelected
                                ]}>
                                    {condition}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* New Section: Current Medications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Current Medications</Text>
                        <TouchableOpacity onPress={addMedication} style={styles.addButton}>
                            <IconSymbol name="plus.circle.fill" size={24} color="#087179" />
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {medications.map((med, index) => (
                        <View key={med.id || index} style={styles.dynamicCard}>
                            <TextInput
                                style={styles.dynamicInput}
                                placeholder="Medication Name"
                                value={med.name}
                                onChangeText={(val) => updateMedication(index, 'name', val)}
                            />
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.dynamicInput, { flex: 1 }]}
                                    placeholder="Dosage"
                                    value={med.dosage}
                                    onChangeText={(val) => updateMedication(index, 'dosage', val)}
                                />
                                <TextInput
                                    style={[styles.dynamicInput, { flex: 1 }]}
                                    placeholder="Frequency"
                                    value={med.frequency}
                                    onChangeText={(val) => updateMedication(index, 'frequency', val)}
                                />
                            </View>
                            <TouchableOpacity onPress={() => removeMedication(index)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {medications.length === 0 && (
                        <Text style={styles.emptyText}>No medications added. Tap 'Add' to record any you're taking.</Text>
                    )}
                </View>

                {/* New Section: Current Symptoms */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Current Symptoms</Text>
                        <TouchableOpacity onPress={addSymptom} style={styles.addButton}>
                            <IconSymbol name="plus.circle.fill" size={24} color="#087179" />
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {symptoms.map((symp, index) => (
                        <View key={symp.id || index} style={styles.dynamicCard}>
                            <View style={styles.pickerWrapper}>
                                <Text style={styles.pickerLabel}>Type:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeSelector}>
                                    {SYMPTOM_TYPES.map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => updateSymptom(index, 'type', type)}
                                            style={[styles.typeChip, symp.type === type && styles.typeChipSelected]}
                                        >
                                            <Text style={[styles.typeChipText, symp.type === type && styles.typeChipTextSelected]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <View style={styles.severityRow}>
                                <Text style={styles.pickerLabel}>Severity: {symp.severity === 0 ? 'Mild' : symp.severity === 1 ? 'Moderate' : symp.severity === 2 ? 'Severe' : ''}</Text>
                                <View style={styles.severityButtons}>
                                    {['Mild', 'Moderate', 'Severe'].map((label, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => updateSymptom(index, 'severity', idx)}
                                            style={[
                                                styles.severityNum,
                                                symp.severity === idx && styles.severityNumSelected,
                                                idx === 0 && { borderColor: '#10b981' },
                                                idx === 1 && { borderColor: '#f59e0b' },
                                                idx === 2 && { borderColor: '#ef4444' },
                                                symp.severity === idx && idx === 0 && { backgroundColor: '#10b981' },
                                                symp.severity === idx && idx === 1 && { backgroundColor: '#f59e0b' },
                                                symp.severity === idx && idx === 2 && { backgroundColor: '#ef4444' },
                                            ]}
                                        >
                                            <Text style={[
                                                styles.severityNumText,
                                                symp.severity === idx && styles.severityNumTextSelected
                                            ]}>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <TextInput
                                style={styles.dynamicInput}
                                placeholder="Duration (e.g. 3 days, 1 week)"
                                value={symp.duration}
                                onChangeText={(val) => updateSymptom(index, 'duration', val)}
                            />
                            <TouchableOpacity onPress={() => removeSymptom(index)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {symptoms.length === 0 && (
                        <Text style={styles.emptyText}>No current symptoms recorded. Tap 'Add' to record how you're feeling.</Text>
                    )}
                </View>

                {/* Section 2: Triggers */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What triggers your asthma?</Text>
                    <View style={styles.chipContainer}>
                        {TRIGGERS.map((trigger) => (
                            <TouchableOpacity
                                key={trigger}
                                onPress={() => toggleTrigger(trigger)}
                                style={[
                                    styles.chip,
                                    triggers.includes(trigger) && styles.chipSelected
                                ]}
                            >
                                <Text style={[
                                    styles.chipText,
                                    triggers.includes(trigger) && styles.chipTextSelected
                                ]}>
                                    {trigger}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section 3: Severity Level */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Asthma Severity</Text>
                    <View style={styles.severityContainer}>
                        {SEVERITY_LEVELS.map((level) => (
                            <TouchableOpacity
                                key={level.label}
                                onPress={() => setAsthmaLevel(level.label)}
                                style={[
                                    styles.severityCard,
                                    asthmaLevel === level.label && styles.severityCardSelected
                                ]}
                            >
                                <Text style={[
                                    styles.severityLabel,
                                    asthmaLevel === level.label && styles.severityLabelSelected
                                ]}>
                                    {level.label}
                                </Text>
                                <Text style={[
                                    styles.severityDesc,
                                    asthmaLevel === level.label && styles.severityDescSelected
                                ]}>
                                    {level.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section 4: Emergency Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Emergency Contact</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Contact Name</Text>
                        <View style={styles.inputWrapper}>
                            <IconSymbol name="person.fill" size={20} color="#9ca3af" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Name"
                                placeholderTextColor="#9ca3af"
                                value={emergencyName}
                                onChangeText={setEmergencyName}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <IconSymbol name="phone.fill" size={20} color="#9ca3af" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Phone Number"
                                placeholderTextColor="#9ca3af"
                                keyboardType="phone-pad"
                                value={emergencyPhone}
                                onChangeText={setEmergencyPhone}
                            />
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>Complete Setup</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: StatusBar.currentHeight || 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#338b912c',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 15,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    addButtonText: {
        color: '#087179',
        fontWeight: '600',
        fontSize: 14,
    },
    dynamicCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dynamicInput: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 8,
        fontSize: 15,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    removeButton: {
        alignSelf: 'flex-end',
        paddingVertical: 5,
    },
    removeButtonText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 5,
    },
    pickerWrapper: {
        marginBottom: 12,
    },
    pickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 8,
    },
    typeSelector: {
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    typeChipSelected: {
        backgroundColor: '#087179',
        borderColor: '#087179',
    },
    typeChipText: {
        fontSize: 13,
        color: '#6b7280',
    },
    typeChipTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
    severityRow: {
        marginBottom: 12,
    },
    severityButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    severityNum: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    severityNumSelected: {
        backgroundColor: '#087179',
        borderColor: '#087179',
    },
    severityNumText: {
        fontSize: 14,
        color: '#6b7280',
    },
    severityNumTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    chipSelected: {
        backgroundColor: '#087179',
        borderColor: '#087179',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    chipTextSelected: {
        color: 'white',
    },
    severityContainer: {
        gap: 10,
    },
    severityCard: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    severityCardSelected: {
        borderColor: '#087179',
        backgroundColor: '#f0fdf9',
    },
    severityLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
    },
    severityLabelSelected: {
        color: '#087179',
    },
    severityDesc: {
        fontSize: 14,
        color: '#9ca3af',
    },
    severityDescSelected: {
        color: '#0e7490',
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    footer: {
        padding: 24,
        backgroundColor: '#fafafa',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    submitButton: {
        backgroundColor: '#087179',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#087179',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    submitButtonDisabled: {
        backgroundColor: '#065a61',
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
});
