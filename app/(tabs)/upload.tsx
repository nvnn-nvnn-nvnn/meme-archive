import { useFolders } from "@/components/FoldersContext";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Upload = () => {  // Component names should be PascalCase
  const [folderName, setFolderName] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);  // Array, not Image
  
  const { folders, addFolder, addImage } = useFolders();  // Moved here, removed duplicate

   const [selectedColor, setSelectedColor] = useState('#4ECDC4');



  const colorOptions = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#95E1D3', // Mint
    '#FCE38A', // Yellow
    '#FFD3B6', // Peach
    '#FFAAA5', // Coral
    '#A8E6CF', // Green
    '#FF8B94', // Pink
  ];

  // Pick multiple images
  const handleImagePicker = async() => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Needed", "Allow photo access to upload memes.");
        return;
      }

      // Allow MULTIPLE selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,  // ← Added this
        quality: 0.8,
      });

      if (result.canceled) return;

      // Store selected images in state
      setSelectedImages(result.assets);  // ← Save to state
      Alert.alert("Success!", `${result.assets.length} image(s) selected`);
      
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };
  

  const handleCreateFolder = () => {
    // Validation
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    if (folders[folderName]) {
      Alert.alert('Error', 'Folder already exists');
      return;
    }

    // Create folder
    addFolder(folderName, selectedColor);

    // Add images to folder if any selected
    if (selectedImages.length > 0) {
      selectedImages.forEach((asset, index) => {
        const newImage = {
          id: `img_${Date.now()}_${index}`,
          imageUrl: asset.uri,
          isFavorite: false,
        };
        addImage(folderName, newImage);
      });
    }

    // Success feedback
    Alert.alert('Success!', `Folder "${folderName}" created with ${selectedImages.length} images`);
    
    // Clear form
    setFolderName('');
    setSelectedImages([]);
    setSelectedColor('#4ECDC4');
  };




  return (
    <View className='bg-primary flex-1 p-5'>
      <Text className='text-white text-2xl font-bold mb-6'>Create New Folder</Text>

      {/* Folder Name Input */}
      <TextInput
        placeholder="Folder Name"
        placeholderTextColor="#9CA3AF"
        value={folderName}
        onChangeText={(text) => setFolderName(text)}
        className='bg-gray-800 text-white p-4 rounded-lg mb-4 '
      />


       <View className="mb-4">
        <Text className="text-white mb-2">Choose Folder Color:</Text>
        <View className="flex-row flex-wrap">
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              className="mr-3 mb-3"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedColor === color && (
                <Ionicons name="checkmark" size={24} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Show selected color */}
        <View className="flex-row items-center mt-2">
          <View 
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: selectedColor,
              marginRight: 10,
            }}
          />
          <Text className="text-white">Selected: {selectedColor}</Text>
        </View>
      </View>




      {/* Pick Images Button */}
      <TouchableOpacity 
        className='bg-accent rounded-lg p-4 mb-4 flex-row items-center justify-center'
        onPress={handleImagePicker}
      >
        <Ionicons name="images-outline" size={24} color="white" />
        <Text className='text-white font-bold ml-2'>
          Select Images ({selectedImages.length})
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity 
      className="bg">

        
      </TouchableOpacity> */}

      {/* Preview Selected Images */}
      {selectedImages.length > 0 && (
        <View className='mb-4'>
          <Text className='text-white mb-2'>Selected Images:</Text>
          <FlatList
            data={selectedImages}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item.uri }}
                className='w-20 h-20 rounded-lg mr-2'
              />
            )}
          />
        </View>
      )}

      {/* Create Folder Button */}
      <TouchableOpacity 
        className='bg-green-600 rounded-lg p-4 items-center'
        onPress={handleCreateFolder}
      >
        <Text className='text-white font-bold text-lg'>Create Folder</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Upload;