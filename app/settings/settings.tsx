import SearchBar from '@/components/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // ← Added this!
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Data Structure ───────────────────────────────────────────────
interface SettingsItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const settingsData: SettingsSection[] = [
  {
    title: 'Account Settings',
    items: [
      { id: 'profile', title: 'Profile Information', icon: 'person-outline' },
      { id: 'email', title: 'Email', icon: 'mail-outline' },
      { id: 'password', title: 'Change Password', icon: 'key-outline' },
      { id: 'cloud', title: 'Cloud Information', icon: 'cloud-outline' },
    ],
  },
  {
    title: 'Billing Settings',
    items: [
      { id: 'financial', title: 'Financial Information', icon: 'card-outline' },
      { id: 'subscriptions', title: 'Subscriptions', icon: 'calendar-outline' },
      { id: 'receipts', title: 'Receipts & Documentation', icon: 'receipt-outline' },
    ],
  },
  {
    title: 'App Settings',
    items: [
      { id: 'appearance', title: 'Appearance', icon: 'color-fill-outline' },
      { id: 'accessibility', title: 'Accessibility', icon: 'accessibility-outline' },
      { id: 'language', title: 'Language', icon: 'language-outline' },
      { id: 'notifications', title: 'Notifications', icon: 'notifications-outline' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'support', title: 'Support', icon: 'help-outline' },
      { id: 'acknowledgements', title: 'Acknowledgements', icon: 'heart-outline' },
    ],
  },
  {
    title: 'Credits',
    items: [{ id: 'credits', title: 'Credits', icon: 'newspaper-outline' }],
  },
];

// ── Simple placeholder modal contents ─────────────────────────────
const EmailModalContent = ({ onClose }: { onClose: () => void }) => (
  <View>
    <Text className="text-white text-xl font-bold mb-4">Change Email</Text>
    <Text className="text-gray-300 mb-6">
      Current email: example@domain.com
    </Text>
    {/* Add input fields, validation, etc. later */}
    <TouchableOpacity
      onPress={onClose}
      className="bg-purple-600 py-3 rounded-lg items-center"
    >
      <Text className="text-white font-semibold">Save Changes</Text>
    </TouchableOpacity>
  </View>
);

const AppearanceModalContent = ({ onClose }: { onClose: () => void }) => (
  <View>
    <Text className="text-white text-xl font-bold mb-4">Appearance</Text>
    <Text className="text-gray-300">Choose theme: Light / Dark / System</Text>
    {/* Toggle buttons or picker */}
    <TouchableOpacity onPress={onClose} className="mt-6">
      <Text className="text-purple-400 text-center">Close</Text>
    </TouchableOpacity>
  </View>
);

// ── Component ────────────────────────────────────────────────────
export default function Settings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const query = searchQuery.trim().toLowerCase();

  const filteredSettings = settingsData
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.title.toLowerCase().includes(query)
      ),
    }))
    .filter(section => section.items.length > 0);

  const handleItemPress = (item: SettingsItem) => {
    const modalItems = ['email', 'appearance', 'language', 'accessibility'];

    if (modalItems.includes(item.id)) {
      setModalType(item.id);
      setModalVisible(true);
    } else {
      // Navigate to dynamic detail screen
      router.push({
        pathname: `/settings/${item.id}`,
        params: { title: item.title },
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-5 pt-4 mb-4">
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Settings
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        
        />
      </View>

      <ScrollView className="flex-1 px-5">
        {filteredSettings.length === 0 && query ? (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-gray-400 text-lg">
              No settings found for {searchQuery}
            </Text>
          </View>
        ) : (
          filteredSettings.map(section => (
            <View key={section.title} className="mb-6">
              <Text className="text-gray-400 text-lg font-semibold mb-3 px-2">
                {section.title}
              </Text>

              <View className="bg-gray-800 rounded-lg overflow-hidden">
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    className={`p-4 flex-row items-center justify-between ${
                      index < section.items.length - 1 ? 'border-b border-gray-700' : ''
                    }`}
                    onPress={() => handleItemPress(item)} // ← Fixed: now using handler
                  >
                    <View className="flex-row items-center">
                      <Ionicons name={item.icon} size={24} color="#a855f7" />
                      <Text className="text-white ml-3">{item.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dynamic Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md border border-gray-700">
            {modalType === 'email' && <EmailModalContent onClose={closeModal} />}
            {modalType === 'appearance' && (
              <AppearanceModalContent onClose={closeModal} />
            )}
            {modalType === 'language' && (
              <Text className="text-white text-lg">Language selector coming soon</Text>
            )}
            {modalType === 'accessibility' && (
              <Text className="text-white text-lg">Accessibility options</Text>
            )}

            {/* Common close button if content doesn't have one */}
            {!['email', 'appearance'].includes(modalType || '') && (
              <TouchableOpacity
                onPress={closeModal}
                className="mt-6 bg-purple-600/30 py-3 rounded-lg"
              >
                <Text className="text-purple-300 text-center font-medium">
                  Close
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});