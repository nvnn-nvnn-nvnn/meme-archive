import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

const MemeCard = ({ meme, onPress }) => {
  return (
    <TouchableOpacity 
      style={{ width: '31%' }}
      onPress={() => onPress(meme)}
      className="mb-3 "
    >
      <Image
        source={{ uri: meme.imageUrl }}
        className="w-full aspect-square rounded-lg bg-gray-700"
        resizeMode="cover"
      />
    </TouchableOpacity>
    

    
  );
};

export default MemeCard;