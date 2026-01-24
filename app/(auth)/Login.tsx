import { useAuth } from '@/contexts/AuthContext'; // adjust path if needed
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      // Replace instead of push → clears login from stack
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Define screen options right here in the component */}
      <Stack.Screen
        options={{
          title: 'Login',
          headerShown: false,          // change to false if you want no header
          headerStyle: { backgroundColor: '#111827' }, // dark bg if you want
          headerTintColor: '#fff',
        }}
      />

      <SafeAreaView className="flex-1 bg-primary"> {/* bg-primary = dark bg */}
        <KeyboardAvoidingView
          
          behavior={Platform.OS === 'android' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-6 justify-center">
              {/* Logo / Header */}
              <View className="items-center mb-10">
                <View className="bg-purple-600 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="images" size={40} color="#fff" />
                </View>
                <Text className='text-white text-3xl font-bold'>Meme Arsenal</Text>
                <Text className="text-white text-2xl  "
                style={{ lineHeight: 40 }}
                >Welcome Back</Text>
                
                <Text className="text-gray-400 text-base mt-1">
                  Sign in to continue
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm font-medium">Email</Text>
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
              <View className="mb-6">
                <Text className="text-gray-400 mb-2 text-sm font-medium">Password</Text>
                <View className="bg-gray-800 rounded-lg flex-row items-center px-4 border border-gray-700">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 text-white p-4 ml-2"
                    placeholder="Enter your password"
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

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                className="self-end mb-6"
                disabled={loading}
              >
                <Text className="text-purple-400 font-medium">Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className={`bg-purple-600 py-4 rounded-lg items-center mb-4 ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-700" />
                <Text className="text-gray-400 px-4">or</Text>
                <View className="flex-1 h-px bg-gray-700" />
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-400">Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/Signup')}
                  disabled={loading}
                >
                  <Text className="text-purple-400 font-bold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}