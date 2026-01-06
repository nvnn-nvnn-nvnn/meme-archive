import { useRouter } from "expo-router";
import { Alert, FlatList, View } from "react-native"; // ← Added Alert

import { useState } from 'react';

import EmptyState from "@/components/EmptyState";
import FolderCard from "@/components/FolderCard";
import { useFolders } from "@/components/FoldersContext";
import SearchBar from "@/components/SearchBar";

export default function Index() {
  const { folders, removeFolder } = useFolders();  // ← Fixed destructuring
  const [searchQuery, setSearchQuery] = useState("");
  

  
  const folderArray = Object.keys(folders)
  .map(id => ({
    id: id,
    name: id,
    imageCount: folders[id].images.length,  // Add image count
    color: folders[id].color
  }));

  const filteredFolders = folderArray.filter(folder => 
  folder.name.toLowerCase().includes(searchQuery.toLowerCase())
);


 

  const handleDeleteFolder = (folder) => {
    Alert.alert(
      'Delete Folder?',
      `Are you sure you want to delete "${folder.name}"? All memes inside will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeFolder(folder.id);
            Alert.alert('Deleted!', 'Folder has been removed.');
          }
        }
      ]
    );
  };

  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      <FlatList
        ListHeaderComponent={
          <View className="w-full px-5 pt-4 mb-4">
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
            
            />
          </View>
        }
        data={filteredFolders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FolderCard 
            folder={item}
            folderColor={item.color}
            onLongPress={handleDeleteFolder}  // ← Added
          />
        )}
        ListEmptyComponent={<EmptyState />} 
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}