import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


import EmptyState from "@/components/EmptyState";
import FolderCard from "@/components/FolderCard";
import { useFolders } from "@/components/FoldersContext";
import SearchBar from "@/components/SearchBar";


export default function Index() {
  const { folders, removeFolder, addFolderColor, changeName } = useFolders();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [tempFolderName, setTempFolderName] = useState('');
  const [tempFolderColor, setTempFolderColor] = useState('');

 
  const colorOptions = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#95E1D3', // Mint
    '#FCE38A', // Yellow
    '#FFD3B6', // Peach
    '#FFAAA5', // Coral
    '#A8E6CF', // Green
    '#FF8B94', // Pink
    "#a855f7"
  ];

  const folderArray = Object.keys(folders)
    // .filter(id => id !== 'Favorites')
    .map(id => ({
      id: id,
      name: folders[id].name,
      imageCount: folders[id].images.length,
      color: folders[id].color
    }));

  const filteredFolders = folderArray.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFolderSettings = (folder) => {
    setSelectedFolder(folder);
    setTempFolderName(folder.name);
    setTempFolderColor(folder.color);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    if (!selectedFolder) return;


    const nameChanged = tempFolderName !== selectedFolder.name;
    const colorChanged = tempFolderColor !== selectedFolder.color;

    if (nameChanged) {
    if (!tempFolderName.trim()) {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }

      // Check if new name already exists (and it's not the current folder)
    if (folders[tempFolderName] && tempFolderName !== selectedFolder.id) {
      Alert.alert('Error', 'A folder with this name already exists');
      return;
    }

    changeName(selectedFolder.id, tempFolderName);
  };


    // Update folder color
    addFolderColor(selectedFolder.id, tempFolderColor);

    Alert.alert('Success!', 'Folder settings updated!');
    setShowSettingsModal(false);
  };

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
            onLongPress={() => handleFolderSettings(item)}
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
      
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text className='text-white text-2xl font-bold mb-4'>
              Folder Settings
            </Text>

            {/* Folder Name Input */}
            <View className='w-full mb-4'>
              <Text className='text-gray-400 text-sm mb-2'>Folder Name</Text>
              <TextInput
                placeholder="Folder Name"
                placeholderTextColor="#9CA3AF"
                value={tempFolderName}
                onChangeText={setTempFolderName}
                className='bg-gray-700 text-white p-4 rounded-lg'
              />
            </View>

            {/* Color Picker */}
            <View className='w-full mb-4'>
              <Text className='text-gray-400 text-sm mb-2'>Folder Color</Text>
              <View className='flex-row flex-wrap'>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setTempFolderColor(color)}
                    className='mr-3 mb-3'
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: color,
                      borderWidth: tempFolderColor === color ? 3 : 0,
                      borderColor: 'white',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tempFolderColor === color && (
                      <Ionicons name="checkmark" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
              
         

         
            <View className='flex-row justify-between w-full mb-3'>
              {/* Save Folder to Phone */}

              <TouchableOpacity
              // onPress={}
              className='bg-yellow-600 px-6 py-3 rounded-lg flex-1 mr-2'
              >
              <Text className='text-white text-center font-bold'>
                Save Folder to Phone
              </Text>

            </TouchableOpacity>

               {/* Export Folder Files */}
            <TouchableOpacity
              // onPress={}
              className='bg-green-600 px-6 py-3 rounded-lg flex-1 ml-2'
            >
              <Text className='text-white text-center font-bold'>
                Share Folder
              </Text>

            </TouchableOpacity>


            </View>
           

            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => {
                setShowSettingsModal(false);
                handleDeleteFolder(selectedFolder);
              }}
              className='bg-red-600 rounded-lg p-4 w-full mb-3 '
            >
              <Text className='text-white text-center font-bold'>
                Delete Folder
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className='flex-row justify-between w-full'>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                className='bg-gray-600 px-6 py-3 rounded-lg flex-1 mr-2'
              >
                <Text className='text-white text-center font-semibold'>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveSettings}
                className='bg-purple-500 px-6 py-3 rounded-lg flex-1 ml-2'
              >
                <Text className='text-white text-center font-semibold'>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
});