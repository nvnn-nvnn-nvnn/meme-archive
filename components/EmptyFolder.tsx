import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useFolders } from '../components/FoldersContext';



const EmptyFolder = ({ folderID }) => {
  const { addImage } = useFolders();

  const handleUpload = async () => {
    try {
      // 1. REQUEST PERMISSION
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Needed", "Allow photo access to upload memes.");
        return;
      }

      // 2. OPEN IMAGE PICKER
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      console.log("Picker result:", result);

      // 3. CHECK IF USER CANCELLED
      if (result.canceled) {
        console.log("User cancelled");
        return;
      }

      // 4. GET THE SELECTED IMAGE
      const selectedImage = result.assets[0];
      
      // 5. ✅ CREATE newImage object (THIS MUST COME BEFORE USING IT!)
      const newImage = {
        id: `img_${Date.now()}`, // Create unique ID
        imageUrl: selectedImage.uri, // Get URI from selected image
        isFavorite: false,
      };
      
      console.log("Created newImage:", newImage); // ✅ This is OK now

      // 6. ✅ NOW you can use newImage!
      addImage(folderID, newImage);

      Alert.alert("Success!", "Meme added to folder");
      
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View className='flex-1 justify-center items-center px-8'>
      <Text className='text-white font-bold text-center mb-8 font-bold text-lg'>
        Upload a meme to this folder to archive it!
      </Text>
      
      <TouchableOpacity 
        className='bg-accent border-2 border-accent rounded-full p-6'
        onPress={handleUpload}
      >
        <Ionicons name="cloud-upload-outline" size={64} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default EmptyFolder;