import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const FolderCard = ({ folder, folderColor, onLongPress }) => {
  const router = useRouter();
  const MAX_SLOTS = 40;

  const remainingSlots = MAX_SLOTS - folder.imageCount;
  
  // Add safety checks
  if (!folder) return null;
  
  return (
    <TouchableOpacity 
      style={{ width: '48%' }}
      onPress={() => router.push({
        pathname: `/folder/${folder.id}`,
        params: { 
          name: folder.name,
        }
      })}
      onLongPress={() => onLongPress(folder)}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <View 
        className="bg-gray-800 rounded-xl justify-center items-center aspect-square"
        style={{ 
          borderWidth: 2,
          borderColor: folderColor || '#a855f7',
          backgroundColor: (folderColor || '#a855f7') + '20'
        }}
      >
        <View className="absolute top-3 right-3">
          <View 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: folderColor || '#a855f7' }}
          />
        </View>
        
        <Ionicons name="folder" size={48} color={folderColor || '#a855f7'} />
        
        <Text className="text-white text-lg mt-4 px-2 text-center" numberOfLines={2}>
          {folder.name || 'Unnamed Folder'}
        </Text>
        
        {folder.imageCount !== undefined && folder.imageCount > 0 && (
          <View className="absolute bottom-3 px-2 py-1 rounded-full bg-gray-900/80">
            <Text className="text-gray-300 text-xs">
              {remainingSlots} {remainingSlots !==1 ? 'images': 'image'} remaining!
              {/* {folder.imageCount} {folder.imageCount !== 1 ? 'images' : 'image'} */}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default FolderCard