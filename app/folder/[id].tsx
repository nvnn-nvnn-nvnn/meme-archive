import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system'; // 
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import EmptyFolder from '../../components/EmptyFolder';
import { useFolders } from '../../components/FoldersContext';

// Get device screen width for responsive modal
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAX_SLOTS = 10;

const Details = () => {
  const { id, name } = useLocalSearchParams();
  
  const [selectedIndex, setSelectedIndex] = useState<number|null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [gridKey, setGridKey] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedPosition, setDraggedPosition] = useState({ x: 0, y: 0 });
  const [showShareModal, setShowShareModal] = useState(false);

  const { folders, addImage, toggleFavorite, removeImage, reorderImages } = useFolders();
  const folder = folders[id];
  const images = Array.isArray(folder) ? folder : folder?.images || [];

  // Force re-render when images change
  useEffect(() => {
    setGridKey(prev => prev + 1);
  }, [images.length]);

  // Calculate remaining slots
  const remainingSlots = MAX_SLOTS - images.length;

  // Prepare data for the grid: [add button, ...images, ...empty slots]
  const gridData = [
    // { type: 'add', key: 'add-button' },
    ...images.map((image, idx) => ({
      type: 'image',
      uri: image.imageUrl,
      id: image.id,
      isFavorite: image.isFavorite,
      key: image.id || `img-${idx}`,
    })),
    ...Array(Math.max(0, remainingSlots - 1)).fill(null).map((_, idx) => ({
      type: 'empty',
      key: `empty-${idx}`,
    })),
  ];

  // Handle adding multiple images
  const handleAddImages = async () => {
    if (remainingSlots <= 0) {
      Alert.alert('Limit reached', `You can only add up to ${MAX_SLOTS} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow photo access to upload memes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (result.canceled) return;

    const newImages = result.assets.map((asset, index) => ({
      id: `img_${Date.now()}_${index}`,
      imageUrl: asset.uri,
      isFavorite: false,
    }));

    newImages.forEach(image => {
      addImage(id, image);
    });

    if (newImages.length === 1) {
      Alert.alert('Success!', 'Meme added to folder');
    } else {
      Alert.alert('Success!', `${newImages.length} memes added to folder`);
    }
  };

  // Draggoing Functionalities




  // Handle Download for single Image

  const handleDownload =  async () => {

    try {

      const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    if (status !== 'granted') {
      Alert.alert('Error', "Access wasn't granted!" )
      return;
    }

    const imageUrl = images[currentIndex].imageUrl;

    const fileName = `meme_${Date.now()}.jpg`;

    const fileUri = FileSystem.documentDirectory + fileName;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

    Alert.alert('Success!', 'Meme saved to Photos');

  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Error', 'Failed to download meme');
  };

  };


  const handleShareOptions = async () => {

    try{

      const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      if (status !== 'granted') {
        Alert.alert('Error', "Access wasn't granted!" )
        return;
      }


    const imageUrl = images[currentIndex].imageUrl;

    const fileName = `meme_${Date.now()}.jpg`;

    const fileUri = FileSystem.documentDirectory + fileName;

    
    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }

    await Sharing.shareAsync(downloadResult.uri)

    setShowShareModal(false);

      





    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share meme');
    };

  };


  const handleCopyToClipboard = async () => {
  try {
    const imageUrl = images[currentIndex].imageUrl;
    
    await Clipboard.setStringAsync(imageUrl);
    
    Alert.alert('Copied!', 'Image link copied to clipboard');
    
    setShowShareModal(false);

  } catch (error) {
    console.error('Copy error:', error);
    Alert.alert('Error', 'Failed to copy link');
  }
};


  // Handle removing an image
  const handleRemoveImage = (imageId: string) => {
    Alert.alert(
      'Remove meme?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => {
            removeImage(id, imageId);
            Alert.alert('Removed!', 'Meme has been removed from folder.');
          }
        },
      ]
    );
  };

  // ✅ NEW: Handle reordering after drag
  const handleDragEnd = ({ data }: { data: any[] }) => {
    console.log('Drag ended. New order:', data);
    
    // Filter to get only images (not add button or empty slots)
    const imageItems = data.filter(item => item.type === 'image');
    
    // Convert back to your image format
    const reorderedImages = imageItems.map(item => ({
      id: item.id,
      imageUrl: item.uri,
      isFavorite: item.isFavorite
    }));
    
    // Save the new order to context
    reorderImages(id, reorderedImages);
    
    // Optional: Show feedback
    Alert.alert('Order Updated', 'Your memes have been reordered!');
  };

  // Handle viewing single image in modal
  const handleViewImage = (index: number) => {
    // Adjust index because first item in gridData is the add button
    const imageIndex = index - 0;
    if (imageIndex >= 0 && imageIndex < images.length) {
      setSelectedIndex(imageIndex);
      setCurrentIndex(imageIndex);
    }
  };

  // Render a grid cell
  const renderGridCell = (item: any, index: number) => {
    if (item.type === 'add') {
      return (
        <TouchableOpacity
          className="w-full h-full bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 items-center justify-center p-4"
          onPress={handleAddImages}
        >
          <Ionicons name="add-circle-outline" size={40} color="#9CA3AF" />
          <Text className="text-gray-400 text-center mt-2 text-sm">
            Add Photos ({remainingSlots} left)
          </Text>
        </TouchableOpacity>
      );
    }

    if (item.type === 'image') {
      return (
        <View className="w-full h-full relative">
          <TouchableOpacity
            className="w-full h-full"
            onPress={() => handleViewImage(index)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.uri }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          {item.isFavorite && (
            <View className="absolute top-2 left-2">
              <Ionicons name="heart" size={20} color="red" />
            </View>
          )}
          
          <TouchableOpacity
            className="absolute top-2 right-2 bg-black/70 w-7 h-7 rounded-full items-center justify-center"
            onPress={() => handleRemoveImage(item.id)}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'empty') {
      return (
        <View className="w-full h-full bg-gray-900/30 rounded-xl border border-gray-800" />
      );
    }

    return null;
  };

  // ✅ NEW: Render item for DraggableFlatList
  const renderDraggableItem = ({ item, drag, isActive }: { 
    item: any, 
    drag: () => void, 
    isActive: boolean 
  }) => {
    // Only make IMAGES draggable (not add button or empty slots)
    if (item.type === 'image') {
      return (
        <TouchableOpacity
          onLongPress={drag}  // 👈 Long press to start dragging
          delayLongPress={200} // Wait 200ms before drag starts
          disabled={isActive} // Disable while dragging
          className={`w-[31%] aspect-square mb-2 ${isActive ? 'opacity-50' : ''}`}
        >
          {renderGridCell(item, gridData.indexOf(item))}
        </TouchableOpacity>
      );
    }
    
    // Non-draggable items (add button, empty slots)
    return (
      <View className="w-[31%] aspect-square mb-2">
        {renderGridCell(item, gridData.indexOf(item))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-primary mt-5">
      {/* Header */}
      <View className="p-4">
        <Text className="text-white text-2xl font-bold">{name}</Text>
        <Text className="text-gray-400 mt-1">
          {images.length} meme{images.length !== 1 ? 's' : ''} • {remainingSlots} slots available
        </Text>
      </View>

      {/* Draggable Grid View */}
      {images.length === 0 ? (
        <EmptyFolder folderID={id} />
      ) : (
        <View className="flex-1 px-3">
          <Text className="text-gray-400 text-center mb-3">
            {/* 📱 Long press and drag to reorder */}
          </Text>
          
          {/* ✅ REPLACED: Regular View with DraggableFlatList */}
          <DraggableFlatList
            key={gridKey}
            data={gridData}
            renderItem={renderDraggableItem}  // 👈 Uses new render function
            keyExtractor={(item) => item.key}
            numColumns={3}
            onDragEnd={handleDragEnd}  // 👈 Calls when drag finishes
            activationDistance={10}  // How far to drag before activating
            dragItemOverflow={false} // Don't let dragged item overflow
            animationConfig={{ tension: 150, friction: 20 }} // Spring animation
            
            // Layout styling
            contentContainerStyle={{
              paddingBottom: 100,
              paddingHorizontal: 4,
              flexGrow: 1,
            }}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
              gap: 8,
              marginBottom: 6,
            }}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity  
            className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 active:opacity-70"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
            onPress={handleAddImages}
          >
            <View className="p-5 border-2 border-accent rounded-full bg-accent/20">
              <Ionicons name="cloud-upload-outline" size={48} color="white" />
            </View>
          </TouchableOpacity>
          
        </View>
      )}

      {/* Sticky upload button for empty folder */}
      {/* {images.length === 0 && (
        <TouchableOpacity  
          className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 active:opacity-70"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
          }}
          onPress={handleAddImages}
        >
          <View className="p-5 border-2 border-accent rounded-full bg-accent/20">
            <Ionicons name="cloud-upload-outline" size={48} color="white" />
          </View>
        </TouchableOpacity>
      )} */}

      {/* Full-Screen Modal for viewing images */}
      <Modal
        visible={selectedIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedIndex(null)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-12 right-5 z-10"
            onPress={() => setSelectedIndex(null)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedIndex || 0}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentIndex(index);
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, justifyContent: 'center' }}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', height: '80%' }}
                  resizeMode="contain"
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />

          <View className="flex-row justify-around px-8 pb-8 pt-4">
            <TouchableOpacity 
            className="items-center"
            onPress={() => setShowShareModal(true)}
            >
              <Ionicons name="share-outline" size={32} color="white" />
              <Text className="text-white text-xs mt-2">Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="items-center"
              onPress={() => toggleFavorite(id, images[currentIndex]?.id)}
            >
              <Ionicons 
                name={images[currentIndex]?.isFavorite ? "heart" : "heart-outline"} 
                size={32} 
                className=''
                color={images[currentIndex]?.isFavorite ? "red" : "white"} 
              />
              <Text className="text-white text-xs mt-2">
                {images[currentIndex]?.isFavorite ? "Unfavorite" : "Favorite"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center"
            onPress={handleDownload}
            
            >
              <Ionicons name="download-outline" size={32} color="white" />
              <Text className="text-white text-xs mt-2">Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      




      {/* Sharing Modal */}
      
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"  
      >



        <View
        className='flex-1 bg-black/70 justify-center items-center '
        
        >
          <View 
          className='bg-gray-800 p-6 rounded-2xl w-[85%] border-2 border-[#a855f7] '
          >


            <Text className='text-white text-xl font-bold mb-6 text-center'>
              Share Meme
            </Text>

            <TouchableOpacity
              onPress={handleShareOptions}
              className='bg-purple-500 p-4 rounded-lg mb-3 flex-row items-center justify-center'
            >
              <Ionicons name="share-social-outline" size={24} color="white" />
              <Text className='text-white ml-3 font-semibold text-lg'>Share Image</Text>
            </TouchableOpacity>

            {/* Copy Link Option */}
            <TouchableOpacity
              onPress={handleCopyToClipboard}
              className='bg-gray-700 p-4 rounded-lg mb-3 flex-row items-center justify-center'
            >
              <Ionicons name="copy-outline" size={24} color="white" />
              <Text className='text-white ml-3 font-semibold text-lg'>Copy Link</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowShareModal(false)}
              className='bg-gray-600 p-4 rounded-lg flex-row items-center justify-center'
            >
              <Text className='text-white font-semibold text-lg'>Cancel</Text>
            </TouchableOpacity>


          </View>


        </View>
        
      </Modal>



    </View>
  );
};

export default Details;