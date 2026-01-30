// SearchUsersScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase'; // adjust path

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type SearchUsersScreenProps = {
  onResults?: (results: Profile[]) => void;
};

export const UserSearchItem = ({ item }: { item: Profile }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.item}
      
      onPress={() =>
        router.push({
          pathname: '/user/[id]',
          params: { id: item.id },
        })
      }
      
    >
      <Text style={styles.username}>@{item.username}</Text>
    </TouchableOpacity>
  );
};

const SearchUsersScreen = ({ onResults }: SearchUsersScreenProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      if (onResults) {
        onResults([]);
      }
      return;
    }

    const timeout = setTimeout(() => {
      searchProfiles(query.trim());
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [query]);

  const searchProfiles = async (rawQuery: string) => {
    setLoading(true);
    const q = rawQuery.toLowerCase();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `${q}%`)
      .limit(20);

    if (error) {
      console.error('Error searching profiles:', error.message);
      setResults([]);
      if (onResults) {
        onResults([]);
      }
    } else {
      const resultsData = data ?? [];
      setResults(resultsData);
      if (onResults) {
        onResults(resultsData);
      }
    }

    setLoading(false);
  };

  const renderItem = ({ item }: { item: Profile }) => (
    <UserSearchItem item={item} />
  );

  return (
    <View className='flex-row items-center bg-gray-800 rounded-full px-5 py-4'>
      <Ionicons name="search" size={20} color="#C77DFF" />
      <TextInput
        placeholder="Search by username"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
       
        placeholderTextColor="#a8b5db"
        className='text-white ml-2 flex-1'
        
      />

      {loading && <ActivityIndicator style={{ marginTop: 8 }} />}

      {/* <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        className='text-white'
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    color: '#fff',

    
  },
  username: { fontSize: 16, color:'#fff', marginLeft: 15 },
});

export default SearchUsersScreen;