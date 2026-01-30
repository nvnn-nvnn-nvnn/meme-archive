import { useFolders } from "@/components/FoldersContext";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { validateUsername } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const uploadAvatarImage = async (userId: string, localUri: string): Promise<string> => {
  let ext = 'jpg';
  const lastDot = localUri.lastIndexOf('.');
  if (lastDot !== -1) {
    ext = localUri.substring(lastDot + 1).split(/[?#]/)[0].toLowerCase();
  }

  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  else if (ext === 'gif') contentType = 'image/gif';
  else if (ext === 'webp') contentType = 'image/webp';

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filePath = `${userId}/${fileName}.${ext}`;

  const isFileUri = localUri.startsWith('file://');

  let uploadBody: ArrayBuffer | Blob;

  if (isFileUri) {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });

    const arrayBuffer = decodeBase64(base64);
    uploadBody = arrayBuffer;
  } else {
    const response = await fetch(localUri);
    if (!response.ok) {
      throw new Error('Failed to fetch image for upload');
    }
    const blob = await response.blob();
    uploadBody = blob;
  }

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, uploadBody as any, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Stats Card Component
const StatsCard = ({ icon, label, value, color = "#a855f7" }: { icon: any, label: string, value: number, color?: string }) => (
  <View className='bg-gray-800/50 backdrop-blur rounded-xl p-4 flex-row items-center border border-gray-700/50'>
    <View className='bg-purple-500/20 p-3 rounded-full mr-4'>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text className='text-gray-400 text-sm'>{label}</Text>
      <Text className='text-white text-2xl font-bold'>{value}</Text>
    </View>
  </View>
);

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUserName, setTempUserName] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [bio, setBio] = useState('');
  const [refresh, setRefesh] = useState(null);

  const { user } = useAuth();
  const { folders } = useFolders();
  const { signOut } = useAuth();

  // Real-time validation for the temp username in modal
  const tempUsernameValidation = useMemo(
    () => validateUsername(tempUserName),
    [tempUserName]
  );

  const loadProfile = useCallback(async () => {
    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log('✅ User ID:', user.id);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('📊 Full data object:', data);
      console.log('📅 member_since value:', data?.member_since);
      console.log('📅 created_at value:', data?.created_at);
      console.log('📅 Type of member_since:', typeof data?.member_since);
      console.log('📅 Type of created_at:', typeof data?.created_at);

      if (error) {
        console.error('❌ Error loading profile:', error);
        return;
      }

      if (data) {
        setUserName(data.username || '');
        setProfileImage(data.avatar_url ?? null);
        setBio(data.bio || '');

        const dateString = data.member_since || data.created_at;
        console.log('🎯 Date string chosen:', dateString);
        console.log('🎯 Is dateString truthy?', !!dateString);

        if (dateString) {
          const date = new Date(dateString);
          console.log('📆 Date object:', date);
          console.log('📆 Is valid date?', !isNaN(date.getTime()));

          const formatted = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
          console.log('✨ Formatted result:', formatted);
          setMemberSince(formatted);
        } else {
          console.log('⚠️ No date string found, setting "Not set"');
          setMemberSince('Not set');
        }
      }
    } catch (e) {
      console.error('💥 Caught error:', e);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/me');
      setRefesh(await res.json());
    }
    fetchUser();
  }, []);

  console.log("All folder keys:", Object.keys(folders));
  console.log("Does Favorites exist?", folders['Favorites']);
  console.log("Favorites images:", folders['Favorites']?.images);

  const folderCount = Object.keys(folders).length

  const totalPhotos = Object.values(folders).reduce((total, folder) => {
    return total + folder.images.length
  }, 0)

  const totalFavorites = Object.values(folders).reduce((total, folder) => {
    return total + folder.images.filter(img => img.isFavorite).length
  }, 0)

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Needed", "Allow access to gallery to upload avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const localUri = result.assets[0].uri;

    setProfileImage(localUri);

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      const publicUrl = await uploadAvatarImage(user.id, localUri);

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setProfileImage(publicUrl);

      Alert.alert('Success', 'Avatar updated!');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      Alert.alert('Error', err.message || 'Failed to upload avatar');
      
      setProfileImage(null);
    }
  };

  const handleEditName = () => {
    setTempUserName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const validation = validateUsername(tempUserName);
    if (!validation.isValid) {
      Alert.alert('Error', validation.error || 'Invalid username');
      return;
    }

    if (!user) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: tempUserName })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving username:', error);
        Alert.alert('Error', 'Failed to update username');
        return;
      }

      setUserName(tempUserName);
      setIsEditingName(false);
    } catch (e) {
      console.error('Error saving username:', e);
      Alert.alert('Error', 'Failed to update username');
    }
  };

  const handleCancelEdit = () => {
    setTempUserName('');
    setIsEditingName(false);
  };

  return (
    <SafeAreaView className='bg-primary dark:bg-accent flex-1'>
      <ScrollView className='flex-1'>
        {/* Header Section with Gradient Background */}
        <View className='bg-purple-900/30 pb-8'>
          {/* Profile Image */}
          <View className='items-center pt-8'>
            <TouchableOpacity onPress={pickImage} style={styles.profileContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="person-outline" size={55} color="white" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>

            {/* Username with Edit */}
            <TouchableOpacity
              className='flex-row items-center mt-4 bg-gray-800/50 px-6 py-3 rounded-full border border-gray-700/50'
              onPress={handleEditName}
              activeOpacity={0.7}
            >
              <Text className='text-white text-xl font-bold mr-2'>
                {userName || 'Add username'}
              </Text>
              <Ionicons name="pencil" size={18} color="#a855f7" />
            </TouchableOpacity>

            {/* Member Since */}
            <Text className='text-gray-400 text-sm mt-2'>
              Member since {memberSince || 'Not Set'}
            </Text>
          </View>
        </View>

        {/* Bio Section */}
        <View className='px-6 mt-4'>
          <View className='bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50'>
            <View className='flex-row items-center mb-3'>
              <Ionicons name="document-text-outline" size={20} color="#a855f7" />
              <Text className="text-purple-400 text-base font-semibold ml-2">Biography</Text>
            </View>
            <Text className="text-gray-300 text-base leading-6">
              {bio || 'No bio yet. Add one in Settings → Profile Information.'}
            </Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View className='px-6 mt-6'>
          <Text className='text-textAlt dark:text-textDefault text-lg font-bold mb-4'>Your Statistics</Text>
          <View style={{ gap: 12 }}>
            <StatsCard 
              icon="folder" 
              label="Image Folders" 
              value={folderCount} 
            />
            <StatsCard 
              icon="images-outline" 
              label="Total Images" 
              value={totalPhotos} 
            />
            <StatsCard 
              icon="heart" 
              label="Favorites" 
              value={totalFavorites} 
              color="#ef4444"
            />
          </View>
        </View>

        {/* Logout Button */}
        <View className='px-6 mt-8 mb-6'>
          <TouchableOpacity
            onPress={signOut}
            className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex-row items-center justify-center'
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="text-red-400 font-semibold ml-2 text-base">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditingName}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text className='text-white text-xl font-bold mb-4'>Edit Username</Text>
            
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={tempUserName}
              onChangeText={setTempUserName}
              className='bg-gray-700 text-white p-4 rounded-lg mb-1 w-full'
              autoFocus={true}
            />
            
            {/* Real-time validation error */}
            {tempUserName.trim() !== '' && !tempUsernameValidation.isValid && (
              <Text className="text-red-400 text-xs mb-3 w-full">
                {tempUsernameValidation.error}
              </Text>
            )}

            <View className='flex-row justify-between w-full mt-5'>
              <TouchableOpacity
                onPress={handleCancelEdit}
                className='bg-gray-600 px-6 py-3 rounded-lg flex-1 mr-2'
              >
                <Text className='text-white text-center font-semibold'>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveName}
                className='bg-purple-500 px-6 py-3 rounded-lg flex-1 ml-2'
                disabled={!tempUsernameValidation.isValid}
                style={{ opacity: tempUsernameValidation.isValid ? 1 : 0.5 }}
              >
                <Text className='text-white text-center font-semibold'>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  profileContainer: {
    position: 'relative',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#a855f7',
  },
  placeholderContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#a855f7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
  },
});