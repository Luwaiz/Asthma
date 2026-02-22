import { IconSymbol } from '@/components/ui/icon-symbol'
import { auth } from '@/firebaseConfig'
import { router } from 'expo-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import React, { useState } from 'react'
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
} from 'react-native'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address')
            return
        }

        setIsLoading(true)
        try {
            await sendPasswordResetEmail(auth, email)
            setIsSubmitted(true)
        } catch (error: any) {
            console.error('Reset password error:', error)
            let errorMessage = 'An error occurred. Please try again.'

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.'
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.'
            }

            Alert.alert('Error', errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <IconSymbol name="chevron.left" size={24} color="#1f2937" />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <IconSymbol name="lock.shield.fill" size={40} color="#087179" />
                        </View>
                    </View>
                    <Text style={styles.titleText}>Reset Password</Text>
                    <Text style={styles.subtitleText}>
                        {isSubmitted
                            ? "We've sent a password reset link to your email address."
                            : "Enter your email address and we'll send you a link to reset your password."}
                    </Text>
                </View>

                {!isSubmitted ? (
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <IconSymbol name="envelope.fill" size={20} color="#9ca3af" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                        </View>

                        <Pressable
                            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                                    <IconSymbol name="paperplane.fill" size={20} color="white" />
                                </>
                            )}
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.successSection}>
                        <Pressable
                            style={styles.loginButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.loginButtonText}>Back to Login</Text>
                        </Pressable>
                    </View>
                )}

                <View style={styles.footer}>
                    {!isSubmitted && (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.backToLoginText}>Back to Login</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: StatusBar.currentHeight || 60,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
    },
    logoContainer: {
        marginBottom: 24,
        marginTop: 20,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#338b912c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
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
    resetButton: {
        backgroundColor: '#087179',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#087179',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    resetButtonDisabled: {
        opacity: 0.7,
    },
    resetButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white',
    },
    successSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#087179',
        borderRadius: 16,
        height: 56,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: 'white',
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingTop: 40,
    },
    backToLoginText: {
        fontSize: 15,
        color: '#087179',
        fontWeight: '700',
    },
})
