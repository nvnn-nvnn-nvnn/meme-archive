import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyFolder from '../../components/EmptyFolder';
import { useFolders } from '../../components/FoldersContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SLOTS = 10;

export default function Details() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [gridKey, setGridKey] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const { folders, addImage, toggleFavorite, removeImage, reorderImages } = useFolders();
  const folder = folders[id];
  const images = Array.isArray(folder) ? folder : folder?.images || [];

  useEffect(() => {
    setGridKey((prev) => prev + 1);
  }, [images.length]);

  const remainingSlots = MAX_SLOTS - images.length;

  const gridData = [
    ...images.map((image, idx) => ({
      type: 'image',
      uri: image.imageUrl,
      id: image.id,
      isFavorite: image.isFavorite,
      key: image.id || `img-${idx}`,
    })),
    ...Array(Math.max(0, remainingSlots)).fill(null).map((_, idx) => ({
      type: 'empty',
      key: `empty-${idx}`,
    })),
  ];

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

    newImages.forEach((image) => addImage(id, image));

    Alert.alert(
      'Success!',
      newImages.length === 1 ? 'Meme added!' : `${newImages.length} memes added!`
    );
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', "Couldn't access photo library");
        return;
      }

      const imageUrl = images[currentIndex].imageUrl;
      const fileName = `meme_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.createAssetAsync(uri);

      Alert.alert('Success!', 'Meme saved to Photos');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to save meme');
    }
  };

  const handleShareOptions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', "Couldn't access photo library");
        return;
      }

      const imageUrl = images[currentIndex].imageUrl;
      const fileName = `meme_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing not available on this device');
        return;
      }

      await Sharing.shareAsync(uri);
      setShowShareModal(false);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share meme');
    }
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

  const handleRemoveImage = (imageId: string) => {
    Alert.alert('Remove meme?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeImage(id, imageId);
          Alert.alert('Removed!', 'Meme removed from folder.');
        },
      },
    ]);
  };

  const handleDragEnd = ({ data }: { data: any[] }) => {
    const imageItems = data.filter((item) => item.type === 'image');
    const reorderedImages = imageItems.map((item) => ({
      id: item.id,
      imageUrl: item.uri,
      isFavorite: item.isFavorite,
    }));
    reorderImages(id, reorderedImages);
  };

  const handleViewImage = (index: number) => {
    setSelectedIndex(index);
    setCurrentIndex(index);
  };

  const renderGridCell = ({ item, index }: { item: any; index: number }) => {
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
      return <View className="w-full h-full bg-gray-900/30 rounded-xl border border-gray-800" />;
    }

    return null;
  };

  const renderDraggableItem = ({ item, drag, isActive }: any) => {
    return (
      <TouchableOpacity
        onLongPress={item.type === 'image' ? drag : undefined}
        delayLongPress={200}
        disabled={isActive}
        className={`w-[31%] aspect-square mb-2 ${isActive ? 'opacity-50' : ''}`}
      >
        {renderGridCell({ item, index: gridData.indexOf(item) })}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['right', 'bottom', 'left']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-white text-2xl font-bold">{name}</Text>
          <Text className="text-gray-400 mt-1">
            {images.length} meme{images.length !== 1 ? 's' : ''} • {remainingSlots} slots left
          </Text>
        </View>

        {images.length === 0 ? (
          <EmptyFolder folderID={id} />
        ) : (
          <View className="flex-1 px-3">
            <DraggableFlatList
              key={gridKey}
              data={gridData}
              renderItem={renderDraggableItem}
              keyExtractor={(item) => item.key}
              numColumns={3}
              onDragEnd={handleDragEnd}
              activationDistance={10}
              dragItemOverflow={false}
              contentContainerStyle={{
                paddingBottom: 120,
                paddingHorizontal: 4,
              }}
              columnWrapperStyle={{
                justifyContent: 'flex-start',
                gap: 8,
                marginBottom: 6,
              }}
              showsVerticalScrollIndicator={false}
            />

            {/* Floating Add Button */}
            <TouchableOpacity
              className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 active:opacity-70 z-10"
              onPress={handleAddImages}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
              }}
            >
              <View className="p-5 border-2 border-accent rounded-full bg-accent/20">
                <Ionicons name="cloud-upload-outline" size={48} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Image Viewer Modal */}
        <Modal
          visible={selectedIndex !== null}
          transparent
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
              initialScrollIndex={selectedIndex ?? 0}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
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
              <TouchableOpacity className="items-center" onPress={() => setShowShareModal(true)}>
                <Ionicons name="share-outline" size={32} color="white" />
                <Text className="text-white text-xs mt-2">Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                onPress={() => toggleFavorite(id, images[currentIndex]?.id)}
              >
                <Ionicons
                  name={images[currentIndex]?.isFavorite ? 'heart' : 'heart-outline'}
                  size={32}
                  color={images[currentIndex]?.isFavorite ? 'red' : 'white'}
                />
                <Text className="text-white text-xs mt-2">
                  {images[currentIndex]?.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="items-center" onPress={handleDownload}>
                <Ionicons name="download-outline" size={32} color="white" />
                <Text className="text-white text-xs mt-2">Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Share Options Modal */}
        <Modal visible={showShareModal} transparent animationType="slide">
          <View className="flex-1 bg-black/70 justify-center items-center">
            <View className="bg-gray-800 p-6 rounded-2xl w-[85%] border-2 border-[#a855f7]">
              <Text className="text-white text-xl font-bold mb-6 text-center">Share Meme</Text>

              <TouchableOpacity
                onPress={handleShareOptions}
                className="bg-purple-500 p-4 rounded-lg mb-3 flex-row items-center justify-center"
              >
                <Ionicons name="share-social-outline" size={24} color="white" />
                <Text className="text-white ml-3 font-semibold text-lg">Share Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyToClipboard}
                className="bg-gray-700 p-4 rounded-lg mb-3 flex-row items-center justify-center"
              >
                <Ionicons name="copy-outline" size={24} color="white" />
                <Text className="text-white ml-3 font-semibold text-lg">Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                className="bg-gray-600 p-4 rounded-lg flex-row items-center justify-center"
              >
                <Text className="text-white font-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}