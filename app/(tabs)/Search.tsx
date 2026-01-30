import SearchUsersScreen, { UserSearchItem, Profile as SearchProfile } from '@/components/SearchUsersScreen';

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
  const [users, setUsers] = useState<SearchProfile[]>([]); // Array of searched users

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
        { id: '1', username: 'userone', avatar_url: null },
        { id: '2', username: 'usertwo', avatar_url: null },
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

  const renderUserCard = ({ item }: { item: SearchProfile }) => (
    <UserSearchItem item={item} />
  );

  return (
    <SafeAreaView className='bg-primary dark:bg-accent flex-1'>
      <View className="w-full px-5 pt-4 mb-4">
        {/* <SearchBar 
          onChangeText={setUserSearch}
          value={userSearch}
          onSubmitEditing={handleSearch} // Search on enter
        /> */}
        <SearchUsersScreen onResults={setUsers} />

      </View>

      <View className='px-4 pt-2'>
        <Text className='text-textAlt dark:text-textDefault text-3xl font-bold mb-4'>Search for Users</Text>
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Search;