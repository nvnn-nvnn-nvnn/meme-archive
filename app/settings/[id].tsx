import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { supabase } from '../../lib/supabase';

import { StorageIndicator } from '@/components/StorageIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';






// Policies





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
      case 'appearance':
        return <AppearanceContent/>;
      case 'notifications':
        return <NotificationsContent />;
      case 'support':
        return <SupportContent />;
      case 'docs':               // NEW
        return <DocsContent />;  // NEW
      case 'privacy-policy':
        return <PrivacyPolicyContent/>;

      case'MemeAresenal-rules':
        return <RulesContent/>

      case'user-agreement':
        return <UserAgreementContent/>


      case 'acknowledgements':
        return <AcknowledgementsContent />;
      case 'credits':
        return <CreditsContent />;
      default:
        return <DefaultContent />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary dark:bg-accent">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center border-b border-dark-100 dark:border-light-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-textAlt dark:text-textDefault text-xl font-bold flex-1">
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

 const [profileData, setProfileData] = useState<{ username: string, bio: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bio
const [bio, setBio] = useState('');          // Current saved bio
const [tempBio, setTempBio] = useState('');  // Temp value while editing
const [isEditingBio, setIsEditingBio] = useState(false);




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
        .select('username, bio, profile_image_url, member_since, created_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error.message);
        setError(error.message);
      } else if (data) {
        setProfileData(data);
        setBio(data.bio || '')
        setTempBio(data.bio || '')
      } else {
        // No row found → common on first login
        console.log('No profile row exists yet for user:', user.id);
        setProfileData({ username: '' });
        setBio('');
        setTempBio('');
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



  const handleSaveBio = async () => {
  if (!user?.id) {
    Alert.alert('Error', 'You must be logged in.');
    return;
  }
  // Optional: skip if nothing changed
  if (tempBio === bio) {
    Alert.alert('No changes', 'Your bio is already up to date.');
    return;
  }
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ bio: tempBio })
      .eq('id', user.id);
    if (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Could not update bio.');
      return;
    }
    setBio(tempBio);
    Alert.alert('Success', 'Your bio has been updated.');
  } catch (e: any) {
    console.error('Unexpected error updating bio:', e);
    Alert.alert('Error', e.message || 'Unexpected error.');
  }
};

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
        onChangeText={setTempBio}
        value={tempBio}
      />
    </View>

    <TouchableOpacity 
    className="bg-purple-600 py-3 rounded-lg mt-4"
    onPress={handleSaveBio}
    >
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



