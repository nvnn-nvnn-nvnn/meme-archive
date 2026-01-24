import FolderSelectionModal from '@/components/FolderSelectionModal';
import MemeDetailModal from '@/components/MemeDetailModal'; // Fixed typo: 'DetaiModal' → 'DetailModal'
import SearchBar from '@/components/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRedditMemes, RedditPost } from '../../utils/redditAPI';

const MEME_SOURCES = [
  { name: 'Dank Memes', subreddit: 'dankmemes', icon: '🐸' },
  { name: 'Wholesome', subreddit: 'wholesomememes', icon: '🥰' },
  { name: 'Classic', subreddit: 'memes', icon: '😱' },
  { name: 'Reaction', subreddit: 'reactionmemes', icon: '👀' },
  { name: 'Couple Memes', subreddit: 'couplememes', icon: '💑' },
  { name: 'Relationship Memes', subreddit: 'RelationshipMemes', icon: '😍' },
  { name: 'Neo-Nazi Memes', subreddit: 'ForwardsFromKlandma', icon: '⚡' },
 
];

const Discover = () => {
  // State for posts and loading
  const [selectedTab, setSelectedTab] = useState(0);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  // State for modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);

  const isSearching = subSearch.trim().length > 0;

  const memeSources = isSearching
    ? [
        ...MEME_SOURCES,
        { name: subSearch.trim(), subreddit: subSearch.trim(), icon: '\ud83d\udd0d' },
      ]
    : MEME_SOURCES;

  const safeSelectedTab = Math.min(selectedTab, memeSources.length - 1);
  const selectedSource = memeSources[safeSelectedTab];
  const selectedSubreddit = selectedSource.subreddit;

  useEffect(() => {
    if (selectedTab >= memeSources.length) {
      setSelectedTab(0);
    }
  }, [selectedTab, memeSources.length]);

  const loadMemes = useCallback(
    async (subreddit: string) => {
      console.log('Discover/loadMemes -> fetching subreddit:', subreddit);
      setLoading(true);
      const fetchedPosts = await fetchRedditMemes(subreddit, 30);
      setPosts(fetchedPosts);
      console.log('Discover/loadMemes -> posts fetched:', fetchedPosts.length);
      setLoading(false);
    },
    []
  );

  // When searching, automatically focus the search tab (last tab in the list)
  useEffect(() => {
    if (isSearching) {
      setSelectedTab(memeSources.length - 1);
    }
  }, [isSearching, memeSources.length]);

  useEffect(() => {
    loadMemes(selectedSubreddit);
  }, [loadMemes, selectedSubreddit]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMemes(selectedSubreddit);
    setRefreshing(false);
  };

  // Handlers for post interaction
  const handleMemePress = (post: RedditPost) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleSaveFromDetail = () => {
    setShowDetailModal(false);
    setShowFolderModal(true);
    setShowDetailModal(true);
  };

  const handleSaveToFolder = (post: RedditPost) => {
    setSelectedPost(post);
    setShowFolderModal(true);
  };

  const handleFolderSelect = (folderId: string) => {
    console.log(`Saving post ${selectedPost?.id} to folder ${folderId}`);
    // Save logic is handled in the modal itself
  };

  const renderMemeCard = ({ item }: { item: RedditPost }) => (
  <TouchableOpacity 
    onPress={() => handleMemePress(item)}
    activeOpacity={0.9}
  
  >
    <View className='bg-gray-800 rounded-xl overflow-hidden mx-4 mb-4 shadow-lg'>
      {/* Image */}
      <Image
        source={{ uri: item.imageUrl }}
        className='w-full aspect-[4/5]' // Better than fixed h-80 for responsiveness
        resizeMode='cover'
      />

      {/* Content */}
      <View className='p-4 pt-3'>
        {/* Title */}
        <Text 
          className='text-white font-bold text-lg mb-3' 
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Upvotes, Author, Subreddit */}
        <View className='mb-4 mx-2 mt-2'>
          <View className='flex-row items-center mb-1.5'>
            <Ionicons name="arrow-up" size={18} color="#a855f7" />
            <Text className='text-gray-300 ml-1.5 font-medium'>{item.ups}</Text>
            <Text className='text-gray-400 ml-4'>by u/{item.author}</Text>
          </View>



          <View className='flex-row items-center mb-1.5'>
            <Ionicons name='logo-reddit' size={18} color="#a855f7"/>  
            <Text className='text-gray-500 text-sm ml-2'>
              r/{selectedSubreddit}
            </Text>
          </View>
         
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleSaveToFolder(item);
          }}
          activeOpacity={0.8}
          className='bg-purple-600 px-5 py-3 flex-row items-center justify-center  rounded-tl-md rounded-br-md'
        >
          <Ionicons name="download-outline" size={20} color="white" />
          <Text className='text-white ml-2 font-semibold text-base'>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView className='bg-primary flex-1'>

      <View className="w-full px-5 pt-4 mb-4">
        <SearchBar 
          onChangeText={setSubSearch}
          value={subSearch}

        
        />
      </View>
      {/* Header with Tabs */}
      <View className='px-4 pt-2'>
        <Text className='text-white text-3xl font-bold mb-4'>Discover Memes</Text>

        {/* Tab Buttons - Horizontal Scroll */}
        <FlatList
          data={memeSources}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedTab(index)}
              style={[
                {
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: selectedTab === index ? '#a78bfa' : '#1f2937',
                  minWidth: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">
                {item.icon}{' '}
                {isSearching && index === memeSources.length - 1
                  ? `r/${item.name}`
                  : item.name}
              </Text>
            </TouchableOpacity>
          )}
          style={{ marginBottom: 16 }}
        />
      </View>

      {/* Meme Feed */}
      {loading ? (
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text className='text-gray-400 mt-4'>Loading memes...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderMemeCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a855f7"
            />
          }
          ListEmptyComponent={
            <View className='flex-1 justify-center items-center p-8'>
              <Text className='text-gray-400 text-center'>
                No memes found. Pull to refresh!
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <MemeDetailModal
        visible={showDetailModal}
        post={selectedPost}
        onClose={() => setShowDetailModal(false)}
        onSave={handleSaveFromDetail}
      />
      
      <FolderSelectionModal
        visible={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSelectFolder={handleFolderSelect}
        imageToSave={
          selectedPost 
            ? { id: selectedPost.id, imageUrl: selectedPost.imageUrl } 
            : { id: '', imageUrl: '' }
        }
      />
    </SafeAreaView>
  );
};

export default Discover;