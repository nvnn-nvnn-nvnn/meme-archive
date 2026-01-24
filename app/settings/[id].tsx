import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsDetail() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();



  const renderContent = () => {
    switch (id) {
      case 'profile':
        return <ProfileContent />;
      case 'email':
        return <EmailContent/>
      case 'password':
        return <PasswordContent />;
      case 'cloud':
        return <CloudContent />;
      case 'financial':
        return <FinancialContent />;
      case 'subscriptions':
        return <SubscriptionsContent />;
      case 'receipts':
        return <ReceiptsContent />;
      case 'notifications':
        return <NotificationsContent />;
      case 'support':
        return <SupportContent />;
      case 'privacy-policy':
        return <PrivacyPolicyContent/>;
      case 'acknowledgements':
        return <AcknowledgementsContent />;
      case 'credits':
        return <CreditsContent />;
      default:
        return <DefaultContent />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center border-b border-gray-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">
          {title || 'Settings'}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Content Components ───────────────────────────────────────────

const ProfileContent = () => {


  const { user } = useAuth();

 const [profileData, setProfileData] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError("Not logged in");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error.message);
        setError(error.message);
      } else if (data) {
        setProfileData(data);
      } else {
        // No row found → common on first login
        console.log('No profile row exists yet for user:', user.id);
        setProfileData({ username: '' }); // or show a message
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  // ────────────────────────────────────────────────
  // Render different states
  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <Text className="text-white text-center py-10">Loading profile...</Text>
    );
  }

  if (error) {
    return (
      <Text className="text-red-400 text-center py-10">{error}</Text>
    );
  }

  return ( <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Profile Information
    </Text>
    
    <View className="mb-4">
      <Text className="text-gray-400 mb-2">Preferred Name</Text>
      <TextInput
        className="bg-gray-800 text-white p-3 rounded-lg"
        placeholder="Enter your name"
        placeholderTextColor="#6B7280"
      />
    </View>

    <View className="mb-4">
      <Text className="text-gray-400 mb-2">Username</Text>
      <TextInput
        className="bg-gray-800 text-white p-3 rounded-lg"
        // placeholder=""
        placeholderTextColor="#6B7280"
        value={profileData ? profileData.username : ''} 
        editable={false}
      />
    </View>

    <View className="mb-4">
      <Text className="text-gray-400 mb-2">Bio</Text>
      <TextInput
        className="bg-gray-800 text-white p-3 rounded-lg"
        placeholder="Tell us about yourself"
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>

    <TouchableOpacity className="bg-purple-600 py-3 rounded-lg mt-4">
      <Text className="text-white font-semibold text-center">
        Save Changes
      </Text>
    </TouchableOpacity>
  </View>
  );

 
};


