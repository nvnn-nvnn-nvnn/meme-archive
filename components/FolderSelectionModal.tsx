// components/FolderSelectionModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFolders } from './FoldersContext';

interface FolderSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string) => void;
  imageToSave: { id: string; imageUrl: string };
}

const FolderSelectionModal = ({ 
  visible, 
  onClose, 
  onSelectFolder, 
  imageToSave 
}: FolderSelectionModalProps) => {

  const { folders, addImage, createFolder } = useFolders();
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Transform folders data
  const availableFolders = Object.keys(folders)
    .filter(id => id !== 'Favorites')
    .map(id => ({
      id: id,
      name: folders[id].name,
      color: folders[id].color,
      imageCount: folders[id].images.length
    }));

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    if (folders[newFolderName]){
      Alert.alert('Error','A folder with this name already exists!');
      return;
    }


    setCreatingFolder(true);
    try {
      const success = createFolder(newFolderName.trim(), '#4ECDC4');
      if (success) {
        setNewFolderName('');
        setShowCreateFolder(false);
        Alert.alert('Success!', `Folder "${newFolderName}" created`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  // Handle folder selection
  const handleSelectFolder = (folderId: string) => {
    // Check if image already exists in folder
    const folder = folders[folderId];
    if (folder && folder.images.some(img => img.id === imageToSave.id)) {
      Alert.alert(
        'Already Saved',
        'This meme is already saved in this folder.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Save the image
    addImage(folderId, {
      id: imageToSave.id,
      imageUrl: imageToSave.imageUrl,
      isFavorite: false
    });

    // Provide feedback
    Alert.alert(
      'Saved!',
      `Meme saved to "${folder.name}"`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  // Render each folder item
  const renderFolderItem = ({ item }: { item: any }) => {
    const isFull = item.imageCount >= 10;
    const isSelected = folders[item.id]?.images.some((img: any) => img.id === imageToSave.id);

    return (
      <TouchableOpacity
        onPress={() => {
          if (isFull) {
            Alert.alert(
              'Folder Full',
              'This folder has reached its limit of 10 images.',
              [{ text: 'OK' }]
            );
            return;
          }
          if (isSelected) {
            Alert.alert(
              'Already Saved',
              'This meme is already saved in this folder.',
              [{ text: 'OK' }]
            );
            return;
          }
          handleSelectFolder(item.id);
        }}
        disabled={isFull || isSelected}
        className={`p-4 mb-2 rounded-lg flex-row items-center justify-between ${
          isFull ? 'bg-gray-700 opacity-50' : isSelected ? 'bg-purple-900/30' : 'bg-gray-800'
        }`}
        activeOpacity={0.7}
      >
        {/* Left side - folder info */}
        <View className='flex-row items-center flex-1'>
          {/* Color indicator */}
          <View 
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: item.color,
              marginRight: 12
            }}
          />
          <View className='flex-1'>
            <Text className='text-white font-semibold text-base' numberOfLines={1}>
              {item.name}
            </Text>
            <Text className={`text-sm ${isFull ? 'text-red-400' : 'text-gray-400'}`}>
              {item.imageCount}/10 images
              {isSelected && ' • Already saved'}
            </Text>
          </View>
        </View>

        {/* Right side - icon */}
        <View className='ml-2'>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          ) : (
            <Ionicons 
              name={isFull ? "lock-closed" : "chevron-forward"} 
              size={20} 
              color={isFull ? "#EF4444" : "#9CA3AF"} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-2xl font-bold">
                Save to Folder
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Create Folder Section */}
            {showCreateFolder ? (
              <View className="mb-6">
                <Text className="text-white font-semibold mb-3">New Folder Name</Text>
                <View className="flex-row">
                  <TextInput
                    value={newFolderName}
                    onChangeText={setNewFolderName}
                    placeholder="Enter folder name"
                    placeholderTextColor="#6B7280"
                    className="flex-1 bg-gray-700 text-white p-3 rounded-lg mr-3"
                    autoFocus
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleCreateFolder}
                  />
                  <TouchableOpacity
                    onPress={handleCreateFolder}
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="bg-purple-500 px-4 rounded-lg items-center justify-center min-w-[80]"
                  >
                    <Text className="text-white font-semibold">
                      {creatingFolder ? 'Creating...' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setShowCreateFolder(false)}
                  className="mt-3"
                >
                  <Text className="text-gray-400 text-center">Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowCreateFolder(true)}
                className="flex-row items-center mb-6 p-4 bg-gray-800 rounded-lg"
              >
                <View className="w-10 h-10 rounded-lg bg-purple-500/20 mr-3 items-center justify-center">
                  <Ionicons name="add" size={24} color="#A855F7" />
                </View>
                <Text className="text-purple-400 text-lg font-semibold">
                  Create New Folder
                </Text>
              </TouchableOpacity>
            )}

            {/* Folder List */}
            <FlatList
              data={availableFolders}
              keyExtractor={(item) => item.id}
              renderItem={renderFolderItem}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Ionicons name="folder-open-outline" size={64} color="#4B5563" />
                  <Text className="text-gray-400 text-center mt-4 text-lg">
                    No folders yet
                  </Text>
                  <Text className="text-gray-500 text-center mt-2">
                    Create a folder to save memes!
                  </Text>
                </View>
              }
              className="max-h-[400]"
              showsVerticalScrollIndicator={false}
            />

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              className="mt-6 p-4 bg-gray-700 rounded-lg"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#6D28D9',
  },
});

export default FolderSelectionModal;