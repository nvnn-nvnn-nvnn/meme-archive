import { useFolders } from "@/components/FoldersContext";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const Profile = () => {

  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUserName, setTempUserName] = useState('');


  const { folders } = useFolders()

    console.log("All folder keys:", Object.keys(folders));
  console.log("Does Favorites exist?", folders['Favorites']);
  console.log("Favorites images:", folders['Favorites']?.images);

  const folderCount = Object.keys(folders).length

  const totalPhotos = Object.values(folders).reduce((total, folder) => {
  return total + folder.images.length
}, 0)

  const totalFavorites = Object.values(folders).reduce((total, folder) => {
    return total + folder.images.filter(img => img.isFavorite).length
  }, 0)

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access gallery is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleEditName = () => {
    setTempUserName(userName); // Load current name into temp
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setUserName(tempUserName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempUserName('');
    setIsEditingName(false);
  };


   return (
    <SafeAreaView className='bg-primary flex-1'>
      <ScrollView
        className='flex-1'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className='flex-1 items-center justify-center border-2 border-purple-500 rounded-lg'>
          <TouchableOpacity onPress={pickImage} style={styles.profileContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="person-outline" size={55} color="white" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text className='text-white mt-2 text-lg font-bold'>Profile Information</Text>

          <View className='bg-gray-800 rounded-lg p-4 mt-4 w-4/5'>
            <Text className='text-gray-400 text-xs mb-1'>Username</Text>
            
            <TouchableOpacity
              className='flex-row justify-between items-center'
              onPress={handleEditName}
            >
              <Text className='text-white text-lg font-semibold'>
                {userName || 'Tap to add name'}
              </Text>
              <Ionicons name="pencil" size={20} color="#a855f7" />
            </TouchableOpacity>
          </View>
          
         
          {/* Edit Name Modal */}
          <Modal
            visible={isEditingName}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text className='text-white text-xl font-bold mb-4'>Edit Username</Text>
                
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  value={tempUserName}
                  onChangeText={setTempUserName}
                  className='bg-gray-700 text-white p-4 rounded-lg mb-4 w-full'
                  autoFocus={true}
                />

                <View className='flex-row justify-between w-full'>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className='bg-gray-600 px-6 py-3 rounded-lg flex-1 mr-2'
                  >
                    <Text className='text-white text-center font-semibold'>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveName}
                    className='bg-purple-500 px-6 py-3 rounded-lg flex-1 ml-2'
                  >
                    <Text className='text-white text-center font-semibold'>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Member Since */}
           <View className='mt-5 items-center'>
            <Text className='text-white text-lg'>Member Since:</Text>
            <Text className='text-[#a855f7] font-bold'>October 2025</Text>
          </View>

          <View className='mt-2  border-purple-500 rounded-lg items-center'>
            <Text className='text-white text-lg'>
             
              You have <Text className='text-purple-500 font-bold'>{folderCount}</Text> Image Folders {' '}
              
             <Ionicons  name="folder" size={20} color="#a855f7" style={{ marginLeft: 8 }} />  
            </Text>
            <Text className='text-white text-lg mt-2'>
             
              You have <Text className='text-purple-500 font-bold'>{totalPhotos}</Text> Total Images {' '}
              
             <Ionicons  name="images-outline" size={20} color="#a855f7" style={{ marginLeft: 8 }} />  
            </Text>


            <Text className='text-white text-lg mt-2'>
             
              You have <Text className='text-purple-500 font-bold'>{totalFavorites}</Text> Total Favorite Images {' '}
              
             <Ionicons  name="heart-outline" size={20} color="#a855f7" style={{ marginLeft: 8 }} />  
            </Text>
          </View>
        {/* Favorites Folder */}
          {/* <View className='mt-4 w-4/5'>
            <Text className='text-white text-lg font-bold mb-2'>⭐ Your Favorites</Text>
            
            {folders['Favorites'] ? (
              <TouchableOpacity className='bg-gray-800 p-4 rounded-lg flex-row justify-between items-center'>
                <View>
                  <Text className='text-white font-bold text-lg'>Favorites</Text>
                  <Text className='text-gray-400'>{folders['Favorites'].images.length} images</Text>
                </View>
                <Ionicons name="heart" size={24} color="#a855f7" />
              </TouchableOpacity>
            ) : (
              <View className='bg-gray-800 p-4 rounded-lg'>
                <Text className='text-gray-400'>No favorites yet. Start favoriting images!</Text>
              </View>
            )}
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  profileContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  placeholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#a855f7',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#a855f7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
  },
})