const CloudContent = () => {

  const { user } = useAuth();

  return(

      <View>
      <Text className="text-white text-lg font-semibold mb-4">
        Cloud Storage
      </Text>
      
      <View className='mb-5'>
        <StorageIndicator userId={user?.id!}/>
      </View>
    


      {/* <View className="bg-gray-800 rounded-lg p-4 mb-4">


        
        <View className="flex-row justify-between mb-2">
          <StorageIndicator/>
        </View>
      
      </View> */}

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


 


  
}
 

const FinancialContent = () => {
  // PLACEHOLDER STATE - NOT REAL PAYMENT DATA
  const [hasCredit, setHasCredit] = useState(false);
  const [authPaymentModal, setAuthPaymentModal] = useState(false);
  
  const { user, loading } = useAuth();

  // SECURITY CHECK - NO USER, NO ACCESS
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="lock-closed" size={48} color="#ef4444" />
        <Text className="text-red-400 text-lg font-semibold mt-4">
          Unauthorized Access
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          You must be logged in to view payment information
        </Text>
      </View>
    );
  }

  // LOADING STATE
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg">Loading payment information...</Text>
      </View>
    );
  }

  const closeModal = () => {
    setAuthPaymentModal(false);
  };

  // PLACEHOLDER FUNCTION - NOT REAL PAYMENT PROCESSING
  const handleAddPayment = () => {
    Alert.alert(
      "Payment Information",
      "This is a PLACEHOLDER feature. No real payment processing is implemented yet. Your information is safe and private.",
      [
        {
          text: "I Understand",
          onPress: () => {
            // SIMULATE SUCCESS - NO REAL DATA SAVED
            setHasCredit(true);
            Alert.alert(
              "Success! ",
              "Payment method saved (PLACEHOLDER ONLY)\n\nNote: We don't have a real payment system implemented yet. This is for UI demonstration purposes only.",
              [{ text: "OK" }]
            );
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // PLACEHOLDER FUNCTION - NOT REAL PAYMENT UPDATE
  const handleUpdatePayment = () => {
    Alert.alert(
      "Update Payment Information?",
      "This is a PLACEHOLDER feature. No real payment data will be modified.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm Update",
          onPress: () => {
            Alert.alert(
              "Success! ",
              "Payment information updated (PLACEHOLDER ONLY)\n\nReminder: No real payment system is active.",
              [{ text: "OK" }]
            );
            closeModal();
          }
        }
      ]
    );
  };

  // NO CREDIT CARD - MODERN EMPTY STATE
  if (user && !loading && !hasCredit) {
    return (
      <View className="flex-1 p-6">
        {/* Header */}
        <Text className="text-textAlt dark:text-textDefault text-2xl font-bold mb-2 text-center">
          Payment Methods
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-md mb-8 text-center">
          Securely manage your payment information
        </Text>

        {/* Empty State Card */}
        <View className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-8 items-center border-2 border-dashed border-purple-500/30 dark: border-accent">
          {/* Icon */}
          <View className="bg-purple-500/20 p-6 rounded-full mb-6">
            <Ionicons name="card-outline" size={64} color="#a855f7" />
          </View>

          {/* Text */}
          <Text className="text-textAlt dark:text-textDefault text-xl font-bold text-center mb-3">
            No Payment Methods
          </Text>
          <Text className="text-gray-500 dark:text-textAlt text-center mb-8 px-4">
            You currently don't have any payment information saved with us. Add a payment method to get started.
          </Text>

          {/* Add Button */}
          <TouchableOpacity 
            onPress={handleAddPayment}
            className="bg-accent w-full py-4 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text className="text-white font-bold text-lg ml-2">
              Add Payment Method
            </Text>
          </TouchableOpacity>

          {/* Security Badge */}
          <View className="flex-row items-center mt-6 bg-green-500/10 px-4 py-2 rounded-full">
            <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
            <Text className="text-green-500 text-xs ml-2 font-medium">
              PLACEHOLDER - No real payment processing active
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View className="mt-8 space-y-4 mb-5">
          <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-400 font-semibold mb-1">Development Mode</Text>
              <Text className="text-blue-300/80 text-sm">
                This is a UI placeholder. No actual payment processing is implemented.
              </Text>
            </View>
          </View>

          <View className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex-row items-start mt-5">
            <Ionicons name="lock-closed" size={24} color="#a855f7" />
            <View className="ml-3 flex-1">
              <Text className="text-purple-400 font-semibold mb-1">Your Data is Private</Text>
              <Text className="text-purple-300/80 text-sm">
                When implemented, all payment data will be encrypted and secured.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // HAS CREDIT CARD - DISPLAY SAVED PAYMENT
  if (user && !loading && hasCredit) {
    // PLACEHOLDER DATA - NOT REAL CARD INFO
    const placeholderCardLast4 = "4242";
    const placeholderExpiration = "12/25";

    return (
      <View className="flex-1 p-6">
        {/* Header */}
        <Text className="text-text-light dark:text-text-dark text-2xl font-bold mb-2">
          Payment Methods
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Manage your saved payment methods
        </Text>

        {/* Payment Card Display */}
        <TouchableOpacity 
          onPress={() => setAuthPaymentModal(true)}
          activeOpacity={0.7}
          className="bg-gray-800 dark:bg-dark-100 rounded-2xl p-5 mb-4 border border-gray-700 dark:border-gray-600"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="bg-purple-500/20 p-3 rounded-full">
                <Ionicons name="card" size={24} color="#a855f7" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-semibold text-lg">
                  •••• {placeholderCardLast4}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Expires {placeholderExpiration}
                </Text>
              </View>
            </View>
            <View className="bg-green-500/20 px-3 py-1 rounded-full">
              <Text className="text-green-500 text-xs font-semibold">Primary</Text>
            </View>
          </View>

          {/* Tap to View Hint */}
          <View className="flex-row items-center justify-center pt-3 border-t border-gray-700">
            <Ionicons name="eye-outline" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-xs ml-2">Tap to view details</Text>
          </View>
        </TouchableOpacity>

        {/* Warning Badge */}
        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex-row items-start">
          <Ionicons name="warning" size={20} color="#eab308" />
          <View className="ml-3 flex-1">
            <Text className="text-yellow-400 font-semibold mb-1">Placeholder Data</Text>
            <Text className="text-yellow-300/80 text-sm">
              This is demonstration data only. No real payment information is stored.
            </Text>
          </View>
        </View>

        {/* PAYMENT DETAILS MODAL */}
        <Modal
          visible={authPaymentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md border-2 border-gray-700">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-white text-xl font-bold">Payment Details</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close-circle" size={28} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* PLACEHOLDER CARD INFO - HIDDEN/MASKED */}
              <View className="space-y-4 mb-6">
                {/* Card Number */}
                <View className="bg-gray-800 rounded-xl p-4">
                  <Text className="text-gray-400 text-xs mb-2">Card Number</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-mono text-lg">•••• •••• •••• {placeholderCardLast4}</Text>
                    <Ionicons name="eye-off" size={20} color="#a855f7" />
                  </View>
                </View>

                {/* Expiration Date */}
                <View className="bg-gray-800 rounded-xl p-4 mt-3">
                  <Text className="text-gray-400 text-xs mb-2">Expiration Date</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-mono text-lg">{placeholderExpiration}</Text>
                    <Ionicons name="eye-off" size={20} color="#a855f7" />
                  </View>
                </View>

                {/* CVV */}
                <View className="bg-gray-800 rounded-xl p-4 mt-3">
                  <Text className="text-gray-400 text-xs mb-2">Security Code (CVV)</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-mono text-lg">•••</Text>
                    <Ionicons name="eye-off" size={20} color="#a855f7" />
                  </View>
                </View>

                {/* Cardholder Name */}
                <View className="bg-gray-800 rounded-xl p-4 mt-3">
                  <Text className="text-gray-400 text-xs mb-2">Cardholder Name</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white text-lg">••••••••••</Text>
                    <Ionicons name="eye-off" size={20} color="#a855f7" />
                  </View>
                </View>
              </View>

              {/* Security Notice */}
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 ">
                <View className="flex-row items-start">
                  <Ionicons name="shield-checkmark" size={20} color="#ef4444" />
                  <View className="ml-3 flex-1">
                    <Text className="text-red-400 font-semibold mb-1">Protected Data</Text>
                    <Text className="text-red-300/80 text-xs">
                      PLACEHOLDER ONLY - No real payment data is stored or processed
                    </Text>
                  </View>
                </View>
              </View>

              {/* Update Button */}
              <TouchableOpacity 
                onPress={handleUpdatePayment}
                className="bg-accent py-4 rounded-xl flex-row items-center justify-center mb-3"
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Update Payment Information
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity 
                onPress={closeModal}
                className="bg-gray-800 py-4 rounded-xl items-center"
                activeOpacity={0.8}
              >
                <Text className="text-gray-300 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return null;
};

const SubscriptionsContent = () => {

  const {user, loading } = useAuth();
  const [subscribed, setSubscribed] = useState(false);



  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="lock-closed" size={48} color="#ef4444" />
        <Text className="text-red-400 text-lg font-semibold mt-4">
          Unauthorized Access
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          You must be logged in to view payment information
        </Text>
      </View>
    );
  }

    if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg">Loading subscriptions...</Text>
      </View>
    );
  }



  if (user && !subscribed && !loading) {
    

    return(


      
     
      <View className="flex-1 p-6">
        {/* Header */}
        <Text className="text-textAlt dark:text-textDefault text-2xl font-bold mb-2 text-center">
          Subscriptions
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-md mb-8 text-center">
          Manage your active subscriptions
        </Text>

        {/* Empty State Card */}
        <View className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 items-center border-2 border-dashed border-blue-500/30">
          {/* Icon */}
          <View className="bg-blue-500/20 p-6 rounded-full mb-6">
            <Ionicons name="rocket-outline" size={64} color="#3b82f6" />
          </View>

          {/* Text */}
          <Text className="text-textAlt dark:text-textDefault text-xl font-bold text-center mb-3">
            No Active Subscriptions
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8 px-4 leading-6">
            You currently don't have any active subscriptions. Unlock premium features and take your experience to the next level!
          </Text>

          {/* CTA Button */}
          <TouchableOpacity 
            onPress={() => {
              // Navigate to subscription plans or show alert
              Alert.alert(
                "Coming Soon! ",
                "Premium subscriptions will be available soon. Stay tuned for exclusive features!",
                [{ text: "OK" }]
              );
            }}
            className="bg-accent w-full py-4 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={24} color="#fff" />
            <Text className="text-white font-bold text-lg ml-2">
              Explore Premium Plans
            </Text>
          </TouchableOpacity>

          {/* Features Preview */}
          <View className="mt-8 w-full space-y-3">
            <View className="flex-row items-center mt-3" >
              <View className="bg-purple-500/20 p-2 rounded-lg mr-3">
                <Ionicons name="checkmark-circle" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-400 flex-1">Unlimited meme storage</Text>
            </View>
            
            <View className="flex-row items-center  mt-3 ">
              <View className="bg-purple-500/20 p-2 rounded-lg mr-3 ">
                <Ionicons name="checkmark-circle" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-400 flex-1">Ad-free experience</Text>
            </View>
            
            <View className="flex-row items-center  mt-3">
              <View className="bg-purple-500/20 p-2 rounded-lg mr-3">
                <Ionicons name="checkmark-circle" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-400 flex-1">Priority support</Text>
            </View>

            <View className="flex-row items-center  mt-3">
              <View className="bg-purple-500/20 p-2 rounded-lg mr-3">
                <Ionicons name="checkmark-circle" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-400 flex-1">Exclusive features</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex-row items-start">
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <View className="ml-3 flex-1">
            <Text className="text-blue-400 font-semibold mb-1">Why Subscribe?</Text>
            <Text className="text-blue-300/80 text-sm">
              Get access to premium features, enhanced storage, and exclusive content to supercharge your meme game.
            </Text>
          </View>
        </View>
      </View>




    );



  };




  return(
    <View>
      <Text className="text-white text-lg font-semibold mb-4 text-center">
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


}
 const ReceiptsContent = () => {
  const { user, loading } = useAuth();
  
  // FIX: useState syntax was wrong
  const [hasReceipts, setHasReceipts] = useState(false);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="lock-closed" size={48} color="#ef4444" />
        <Text className="text-red-400 text-lg font-semibold mt-4">
          Unauthorized Access
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          You must be logged in to view receipts
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg">Loading receipts...</Text>
      </View>
    );
  }

  // NO RECEIPTS - MODERN EMPTY STATE
  if (user && !loading && !hasReceipts) {
    return (
      <View className="flex-1 p-6">
        {/* Header */}
        <Text className="text-textAlt dark:text-text-dark text-2xl font-bold mb-2 text-center">
          Receipts & Billing
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
          View and download your transaction history
        </Text>

        {/* Empty State Card */}
        <View className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl p-8 items-center border-2 border-dashed border-green-500/30">
          {/* Icon */}
          <View className="bg-green-500/20 p-6 rounded-full mb-6">
            <Ionicons name="receipt-outline" size={64} color="#22c55e" />
          </View>

          {/* Text */}
          <Text className="text-textAlt dark:text-text-dark text-xl font-bold text-center mb-3">
            No Receipts Yet
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8 px-4 leading-6">
            You don't have any receipts or billing documents at the moment. When you make purchases, they'll appear here.
          </Text>

          {/* Info Icons */}
          <View className="w-full space-y-3">
            <View className="flex-row items-center bg-gray-800/50 dark:bg-dark-100 p-4 rounded-xl">
              <View className="bg-blue-500/20 p-2 rounded-lg mr-3">
                <Ionicons name="download-outline" size={20} color="#3b82f6" />
              </View>
              <Text className="text-gray-400 flex-1 text-sm mt-3">
                Download receipts as PDF
              </Text>
            </View>
            
            <View className="flex-row items-center bg-gray-800/50 dark:bg-dark-100 p-4 rounded-xl mt-3">
              <View className="bg-purple-500/20 p-2 rounded-lg mr-3">
                <Ionicons name="time-outline" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-400 flex-1 text-sm">
                Access transaction history
              </Text>
            </View>

            <View className="flex-row items-center bg-gray-800/50 dark:bg-dark-100 p-4 rounded-xl mt-3">
              <View className="bg-green-500/20 p-2 rounded-lg mr-3">
                <Ionicons name="shield-checkmark-outline" size={20} color="#22c55e" />
              </View>
              <Text className="text-gray-400 flex-1 text-sm">
                Secure billing documentation
              </Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex-row items-start">
          <Ionicons name="information-circle" size={24} color="#22c55e" />
          <View className="ml-3 flex-1">
            <Text className="text-green-400 font-semibold mb-1">Automatic Receipts</Text>
            <Text className="text-green-300/80 text-sm">
              All your purchases and subscriptions will automatically generate receipts for your records.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // HAS RECEIPTS - DISPLAY LIST
  if (user && !loading && hasReceipts) {
    // PLACEHOLDER RECEIPTS DATA
    const placeholderReceipts = [
      {
        id: '1',
        date: 'Jan 15, 2026',
        amount: '$9.99',
        description: 'Premium Subscription - Monthly',
        status: 'Paid',
      },
      {
        id: '2',
        date: 'Dec 15, 2025',
        amount: '$9.99',
        description: 'Premium Subscription - Monthly',
        status: 'Paid',
      },
    ];

    return (
      <View className="flex-1 p-6">
        {/* Header */}
        <Text className="text-text-light dark:text-text-dark text-2xl font-bold mb-2 text-center">
          Receipts & Billing
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          View and download your transaction history
        </Text>

        {/* Receipts List */}
        <View className="space-y-4">
          {placeholderReceipts.map((receipt) => (
            <TouchableOpacity
              key={receipt.id}
              className="bg-gray-800 dark:bg-dark-100 rounded-2xl p-5 border border-gray-700 dark:border-gray-600"
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  "Download Receipt",
                  "This is a PLACEHOLDER feature. Receipt download not implemented yet.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg mb-1">
                    {receipt.description}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {receipt.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-accent font-bold text-xl mb-1">
                    {receipt.amount}
                  </Text>
                  <View className="bg-green-500/20 px-3 py-1 rounded-full">
                    <Text className="text-green-500 text-xs font-semibold">
                      {receipt.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Download Button */}
              <View className="flex-row items-center justify-center pt-3 border-t border-gray-700">
                <Ionicons name="download-outline" size={16} color="#a855f7" />
                <Text className="text-accent text-sm ml-2 font-medium">
                  Download PDF
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Placeholder Warning */}
        <View className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex-row items-start">
          <Ionicons name="warning" size={20} color="#eab308" />
          <View className="ml-3 flex-1">
            <Text className="text-yellow-400 font-semibold mb-1">Placeholder Data</Text>
            <Text className="text-yellow-300/80 text-sm">
              These are example receipts. Real billing data not implemented yet.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
};




const AppearanceContent = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleToggle = (nextValue: boolean) => {
    // No alert - just toggle instantly for modern UX
    setColorScheme(nextValue ? 'dark' : 'light');
  };

  return (
    <View className='items-center mb-5 p-6'>
      {/* Header */}
      <Text className="text-textAlt dark:text-textDefault text-3xl font-bold mb-2">
        Appearance
      </Text>
      <Text className="text-textAlt dark:text-textDefault text-md mb-6">
        Customize how MemeArsenal looks
      </Text>

      {/* Theme Toggle Card */}
      <View className="w-full bg-accent dark:bg-primary rounded-2xl p-5 shadow-lg">
        <View className="flex-row items-center justify-between">
          {/* Left Side - Icon + Text */}
          <View className="flex-row items-center gap-3">

            <View className="bg-gray-100 dark:bg-dark-200 p-3 rounded-full">
              <Text className="text-2xl">
                {isDark ? '🌙' : '☀️'}
              </Text>
            </View>
            <View>
              <Text className="text-textDefault dark:text-textAlt font-semibold text-lg">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text className="text-textDefault dark:text-textAlt text-sm">
                {isDark ? 'Easy on the eyes' : 'Bright and clear'}
              </Text>
            </View>
          </View>

          {/* Right Side - Switch */}
          <Switch
            trackColor={{ false: '#d1d5db', true: '#a855f7' }}
            thumbColor={isDark ? '#ffffff' : '#f9fafb'}
            ios_backgroundColor="#d1d5db"
            onValueChange={handleToggle}
            value={isDark}
            style={{
              transform: [{ scale: 1.1 }],
            }}
          />
        </View>
      </View>

      {/* Optional: Theme Preview */}
      <View className="mt-6 w-full">
        <Text className="text-textAlt dark:text-textDefault text-md text-center mb-3">
          Preview
        </Text>
        <View className="bg-primary dark:bg-light-100 rounded-xl p-4 border border-gray-200 dark:border-dark-100">
          <Text className="text-textAlt  font-medium mb-2 text-center">
            Sample Text
          </Text>
          <View className="bg-accent dark:bg-primary p-3 rounded-lg">
            <Text className="text-textDefault dark:text-textAlt text-sm">
              This is how your content will look
            </Text>

          </View>
        </View>
      </View>
    </View>
  );
};



const NotificationsContent = () => {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [inAppMessages, setInAppMessages] = useState(false);

  const handleToggle = (setter, currentValue, notificationType) => {
    Alert.alert(
      "Notification Settings",
      `${notificationType} notification settings are not yet implemented. This is a placeholder feature.`,
      [
        {
          text: "I Understand",
          onPress: () => {
            // Toggle the switch for demo purposes
            setter(!currentValue);
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <View className="p-6">
      {/* Header */}
      <Text className="text-textAlt dark:text-text-dark text-2xl font-bold mb-2">
        Notifications
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Manage how you receive notifications
      </Text>

      {/* Placeholder Warning */}
      <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
        <View className="flex-row items-start">
          <Ionicons name="warning" size={24} color="#eab308" />
          <View className="ml-3 flex-1">
            <Text className="text-yellow-400 font-semibold mb-1">Development Mode</Text>
            <Text className="text-yellow-300/80 text-sm leading-5">
              Notification system is not yet implemented. These settings are placeholders for demonstration purposes only.
            </Text>
          </View>
        </View>
      </View>

      {/* Notification Settings */}
      <View className="space-y-4">
        {/* Push Notifications */}
        <View className="bg-gray-800 dark:bg-dark-100 rounded-2xl p-5 border border-primary dark:border-gray-600">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-purple-500/20 p-3 rounded-full">
                <Ionicons name="notifications" size={24} color="#a855f7" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-semibold text-lg">
                  Push Notifications
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Get alerts for new activity
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#a855f7' }}
              thumbColor={pushNotifications ? '#ffffff' : '#f9fafb'}
              ios_backgroundColor="#d1d5db"
              onValueChange={() => handleToggle(setPushNotifications, pushNotifications, 'Push')}
              value={pushNotifications}
              style={{ transform: [{ scale: 1.1 }] }}
            />
          </View>
        </View>

        {/* Email Updates */}
        <View className="bg-gray-800 dark:bg-dark-100 rounded-2xl p-5 border border-primary dark:border-gray-600 mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-500/20 p-3 rounded-full">
                <Ionicons name="mail" size={24} color="#3b82f6" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-semibold text-lg">
                  Email Updates
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#a855f7' }}
              thumbColor={emailUpdates ? '#ffffff' : '#f9fafb'}
              ios_backgroundColor="#d1d5db"
              onValueChange={() => handleToggle(setEmailUpdates, emailUpdates, 'Email')}
              value={emailUpdates}
              style={{ transform: [{ scale: 1.1 }] }}
            />
          </View>
        </View>

        {/* SMS Alerts */}
        <View className="bg-gray-800 dark:bg-dark-100 rounded-2xl p-5 border border-primary dark:border-gray-600 mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-green-500/20 p-3 rounded-full">
                <Ionicons name="chatbubble-ellipses" size={24} color="#22c55e" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-semibold text-lg">
                  SMS Alerts
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Get text message alerts
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#a855f7' }}
              thumbColor={smsAlerts ? '#ffffff' : '#f9fafb'}
              ios_backgroundColor="#d1d5db"
              onValueChange={() => handleToggle(setSmsAlerts, smsAlerts, 'SMS')}
              value={smsAlerts}
              style={{ transform: [{ scale: 1.1 }] }}
            />
          </View>
        </View>

        {/* In-App Messages */}
        <View className="bg-gray-800 dark:bg-dark-100 rounded-2xl p-5 border border-primary dark:border-gray-600 mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-orange-500/20 p-3 rounded-full">
                <Ionicons name="albums" size={24} color="#f97316" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white font-semibold text-lg">
                  In-App Messages
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  See notifications in-app
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#a855f7' }}
              thumbColor={inAppMessages ? '#ffffff' : '#f9fafb'}
              ios_backgroundColor="#d1d5db"
              onValueChange={() => handleToggle(setInAppMessages, inAppMessages, 'In-App')}
              value={inAppMessages}
              style={{ transform: [{ scale: 1.1 }] }}
            />
          </View>
        </View>
      </View>

      {/* Additional Info */}
      <View className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <View className="ml-3 flex-1">
            <Text className="text-blue-400 font-semibold mb-1">Coming Soon</Text>
            <Text className="text-blue-300/80 text-sm leading-5">
              Full notification system will be implemented in a future update. You'll be able to customize exactly what notifications you receive.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};


const SupportContent = () => {
  const handleEmailSupport = async () => {
    const email = 'MemeAresenal@proton.com';
    const subject = encodeURIComponent('MemeArsenal Support Request');
    const body = encodeURIComponent(
      `Hi MemeArsenal Support,%0D%0A%0D%0A` +
      `Please describe your issue here...%0D%0A%0D%0A` +
      `---%0D%0A(Sent from the MemeArsenal app)`
    );

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert(
          'Email not available',
          'We could not open your email app. Please email MemeAresenal@proton.com manually.'
        );
        return;
      }
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong trying to open your email app. Please email MemeAresenal@proton.com manually.'
      );
    }
  };

  const goToDocs = () => {
      router.push({
        pathname: '/settings/docs',
        params: { title: 'Documentation' },
      });
    };

  return(

     <View>
    <Text className="text-textAlt dark:text-textDefault text-lg font-semibold mb-4 text-center">
      Get Help
    </Text>


    {/* Not implemeting this yet */}
    {/* <TouchableOpacity className="bg-gray-800 rounded-lg p-4 mb-3 flex-row items-center">
      <Ionicons name="chatbubble-outline" size={24} color="#a855f7" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-semibold">Live Chat</Text>
        <Text className="text-gray-400 text-sm">Chat with our support team</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity> */}

    <TouchableOpacity 
      className="bg-gray-800 rounded-lg p-4 mb-3 flex-row items-center"
      onPress={handleEmailSupport}
    >
      <Ionicons name="mail-outline" size={24} color="#a855f7" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-semibold">Email Support</Text>
        <Text className="text-gray-400 text-sm">MemeAresenal@proton.com</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>


    <TouchableOpacity
        className="bg-gray-800 rounded-lg p-4 mb-3 flex-row items-center"
        onPress={goToDocs}
      >
        <Ionicons name="document-text-outline" size={24} color="#a855f7" />
        <View className="ml-3 flex-1">
          <Text className="text-white font-semibold">Documentation</Text>
          <Text className="text-gray-400 text-sm">Browse help articles</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
  </View>


  );


};


const DocsContent = () => {
  const articles = [
    {
      id: 'getting-started',
      title: 'Getting Started with MemeArsenal',
      summary: 'How to create folders, upload memes, and save Reddit posts.',
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      summary: 'What we store, how we use it, and how to delete your data.',
    },
  ];
 
  return (
    <View>
      <Text className="text-textAlt dark:text-textDefault text-2xl font-bold mb-4 text-center">
        Documentation
      </Text>
 
      {articles.map(article => (
        <View
          key={article.id}
          className="bg-gray-800 rounded-lg p-4 mb-3"
        >
          <Text className="text-white font-semibold mb-1">
            {article.title}
          </Text>
          <Text className="text-gray-400 text-sm">
            {article.summary}
          </Text>
        </View>
      ))}
    </View>
  );
};
 

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

const PrivacyPolicyContent = () => {
  const lastUpdated = "January 29, 2026";

  
   const handleEmailSupport = async () => {
    const email = 'MemeAresenal@proton.com';
    const subject = encodeURIComponent('MemeArsenal Support Request');
    const body = encodeURIComponent(
      `Hi MemeArsenal Support,%0D%0A%0D%0A` +
      `Please describe your issue here...%0D%0A%0D%0A` +
      `---%0D%0A(Sent from the MemeArsenal app)`
    );

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert(
          'Email not available',
          'We could not open your email app. Please email MemeAresenal@proton.com manually.'
        );
        return;
      }
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong trying to open your email app. Please email MemeAresenal@proton.com manually.'
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-primary dark:bg-secondary">
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-8 mt-5">
          <View className="bg-accent/20 p-4 rounded-full mb-4">
            <Ionicons name="shield-checkmark" size={48} color="#AB8BFF" />
          </View>
          <Text className="text-textAlt dark:text-text-dark text-3xl font-bold mb-2">
            Privacy Policy
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Last Updated: {lastUpdated}
          </Text>
        </View>

        {/* Introduction */}
        <View className="mb-6 mt-5">
          <Text className="text-textAlt dark:text-text-dark text-base leading-7">
            At MemeArsenal, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        {/* Section 1 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="information-circle" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              1. Information We Collect
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Personal Information
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              When you register for an account, we may collect personal information including but not limited to:
            </Text>
            <View className="space-y-2 mb-4">
              <Text className="text-gray-400">• Email address</Text>
              <Text className="text-gray-400">• Username</Text>
              <Text className="text-gray-400">• Profile information</Text>
              <Text className="text-gray-400">• Account preferences</Text>
            </View>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Usage Data
            </Text>
            <Text className="text-gray-400 leading-6 mb-2">
              We automatically collect certain information when you use MemeArsenal:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Device information and identifiers</Text>
              <Text className="text-gray-400">• App usage statistics</Text>
              <Text className="text-gray-400">• Crash reports and performance data</Text>
              <Text className="text-gray-400">• IP address and general location</Text>
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="construct" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              2. How We Use Your Information
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-2">
              We use the information we collect to:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Provide and maintain our services</Text>
              <Text className="text-gray-400">• Personalize your user experience</Text>
              <Text className="text-gray-400">• Process transactions and send notifications</Text>
              <Text className="text-gray-400">• Improve our app's functionality and features</Text>
              <Text className="text-gray-400">• Respond to customer support requests</Text>
              <Text className="text-gray-400">• Detect and prevent fraud or abuse</Text>
              <Text className="text-gray-400">• Comply with legal obligations</Text>
            </View>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="share-social" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              3. Information Sharing
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• <Text className="font-semibold">Service Providers:</Text> With trusted third-party vendors who assist in operating our app</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Legal Requirements:</Text> When required by law or to protect our rights</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Business Transfers:</Text> In connection with a merger, acquisition, or sale of assets</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">With Your Consent:</Text> When you explicitly authorize us to share your information</Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="lock-closed" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              4. Data Security
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              We implement industry-standard security measures to protect your personal information, including:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Encryption of data in transit and at rest</Text>
              <Text className="text-gray-400">• Secure authentication protocols</Text>
              <Text className="text-gray-400">• Regular security audits and updates</Text>
              <Text className="text-gray-400">• Limited access to personal data by employees</Text>
            </View>
            <Text className="text-gray-400 leading-6 mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="hand-right" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              5. Your Privacy Rights
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              Depending on your location, you may have the following rights:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• <Text className="font-semibold">Access:</Text> Request a copy of your personal data</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Correction:</Text> Request correction of inaccurate data</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Deletion:</Text> Request deletion of your personal data</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Data Portability:</Text> Receive your data in a structured format</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Opt-Out:</Text> Unsubscribe from marketing communications</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Withdraw Consent:</Text> Withdraw previously given consent</Text>
            </View>
            <Text className="text-gray-400 leading-6 mt-4">
              To exercise these rights, please contact us at MemeAresenal@proton.me
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="help-outline" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              6. Cookies and Tracking
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              We use cookies and similar tracking technologies to improve your experience:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• <Text className="font-semibold">Essential Cookies:</Text> Required for app functionality</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Analytics Cookies:</Text> Help us understand usage patterns</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Preference Cookies:</Text> Remember your settings and choices</Text>
            </View>
            <Text className="text-gray-400 leading-6 mt-4">
              You can manage cookie preferences in your device settings.
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="people" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              7. Children's Privacy
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6">
              MemeArsenal is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="globe" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              8. International Data Transfers
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="time" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              9. Data Retention
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When your data is no longer needed, we will securely delete or anonymize it.
            </Text>
          </View>
        </View>

        {/* Section 10 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="refresh" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              10. Changes to This Policy
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Continued use of MemeArsenal after changes constitutes acceptance of the updated policy.
            </Text>
          </View>
        </View>

        {/* Section 11 */}
        <View className="mb-8 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="mail" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              11. Contact Us
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
            </Text>
            <View className="bg-gray-800 dark:bg-dark-100 rounded-xl p-4 space-y-2">
        
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={handleEmailSupport}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={18} color="#AB8BFF" />
              <Text className="text-accent ml-2">MemeAresenal@proton.me</Text>
            </TouchableOpacity>
            
              {/* <View className="flex-row items-center">
                <Ionicons name="globe-outline" size={18} color="#AB8BFF" />
                <Text className="text-accent ml-2">www.memearsenal.com/privacy</Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="location-outline" size={18} color="#AB8BFF" />
                <Text className="text-accent ml-2 flex-1">
                  MemeArsenal Inc.{'\n'}123 Privacy Lane{'\n'}San Francisco, CA 94102{'\n'}United States
                </Text>
              </View> */}
            </View>
          </View>
        </View>

        {/* Footer Notice */}
        <View className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 mt-5">
          <View className="flex-row items-start">
            <Ionicons name="checkmark-circle" size={24} color="#AB8BFF" />
            <View className="ml-3 flex-1">
              <Text className="text-accent font-semibold mb-1">Your Privacy Matters</Text>
              <Text className="text-accent/80 text-sm leading-5">
                We are committed to protecting your privacy and handling your data responsibly. By using MemeArsenal, you acknowledge that you have read and understood this Privacy Policy.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const RulesContent = () => {
  const lastUpdated = "January 29, 2026";

  return (
    <ScrollView className="flex-1 bg-primary dark:bg-secondary">
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-8 mt-5">
          <View className="bg-accent/20 p-4 rounded-full mb-4">
            <Ionicons name="document-text" size={48} color="#AB8BFF" />
          </View>
          <Text className="text-textAlt dark:text-text-dark text-3xl font-bold mb-2">
            Community Guidelines
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Last Updated: {lastUpdated}
          </Text>
        </View>

        {/* Introduction */}
        <View className="mb-6 mt-5">
          <Text className="text-textAlt dark:text-text-dark text-base leading-7">
            MemeArsenal is committed to fostering a platform that respects individual liberty and free expression. These guidelines outline the boundaries necessary to maintain a legal and functional community while maximizing creative freedom.
          </Text>
        </View>

        {/* Core Principle */}
        <View className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 mt-5">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={24} color="#AB8BFF" />
            <View className="ml-3 flex-1">
              <Text className="text-accent font-semibold mb-1">Our Philosophy</Text>
              <Text className="text-accent/80 text-sm leading-5">
                We believe in minimal content moderation and maximum user autonomy. MemeArsenal operates on the principle that individuals should be free to express themselves, share content, and engage in discourse without unnecessary restriction.
              </Text>
            </View>
          </View>
        </View>

        {/* Rule 1 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-red-500/20 p-2 rounded-lg mr-3">
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              1. No Illegal Content
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              Content that violates United States federal law is strictly prohibited. This includes but is not limited to:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Child sexual abuse material (CSAM)</Text>
              <Text className="text-gray-400">• Content depicting or promoting terrorism</Text>
              <Text className="text-gray-400">• Credible, unironic true threats of violence against specific individuals</Text>
              <Text className="text-gray-400">• Copyright infringement of a commercial nature</Text>
              <Text className="text-gray-400">• Distribution of controlled substances</Text>
              <Text className="text-gray-400">• Doxxing (sharing private personal information without consent)</Text>
            </View>
            <Text className="text-gray-400 leading-6 mt-4">
              Violations will result in immediate account termination and reporting to appropriate authorities where legally required.
            </Text>
          </View>
        </View>

        {/* Rule 2 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="chatbubbles" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              2. Free Expression & Controversial Content
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              MemeArsenal does not moderate content based on political viewpoint, offense, or controversy. We recognize that satire, parody, and edgy humor are fundamental to meme culture.
            </Text>
            <View className="space-y-2 mb-4">
              <Text className="text-gray-400">• <Text className="font-semibold">Offensive speech is permitted:</Text> Content may be provocative, satirical, or offensive to some users</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Political expression is unrestricted:</Text> All political viewpoints, critiques, and commentary are allowed</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Controversial topics are not banned:</Text> Discussion of race, religion, gender, and other sensitive subjects is permitted</Text>
              <Text className="text-gray-400">• <Text className="font-semibold">Satire and parody are protected:</Text> Dark humor and provocative content are core to internet culture</Text>
            </View>
            <Text className="text-gray-400 leading-6">
              Users are responsible for their own consumption. If content offends you, utilize blocking and filtering features rather than demanding removal.
            </Text>
          </View>
        </View>

        {/* Rule 3 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="person" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              3. Personal Responsibility
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              MemeArsenal operates on the principle of individual responsibility:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• You are responsible for content you upload and share</Text>
              <Text className="text-gray-400">• You control what content you view and engage with</Text>
              <Text className="text-gray-400">• Use blocking and muting features if content bothers you</Text>
              <Text className="text-gray-400">• We are a platform, not a publisher—users create content, not MemeArsenal</Text>
            </View>
          </View>
        </View>

        {/* Rule 4 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="shield-checkmark" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              4. Respect Platform Integrity
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              While content is minimally restricted, actions that harm the platform itself are prohibited:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• No spam or automated bot activity</Text>
              <Text className="text-gray-400">• No malware, viruses, or malicious code</Text>
              <Text className="text-gray-400">• No attempts to hack, exploit, or compromise the platform</Text>
              <Text className="text-gray-400">• No impersonation of other users or entities</Text>
              <Text className="text-gray-400">• No manipulation of voting or engagement systems</Text>
            </View>
          </View>
        </View>

        {/* Rule 5 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="eye-off" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              5. Age-Restricted Content
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              Sexually explicit content and extreme violence should be marked appropriately:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Tag NSFW (Not Safe For Work) content appropriately</Text>
              <Text className="text-gray-400">• Users under 18 must not create accounts (per our Terms of Service)</Text>
              <Text className="text-gray-400">• Graphic sexual content and extreme gore should be properly labeled</Text>
            </View>
            <Text className="text-gray-400 leading-6 mt-4">
              Proper labeling allows users to make informed choices about what they view.
            </Text>
          </View>
        </View>

        {/* Rule 6 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="star" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              6. Community Self-Governance
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              MemeArsenal empowers users to shape their own experience:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Use upvote/downvote systems to surface quality content</Text>
              <Text className="text-gray-400">• Block users whose content you don't wish to see</Text>
              <Text className="text-gray-400">• Create and moderate your own folders with your own rules</Text>
              <Text className="text-gray-400">• Report only content that violates these guidelines (illegal content, spam, etc.)</Text>
            </View>
          </View>
        </View>

        {/* Rule 7 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="warning" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              7. Enforcement & Appeals
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              Enforcement is limited to clear violations of these rules:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• First violation: Warning and content removal (if illegal)</Text>
              <Text className="text-gray-400">• Repeated violations: Temporary suspension</Text>
              <Text className="text-gray-400">• Severe violations: Permanent account termination</Text>
              <Text className="text-gray-400">• You may appeal moderation decisions via support</Text>
            </View>
            <Text className="text-gray-400 leading-6 mt-4">
              We will always err on the side of preserving free expression when rules are ambiguous.
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 mt-5">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#eab308" />
            <View className="ml-3 flex-1">
              <Text className="text-yellow-400 font-semibold mb-1">Important Notice</Text>
              <Text className="text-yellow-300/80 text-sm leading-5">
                MemeArsenal is a platform for user-generated content. Views expressed by users do not represent the views of MemeArsenal Inc. We are committed to legal compliance while maximizing freedom of expression within the boundaries of U.S. law.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 mt-5">
          <View className="flex-row items-start">
            <Ionicons name="flag" size={24} color="#AB8BFF" />
            <View className="ml-3 flex-1">
              <Text className="text-accent font-semibold mb-1">Freedom First</Text>
              <Text className="text-accent/80 text-sm leading-5">
                These guidelines are designed to protect your rights while maintaining a legal, functional platform. If you value free speech and individual liberty, MemeArsenal is your home. If you prefer heavy moderation and content curation, other platforms may better suit your preferences.
              </Text>
              <Text className='text-accent/80 text-md font-bold leading-5 mt-5'>
                Yes, we are Libertarian. How did you know? 
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const UserAgreementContent = () => {
  const lastUpdated = "January 29, 2026";

    const handleEmailSupport = async () => {
    const email = 'MemeAresenal@proton.com';
    const subject = encodeURIComponent('MemeArsenal Support Request');
    const body = encodeURIComponent(
      `Hi MemeArsenal Support,%0D%0A%0D%0A` +
      `Please describe your issue here...%0D%0A%0D%0A` +
      `---%0D%0A(Sent from the MemeArsenal app)`
    );

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert(
          'Email not available',
          'We could not open your email app. Please email MemeAresenal@proton.com manually.'
        );
        return;
      }
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong trying to open your email app. Please email MemeAresenal@proton.com manually.'
      );
    }
  };


  return (
    <ScrollView className="flex-1 bg-primary dark:bg-secondary">
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-8 mt-5">
          <View className="bg-accent/20 p-4 rounded-full mb-4">
            <Ionicons name="document-text-outline" size={48} color="#AB8BFF" />
          </View>
          <Text className="text-textAlt dark:text-text-dark text-3xl font-bold mb-2">
            Terms of Service
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Last Updated: {lastUpdated}
          </Text>
        </View>

        {/* Introduction */}
        <View className="mb-6 mt-5">
          <Text className="text-textAlt dark:text-text-dark text-base leading-7">
            Welcome to MemeArsenal. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully.
          </Text>
        </View>

        {/* Important Notice */}
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 mt-5">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <View className="ml-3 flex-1">
              <Text className="text-red-400 font-semibold mb-1">Binding Agreement</Text>
              <Text className="text-red-300/80 text-sm leading-5">
                These terms constitute a legally binding agreement. If you do not agree to these terms, you must not use MemeArsenal.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="checkmark-circle" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              1. Acceptance of Terms
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              By creating an account or using MemeArsenal, you acknowledge that:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• You have read and understood these Terms of Service</Text>
              <Text className="text-gray-400">• You agree to be bound by these terms and all applicable laws</Text>
              <Text className="text-gray-400">• You are at least 18 years of age or the age of majority in your jurisdiction</Text>
              <Text className="text-gray-400">• You have the legal capacity to enter into this agreement</Text>
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="person-add" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              2. Account Registration & Eligibility
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Age Requirement
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              You must be at least 18 years old to use MemeArsenal. By registering, you represent and warrant that you meet this age requirement.
            </Text>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Account Security
            </Text>
            <Text className="text-gray-400 leading-6 mb-2">
              You are responsible for:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Maintaining the confidentiality of your account credentials</Text>
              <Text className="text-gray-400">• All activities that occur under your account</Text>
              <Text className="text-gray-400">• Notifying us immediately of any unauthorized access</Text>
              <Text className="text-gray-400">• Providing accurate and current information</Text>
            </View>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="cloud-upload" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              3. User-Generated Content
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Your Content Rights
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              You retain all ownership rights to content you upload to MemeArsenal. However, by posting content, you grant MemeArsenal:
            </Text>
            <View className="space-y-2 mb-4">
              <Text className="text-gray-400">• A worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content</Text>
              <Text className="text-gray-400">• The right to distribute your content within the platform</Text>
              <Text className="text-gray-400">• The right to create derivative works for platform functionality (e.g., thumbnails, previews)</Text>
            </View>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Your Responsibilities
            </Text>
            <Text className="text-gray-400 leading-6 mb-2">
              You represent and warrant that:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• You own or have rights to all content you upload</Text>
              <Text className="text-gray-400">• Your content does not violate any third-party rights</Text>
              <Text className="text-gray-400">• Your content complies with all applicable laws</Text>
              <Text className="text-gray-400">• You are solely responsible for your content and its consequences</Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="shield-half" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              4. Platform Role & Liability Limitations
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Section 230 Protection
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              MemeArsenal is an interactive computer service under 47 U.S.C. § 230. We are a platform, not a publisher. We do not pre-screen, monitor, or control user content. Users are solely responsible for content they create, upload, and share.
            </Text>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              No Endorsement
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              The presence of content on MemeArsenal does not constitute endorsement by MemeArsenal Inc. Views expressed by users are their own and do not represent our views.
            </Text>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Disclaimer of Warranties
            </Text>
            <Text className="text-gray-400 leading-6">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="ban" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              5. Prohibited Conduct
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              While content moderation is minimal, certain actions are strictly prohibited:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• Violating any applicable local, state, national, or international law</Text>
              <Text className="text-gray-400">• Posting illegal content (CSAM, credible threats, etc.)</Text>
              <Text className="text-gray-400">• Engaging in spam, fraud, or deceptive practices</Text>
              <Text className="text-gray-400">• Attempting to hack, compromise, or disrupt the platform</Text>
              <Text className="text-gray-400">• Impersonating others or misrepresenting your identity</Text>
              <Text className="text-gray-400">• Distributing malware or malicious code</Text>
              <Text className="text-gray-400">• Violating others' intellectual property rights on a commercial scale</Text>
            </View>
          </View>
        </View>

        {/* Section 6 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="cash" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              6. Payments & Subscriptions
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              If you purchase a subscription or make payments:
            </Text>
            <View className="space-y-2 mb-4">
              <Text className="text-gray-400">• You authorize us to charge your payment method for all fees</Text>
              <Text className="text-gray-400">• Subscriptions auto-renew unless cancelled</Text>
              <Text className="text-gray-400">• Refunds are provided at our sole discretion</Text>
              <Text className="text-gray-400">• You are responsible for all taxes associated with your purchase</Text>
            </View>
            <Text className="text-gray-400 leading-6">
              Prices are subject to change with notice. Changes apply to future billing periods.
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="close-circle" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              7. Termination
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Your Right to Terminate
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              You may terminate your account at any time by contacting support or using account settings. Termination does not entitle you to refunds for any prepaid services.
            </Text>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Our Right to Terminate
            </Text>
            <Text className="text-gray-400 leading-6 mb-2">
              We reserve the right to suspend or terminate your account if:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• You violate these Terms of Service</Text>
              <Text className="text-gray-400">• You engage in illegal activity</Text>
              <Text className="text-gray-400">• Your account poses security or legal risks</Text>
              <Text className="text-gray-400">• We are required to do so by law</Text>
            </View>
          </View>
        </View>

        {/* Section 8 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="skull" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              8. Limitation of Liability
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• MemeArsenal Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages</Text>
              <Text className="text-gray-400">• Our total liability shall not exceed the amount you paid us in the past 12 months, or $100, whichever is greater</Text>
              <Text className="text-gray-400">• We are not responsible for user-generated content or actions taken by users</Text>
              <Text className="text-gray-400">• We are not liable for any damages arising from your use or inability to use the service</Text>
            </View>
          </View>
        </View>

        {/* Section 9 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="shield-checkmark" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              9. Indemnification
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6">
              You agree to indemnify, defend, and hold harmless MemeArsenal Inc., its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from: (a) your use of the service, (b) your content, (c) your violation of these terms, or (d) your violation of any rights of another party.
            </Text>
          </View>
        </View>

        {/* Section 10 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="briefcase" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              10. Dispute Resolution & Arbitration
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Binding Arbitration
            </Text>
            <Text className="text-gray-400 leading-6 mb-4">
              Any dispute arising from these terms or your use of MemeArsenal shall be resolved through binding arbitration in accordance with the American Arbitration Association rules. You waive your right to a jury trial and to participate in class action lawsuits.
            </Text>

            <Text className="text-textAlt dark:text-text-dark font-semibold mb-2">
              Governing Law
            </Text>
            <Text className="text-gray-400 leading-6">
              These terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </Text>
          </View>
        </View>

        {/* Section 11 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="document" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              11. Intellectual Property
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              The MemeArsenal platform, including its design, features, code, and trademarks, is owned by MemeArsenal Inc. and protected by copyright, trademark, and other intellectual property laws.
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-400">• You may not copy, modify, or reverse engineer our platform</Text>
              <Text className="text-gray-400">• Our name, logo, and branding are our trademarks</Text>
              <Text className="text-gray-400">• User content remains the property of users</Text>
            </View>
          </View>
        </View>

        {/* Section 12 */}
        <View className="mb-6 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="refresh-circle" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              12. Changes to Terms
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of MemeArsenal after changes constitutes acceptance of the modified terms. Material changes will be communicated via email or in-app notification.
            </Text>
          </View>
        </View>

        {/* Section 13 */}
        <View className="mb-8 mt-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-accent/20 p-2 rounded-lg mr-3">
              <Ionicons name="mail" size={20} color="#AB8BFF" />
            </View>
            <Text className="text-textAlt dark:text-text-dark text-xl font-bold">
              13. Contact Information
            </Text>
          </View>
          
          <View className="ml-11">
            <Text className="text-gray-400 leading-6 mb-4">
              For questions about these Terms of Service, contact us:
            </Text>
            <View className="bg-gray-800 dark:bg-dark-100 rounded-xl p-4 space-y-2">
              {/* <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={18} color="#AB8BFF" />
                <Text className="text-accent ml-2">legal@memearsenal.com</Text>
              </View> */}
              {/* <View className="flex-row items-start">
                <Ionicons name="location-outline" size={18} color="#AB8BFF" />
                <Text className="text-accent ml-2 flex-1">
                  MemeArsenal Inc.{'\n'}123 Privacy Lane{'\n'}San Francisco, CA 94102{'\n'}United States
                </Text>
              </View> */}
                 <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={handleEmailSupport}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mail-outline" size={18} color="#AB8BFF" />
                    <Text className="text-accent ml-2">MemeAresenal@proton.me</Text>
                  </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer Notice */}
        <View className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 mt-5">
          <View className="flex-row items-start">
            <Ionicons name="document-text" size={24} color="#AB8BFF" />
            <View className="ml-3 flex-1">
              <Text className="text-accent font-semibold mb-1">Legal Agreement</Text>
              <Text className="text-accent/80 text-sm leading-5">
                By using MemeArsenal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. This is a legally binding contract between you and MemeArsenal Inc.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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