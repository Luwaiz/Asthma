import { IconSymbol } from '@/components/ui/icon-symbol'
import { useAuth } from '@/context/AuthContext'
import { auth } from '@/firebaseConfig'
import { apiService } from '@/services/api'
import { router } from 'expo-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
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

const Register = () => {
  const { user, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  const handleRegister = async () => {
    if (!email || !password || !fullName || !confirmPassword) {
      alert('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      alert('PINs do not match')
      return
    }

    if (password.length !== 6) {
      alert('PIN must be exactly 6 digits')
      return
    }
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update Firebase Auth profile with full name
      await updateProfile(user, {
        displayName: fullName
      })

      // Explicitly sync the name to the backend immediately
      // This prevents the email-prefix fallback in the backend profile
      await apiService.updateUserProfile({ displayName: fullName })

      // Note: backend profile is already created or updated by the call above.
      // onboardingCompleted starts as false.

      console.log('Registered user:', user.uid)
      router.replace('/intro-survey')
    } catch (error: any) {
      console.error('Registration error:', error)
      let errorMessage = 'An error occurred during registration'

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'PIN is too weak'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format'
      } else if (error.code) {
        errorMessage = `Registration failed: ${error.code}\n${error.message}`
      } else {
        errorMessage = `Registration failed: ${error.toString()}`
      }

      alert(errorMessage)
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
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('@/assets/images/logo.jpeg')}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitleText}>Join us to start managing your asthma better</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="person.fill" size={20} color="#9ca3af" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>


          {/* Email Input */}
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

          {/* PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>6-Digit PIN</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="number" size={20} color="#9ca3af" />
              <TextInput
                style={styles.textInput}
                placeholder="Create a 6-digit PIN"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(val) => setPassword(val.replace(/[^0-9]/g, ''))}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol
                  name={showPassword ? "eye.slash.fill" : "eye.fill"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm PIN</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="number" size={20} color="#9ca3af" />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your 6-digit PIN"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={(val) => setConfirmPassword(val.replace(/[^0-9]/g, ''))}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <IconSymbol
                  name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>


          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
              {agreeToTerms && <IconSymbol name="checkmark" size={14} color="white" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <Pressable
            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.signUpButtonText}>Create Account</Text>
                <IconSymbol name="arrow.right" size={20} color="white" />
              </>
            )}
          </Pressable>


          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Register

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
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#338b912c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
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
  passwordStrengthContainer: {
    marginBottom: 20,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: '#087179',
  },
  strengthText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#087179',
    borderColor: '#087179',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#087179',
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#087179',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#087179',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  signUpButtonDisabled: {
    backgroundColor: '#065a61',
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,

  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#087179',
    fontWeight: '700',
  },
})