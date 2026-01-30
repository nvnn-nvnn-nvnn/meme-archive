import FolderCard from '@/components/FolderCard';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  member_since?: string;
  created_at?: string;
}

// Stats Card Component
const StatsCard = ({ icon, label, value, color = "#a855f7" }: { icon: any, label: string, value: number, color?: string }) => (
  <View className='bg-gray-800/50 backdrop-blur rounded-xl p-4 flex-1 border border-gray-700/50'>
    <View className='items-center'>
      <View className='bg-purple-500/20 p-3 rounded-full mb-2'>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className='text-white text-2xl font-bold'>{value}</Text>
      <Text className='text-gray-400 text-sm mt-1'>{label}</Text>
    </View>
  </View>
);

export default function UserProfileScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idParam = params.id;
  const userId = Array.isArray(idParam) ? idParam[0] : idParam;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [folders, setFolders] = useState<any[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [foldersError, setFoldersError] = useState<string | null>(null);
  const [totalImages, setTotalImages] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setError('No user id provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, member_since, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      setError(error.message);
      setProfile(null);
    } else {
      setProfile(data as Profile);
    }

    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // Fetch public folders and count images
  useEffect(() => {
    if (!userId) return;

    const fetchFolders = async () => {
      setFoldersLoading(true);
      setFoldersError(null);

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('id, name, color, is_public')
        .eq('user_id', userId)
        .eq('is_public', true);

      if (foldersError) {
        setFoldersError(foldersError.message);
        setFolders([]);
      } else {
        setFolders(foldersData || []);

        // Count total images in public folders
        if (foldersData && foldersData.length > 0) {
          const folderIds = foldersData.map(f => f.id);
          const { count } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .in('folder_id', folderIds);
          
          setTotalImages(count || 0);
        }
      }

      setFoldersLoading(false);
    };

    fetchFolders();
  }, [userId]);

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary dark:bg-accent">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-dark-100 dark:border-light-200">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mr-3 bg-gray-800/50 p-2 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-textAlt dark:text-textDefault text-xl font-bold flex-1">
          {profile ? `@${profile.username}` : 'Profile'}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {loading && (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#a855f7" />
            <Text className="text-gray-400 mt-4 text-base">Loading profile...</Text>
          </View>
        )}

        {!loading && error && (
          <View className="flex-1 justify-center items-center mt-20 px-6">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-red-400 text-center mt-4 text-lg">{error}</Text>
          </View>
        )}

        {!loading && !error && !profile && (
          <View className="flex-1 justify-center items-center mt-20 px-6">
            <Ionicons name="person-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-center mt-4 text-lg">User not found.</Text>
          </View>
        )}

        {!loading && profile && (
          <View>
            {/* Header Section with Gradient */}
            <View className='bg-purple-900/30 pb-8'>
              <View className='items-center pt-8'>
                {/* Profile Image */}
                <View className="relative mb-4">
                  {profile.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      className='w-32 h-32 rounded-full border-4 border-purple-500'
                    />
                  ) : (
                    <View className='w-32 h-32 rounded-full border-4 border-purple-500 bg-purple-500/20 items-center justify-center'>
                      <Ionicons name="person-outline" size={60} color="white" />
                    </View>
                  )}
                </View>

                {/* Username */}
                <Text className="text-white text-2xl font-bold mb-1">
                  @{profile.username}
                </Text>

                {/* Member Since */}
                <Text className='text-gray-400 text-sm'>
                  Member since {formatMemberSince(profile.member_since || profile.created_at)}
                </Text>
              </View>
            </View>

            {/* Bio Section */}
            {profile.bio && (
              <View className='px-6 mt-4'>
                <View className='bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50'>
                  <View className='flex-row items-center mb-3'>
                    <Ionicons name="document-text-outline" size={20} color="#a855f7" />
                    <Text className="text-purple-400 text-base font-semibold ml-2">Biography</Text>
                  </View>
                  <Text className="text-gray-300 text-base leading-6">
                    {profile.bio}
                  </Text>
                </View>
              </View>
            )}

            {/* Statistics Section */}
            <View className='px-6 mt-6'>
              <Text className='text-white text-lg font-bold mb-4'>Public Statistics</Text>
              <View className='flex-row gap-3'>
                <StatsCard 
                  icon="folder-open-outline" 
                  label="Public Folders" 
                  value={folders.length} 
                />
                <StatsCard 
                  icon="images-outline" 
                  label="Public Images" 
                  value={totalImages} 
                />
              </View>
            </View>

            {/* Public Folders Section */}
            <View className='px-6 mt-6'>
              <View className='flex-row items-center justify-between mb-4'>
                <Text className='text-white text-lg font-bold'>Public Folders</Text>
                {folders.length > 0 && (
                  <View className='bg-purple-500/20 px-3 py-1 rounded-full'>
                    <Text className='text-purple-400 text-sm font-semibold'>
                      {folders.length}
                    </Text>
                  </View>
                )}
              </View>

              {foldersLoading && (
                <View className="py-10">
                  <ActivityIndicator size="small" color="#a855f7" />
                </View>
              )}

              {!foldersLoading && foldersError && (
                <View className='bg-red-500/10 border border-red-500/30 rounded-xl p-4'>
                  <Text className="text-red-400 text-center">
                    Error loading folders: {foldersError}
                  </Text>
                </View>
              )}

              {!foldersLoading && folders.length === 0 && (
                <View className='bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 items-center'>
                  <Ionicons name="folder-open-outline" size={48} color="#6B7280" />
                  <Text className="text-gray-400 text-center mt-4 text-base">
                    No public folders yet
                  </Text>
                  <Text className="text-gray-500 text-center mt-2 text-sm">
                    This user hasn't shared any folders publicly
                  </Text>
                </View>
              )}

              {!foldersLoading && folders.length > 0 && (

                

                <View>

                  <FlatList
                    data={folders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <FolderCard
                        folder={item}
                        folderColor={item.color}
                        onLongPress={() => {}}
                      />
                    )}
                    
                    numColumns={2}
                    columnWrapperStyle={{ 
                      justifyContent: 'space-between',
                      paddingHorizontal: 12,
                      marginBottom: 12
                    }}
                    contentContainerStyle={{ 
                      paddingBottom: 20,
                      marginTop: 10,
                      flexGrow: 1
                    }}
                  />


                </View>



                // <View className='flex-row flex-wrap' style={{ gap: 12 }}>
                //   {folders.map((folder) => (
                //     <View key={folder.id} style={{ width: '48%' }}>
                //       <FolderCard
                //         folder={folder}
                //         folderColor={folder.color}
                //         onLongPress={() => {}}
                //       />
                //     </View>
                //   ))}
                // </View>
              )}
            </View>

            {/* Bottom Spacing */}
            <View className='h-8' />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}