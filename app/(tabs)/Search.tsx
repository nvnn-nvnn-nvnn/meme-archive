import SearchBar from '@/components/SearchBar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]); // Array of searched users
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // TODO: Call X User Search tool or API here
      // Example: const results = await xUserSearch(userSearch, 10);
      // setUsers(results);
      // For barebones, use placeholder data
      setUsers([
        { id: '1', name: 'User One', handle: '@userone', followers: 1000, bio: 'Bio here' },
        { id: '2', name: 'User Two', handle: '@usertwo', followers: 500, bio: 'Another bio' },
      ]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => console.log('View user profile:', item.handle)}
      className='bg-gray-800 rounded-xl p-4 mb-4 flex-row items-center'
    >
      <View className='w-12 h-12 rounded-full bg-purple-600 mr-4' /> {/* Placeholder avatar */}
      <View className='flex-1'>
        <Text className='text-white font-bold text-lg'>{item.name}</Text>
        <Text className='text-gray-400'>{item.handle}</Text>
        <Text className='text-gray-500 mt-1' numberOfLines={2}>{item.bio}</Text>
      </View>
      <Text className='text-gray-400'>{item.followers} followers</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className='bg-primary flex-1'>
      <View className="w-full px-5 pt-4 mb-4">
        <SearchBar 
          onChangeText={setUserSearch}
          value={userSearch}
          onSubmitEditing={handleSearch} // Search on enter
        />
      </View>

      <View className='px-4 pt-2'>
        <Text className='text-white text-3xl font-bold mb-4'>Search for Users</Text>
      </View>

      {loading ? (
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text className='text-gray-400 mt-4'>Searching users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a855f7"
            />
          }
          ListEmptyComponent={
            <View className='flex-1 justify-center items-center p-8'>
              <Text className='text-gray-400 text-center'>
                No users found. Try searching!
              </Text>
            </View>
          }
          showsVerrticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Search;