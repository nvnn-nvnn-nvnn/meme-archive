import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// username Check

function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (typeof username !== 'string') {
    return { isValid: false, error: 'Invalid input' };
  }

  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or fewer' };
  }

  // Starts with letter, then letters/numbers/_/-
  const pattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

  if (!pattern.test(trimmed)) {
    if (trimmed.includes(' ')) {
      return { isValid: false, error: 'Username cannot contain spaces' };
    }
    return {
      isValid: false,
      error: 'Only letters, numbers, underscores (_) and hyphens (-) allowed. Must start with a letter.',
    };
  }

  return { isValid: true };
}

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuth();

  // Real-time username validation
  const usernameValidation = useMemo(
    () => validateUsername(username),
    [username]
  );

  const isFormValid = useMemo(() => {
    return (
      usernameValidation.isValid &&
      email.trim() !== '' &&
      password.length >= 6 &&
      password === confirmPassword
    );
  }, [usernameValidation.isValid, email, password, confirmPassword]);

  const handleSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Username check cases

    const unameCheck = validateUsername(username);

    if (!unameCheck.isValid) {
      Alert.alert('Invalid Username', unameCheck.error);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email.trim(), password, username.trim());

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/Login'),
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-primary dark:bg-accent">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : undefined}
        keyboardVerticalOffset={0} // ← tweak to 10-30 if you notice offset issues later
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="bg-purple-600 w-20 h-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="images" size={40} color="#fff" />
              </View>
              <Text className="text-white text-3xl font-bold">Create Account</Text>
              <Text className="text-gray-400 text-base mt-2">
                Sign up to get started
              </Text>
            </View>

            {/* Username Input */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm font-medium">
                Username
              </Text>
              <View className="bg-gray-800 rounded-lg flex-row items-center px-4 border border-gray-700">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 text-white p-4 ml-2"
                  placeholder="Choose a username"
                  placeholderTextColor="#6B7280"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm font-medium">
                Email
              </Text>
              <View className="bg-gray-800 rounded-lg flex-row items-center px-4 border border-gray-700">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 text-white p-4 ml-2"
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm font-medium">
                Password
              </Text>
              <View className="bg-gray-800 rounded-lg flex-row items-center px-4 border border-gray-700">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 text-white p-4 ml-2"
                  placeholder="Create a password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-gray-400 mb-2 text-sm font-medium">
                Confirm Password
              </Text>
              <View className="bg-gray-800 rounded-lg flex-row items-center px-4 border border-gray-700">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 text-white p-4 ml-2"
                  placeholder="Confirm your password"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className={`bg-purple-600 py-4 rounded-lg items-center mb-4 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-gray-500 text-xs text-center mb-6">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-400">Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/Login')}
                disabled={loading}
              >
                <Text className="text-purple-400 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}