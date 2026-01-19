import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsDetail() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();

  const renderContent = () => {
    switch (id) {
      case 'profile':
        return <ProfileContent />;
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

const ProfileContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Profile Information
    </Text>
    
    <View className="mb-4">
      <Text className="text-gray-400 mb-2">Full Name</Text>
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
        placeholder="Enter username"
        placeholderTextColor="#6B7280"
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

const PasswordContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      Change Password
    </Text>

    <View className="mb-4">
      <Text className="text-gray-400 mb-2">Current Password</Text>
      <TextInput
        className="bg-gray-800 text-white p-3 rounded-lg"
        placeholder="Enter current password"
        placeholderTextColor="#6B7280"
        secureTextEntry
      />
    </View>

    <View className="mb-4">
      <Text className="text-gray-400 mb-2">New Password</Text>
      <TextInput
        className="bg-gray-800 text-white p-3 rounded-lg"
        placeholder="Enter new password"
        placeholderTextColor="#6B7280"
        secureTextEntry
      />
    </View>

    <View className="mb-4">
      <Text className="text-gray-400 mb-2">Confirm New Password</Text>
      <TextInput
        className="bg-gray-800 text-white p-3 rounded-lg"
        placeholder="Confirm new password"
        placeholderTextColor="#6B7280"
        secureTextEntry
      />
    </View>

    <TouchableOpacity className="bg-purple-600 py-3 rounded-lg mt-4">
      <Text className="text-white font-semibold text-center">
        Update Password
      </Text>
    </TouchableOpacity>
  </View>
);

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

const CreditsContent = () => (
  <View>
    <Text className="text-white text-lg font-semibold mb-4">
      App Credits
    </Text>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Development Team</Text>
      <Text className="text-gray-400">Built with ❤️ by your team</Text>
    </View>

    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-white font-semibold mb-2">Version</Text>
      <Text className="text-gray-400">1.0.0</Text>
    </View>

    <View className="bg-gray-800 rounded-lg p-4">
      <Text className="text-white font-semibold mb-2">Special Thanks</Text>
      <Text className="text-gray-400">
        Thank you to all our users and contributors
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