import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

const SearchBar = ({ value, onChangeText }) => {
  return (
    <View className='flex-row items-center bg-gray-800 rounded-full px-5 py-4'>
      <Ionicons name="search" size={20} color="#C77DFF" />
      <TextInput
        placeholder='Search folders...'
        placeholderTextColor="#a8b5db"
        className='flex-1 ml-2 text-white'
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
};

export default SearchBar;