// Email Content
const EmailContent = () => {
  const { user } = useAuth();

  const [updatedEmail, setUpdatedEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // ← NEW: state for password
  const [showPassword, setShowpassword] =useState(false);

  const [isValidEmail, setIsValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (text: string) => {
    setUpdatedEmail(text);
    if (text.length > 0) {
      setIsValidEmail(validateEmail(text));
    } else {
      setIsValidEmail(true);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!isValidEmail || updatedEmail.length === 0) {
      setError('Please enter a valid email address');
      return;
    }

    if (!confirmPassword) {
      setError('Please enter your current password to confirm');
      return;
    }

    if (updatedEmail === user?.email) {
      setError("This is already your current email");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Re-authenticate with current password (refreshes session)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email!,
        password: confirmPassword,
      });

      if (signInError) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // STEP 2: Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: updatedEmail,
      });

      if (updateError) {
        if (
          updateError.message.includes('already registered') ||
          updateError.message.includes('duplicate') ||
          updateError.message.includes('taken')
        ) {
          setError('This email is already in use by another account.');
        } else {
          setError(updateError.message || 'Failed to update email');
        }
        setLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      Alert.alert(
        'Success',
        'Email updated! Please check your inbox to confirm the change.'
      );

      // Optional: clear fields
      setUpdatedEmail('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error('Email change error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text className="text-white text-lg font-semibold mb-4">
        Email Information
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-3">Current Email:</Text>
        <Text className="bg-gray-800 text-white p-3 rounded-lg text-gray-300">
          {user?.email || 'Loading...'}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">New Email</Text>
        <TextInput
          className={`p-3 rounded-lg ${
            isValidEmail
              ? 'bg-gray-800 text-white'
              : 'bg-red-900/20 text-white border-2 border-red-500'
          }`}
          placeholder="Enter your new email address"
          placeholderTextColor="#6B7280"
          value={updatedEmail}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {!isValidEmail && updatedEmail.length > 0 && (
          <Text className="text-red-500 text-sm mt-1">
            Please enter a valid email address
          </Text>
        )}
      </View>

        <View className="mb-4">
        <Text className="text-gray-400 mb-2">Current Password</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-xl pr-12"
            placeholder="Enter current password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onPress={() => setShowpassword(!showPassword)}
          >r
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      )}

      {success && (
        <Text className="text-green-500 text-center mb-4">
          Email updated successfully!
        </Text>
      )}

      <TouchableOpacity
        className={`bg-purple-600 py-4 rounded-xl ${loading ? 'opacity-60' : ''}`}
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-center">
          {loading ? 'Updating...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};



const PasswordContent = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Re-authenticate with current password (refreshes session)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email!,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // STEP 2: Now session is fresh → safe to update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      Alert.alert('Success!', 'Your password has been changed');

      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error('Password change failed:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text className="text-white text-lg font-semibold mb-4">
        Change Password
      </Text>

      {/* Current Password */}
      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Current Password</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-xl pr-12"
            placeholder="Enter current password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onPress={() => setShowCurrent(!showCurrent)}
          >
            <Ionicons
              name={showCurrent ? "eye-off" : "eye"}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* New Password */}
      <View className="mb-4">
        <Text className="text-gray-400 mb-2">New Password</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-xl pr-12"
            placeholder="Enter new password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onPress={() => setShowNew(!showNew)}
          >
            <Ionicons
              name={showNew ? "eye-off" : "eye"}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm New Password */}
      <View className="mb-6">
        <Text className="text-gray-400 mb-2">Confirm New Password</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-xl pr-12"
            placeholder="Confirm new password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onPress={() => setShowConfirm(!showConfirm)}
          >
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <Text className="text-red-500 text-center mb-4">{error}</Text>
      )}

      {success && (
        <Text className="text-green-500 text-center mb-4">
          Password updated successfully!
        </Text>
      )}

      <TouchableOpacity
        className={`bg-purple-600 py-4 rounded-xl ${loading ? 'opacity-60' : ''}`}
        onPress={handleChangePassword}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-center">
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};



const CloudContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Cloud Storage
    </Text>
    
    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-400">Storage Used</Text>
        <Text className="text-white font-semibold">2.4 GB / 5 GB</Text>
      </View>
      <View className="bg-gray-700 h-2 rounded-full overflow-hidden">
        <View className="bg-purple-600 h-full" style={{ width: '48%' }} />
      </View>
    </View>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Sync Status</Text>
      <View className="flex-row items-center">
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        <Text className="text-green-500 ml-2">All files synced</Text>
      </View>
    </View>

    <TouchableOpacity className="bg-purple-600/30 py-3 rounded-lg border border-purple-600">
      <Text className="text-purple-300 font-semibold text-center">
        Upgrade Storage
      </Text>
    </TouchableOpacity>
  </View>
);

const FinancialContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Payment Methods
    </Text>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="card" size={24} color="#a855f7" />
          <View className="ml-3">
            <Text className="text-white font-semibold">•••• 4242</Text>
            <Text className="text-gray-400 text-sm">Expires 12/25</Text>
          </View>
        </View>
        <Text className="text-green-500 text-sm">Primary</Text>
      </View>
    </View>

    <TouchableOpacity className="bg-purple-600 py-3 rounded-lg">
      <Text className="text-white font-semibold text-center">
        Add Payment Method
      </Text>
    </TouchableOpacity>
  </View>
);

const SubscriptionsContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Active Subscriptions
    </Text>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Premium Plan</Text>
      <Text className="text-gray-400 mb-3">$9.99/month</Text>
      <Text className="text-gray-400 text-sm mb-3">
        Next billing date: Feb 15, 2026
      </Text>
      <TouchableOpacity className="bg-red-600/20 py-2 rounded-lg border border-red-600">
        <Text className="text-red-400 text-center font-medium">
          Cancel Subscription
        </Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity className="bg-purple-600/30 py-3 rounded-lg border border-purple-600">
      <Text className="text-purple-300 font-semibold text-center">
        Manage Billing
      </Text>
    </TouchableOpacity>
  </View>
);

const ReceiptsContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Billing History
    </Text>

    {[
      { date: 'Jan 15, 2026', amount: '$9.99', status: 'Paid' },
      { date: 'Dec 15, 2025', amount: '$9.99', status: 'Paid' },
      { date: 'Nov 15, 2025', amount: '$9.99', status: 'Paid' },
    ].map((receipt, index) => (
      <View
        key={index}
        className="bg-gray-800 rounded-lg p-4 mb-3 flex-row justify-between items-center"
      >
        <View>
          <Text className="text-white font-semibold">{receipt.date}</Text>
          <Text className="text-gray-400 text-sm">{receipt.status}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-white font-semibold mr-3">{receipt.amount}</Text>
          <Ionicons name="download-outline" size={20} color="#a855f7" />
        </View>
      </View>
    ))}
  </View>
);

const NotificationsContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Notification Preferences
    </Text>

    {[
      { title: 'Push Notifications', enabled: true },
      { title: 'Email Updates', enabled: true },
      { title: 'SMS Alerts', enabled: false },
      { title: 'In-App Messages', enabled: true },
    ].map((item, index) => (
      <View
        key={index}
        className="bg-gray-800 rounded-lg p-4 mb-3 flex-row justify-between items-center"
      >
        <Text className="text-white">{item.title}</Text>
        <View
          className={`w-12 h-6 rounded-full p-1 ${
            item.enabled ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <View
            className={`w-4 h-4 rounded-full bg-white ${
              item.enabled ? 'ml-auto' : ''
            }`}
          />
        </View>
      </View>
    ))}
  </View>
);

const SupportContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Get Help
    </Text>

    <TouchableOpacity className="bg-gray-800 rounded-lg p-4 mb-3 flex-row items-center">
      <Ionicons name="chatbubble-outline" size={24} color="#a855f7" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-semibold">Live Chat</Text>
        <Text className="text-gray-400 text-sm">Chat with our support team</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>

    <TouchableOpacity className="bg-gray-800 rounded-lg p-4 mb-3 flex-row items-center">
      <Ionicons name="mail-outline" size={24} color="#a855f7" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-semibold">Email Support</Text>
        <Text className="text-gray-400 text-sm">support@example.com</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>

    <TouchableOpacity className="bg-gray-800 rounded-lg p-4 mb-3 flex-row items-center">
      <Ionicons name="document-text-outline" size={24} color="#a855f7" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-semibold">Documentation</Text>
        <Text className="text-gray-400 text-sm">Browse help articles</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </View>
);

const AcknowledgementsContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Open Source Libraries
    </Text>

    {[
      { name: 'React Native', license: 'MIT' },
      { name: 'Expo', license: 'MIT' },
      { name: 'NativeWind', license: 'MIT' },
    ].map((lib, index) => (
      <View key={index} className="bg-gray-800 rounded-lg p-4 mb-3">
        <Text className="text-white font-semibold">{lib.name}</Text>
        <Text className="text-gray-400 text-sm">{lib.license} License</Text>
      </View>
    ))}
  </View>
);

// Policies

const PrivacyPolicyContent = () => {


  return(
 <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Active Subscriptions
    </Text>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Premium Plan</Text>
      <Text className="text-gray-400 mb-3">$9.99/month</Text>
      <Text className="text-gray-400 text-sm mb-3">
        Next billing date: Feb 15, 2026
      </Text>
      <TouchableOpacity className="bg-red-600/20 py-2 rounded-lg border border-red-600">
        <Text className="text-red-400 text-center font-medium">
          Cancel Subscription
        </Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity className="bg-purple-600/30 py-3 rounded-lg border border-purple-600">
      <Text className="text-purple-300 font-semibold text-center">
        Manage Billing
      </Text>
    </TouchableOpacity>
  </View>

  );

};









const CreditsContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      App Credits
    </Text>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Development Team</Text>
      <Text className="text-gray-400">Built singlehandedly by Devan Lee</Text>
    </View>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Version 1.0.0</Text>
      <Text className="text-gray-400">1.0.0</Text>
    </View>

    <View className="bg-gray-800 rounded-lg p-4">
      <Text className="text-white font-semibold mb-2">Special Thanks</Text>
      <Text className="text-gray-400">
        Mom, Dad, and 
        thank you to all our users and contributors
      </Text>
    </View>
  </View>
);

const DefaultContent = () => (
  <View className="flex-1 items-center justify-center py-20">
    <Ionicons name="construct-outline" size={64} color="#6B7280" />
    <Text className="text-gray-400 text-lg mt-4">
      This section is under construction
    </Text>
  </View>
);

const styles = StyleSheet.create({});