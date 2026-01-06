import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const FolderCard = ({ folder, folderColor, onLongPress }) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={{ width: '48%' }}
      onPress={() => router.push({
        pathname: `/folder/${folder.id}`,
        params: { 
          name: folder.name,
          // You can add more data here later
        }
      })}
      onLongPress={() => onLongPress(folder)}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      {/* 👇 FIXED: Use inline style for dynamic color */}
      <View 
        className="bg-gray-800 rounded-xl justify-center items-center aspect-square"
        style={{ 
          borderWidth: 2,
          borderColor: folderColor, // 👈 Dynamic color from props
          backgroundColor: folderColor + '20' // 20 = 12% opacity
        }}
      >
        {/* Optional: Add color indicator dot */}
        <View className="absolute top-3 right-3">
          <View 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: folderColor }}
          />
        </View>
        
        <Ionicons name="folder" size={48} color={folderColor} /> {/* 👈 Use color for icon too */}
        
        <Text className="text-white text-lg mt-4 px-2 text-center" numberOfLines={2}>
          {folder.name}
        </Text>
        
        {/* Optional: Image count badge */}
        {folder.imageCount > 0 && (
          <View className="absolute bottom-3 px-2 py-1 rounded-full bg-gray-900/80">
            <Text className="text-gray-300 text-xs">
              {folder.imageCount} image{folder.imageCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default FolderCard