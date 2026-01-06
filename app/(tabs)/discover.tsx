import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRedditMemes, RedditPost } from '../../utils/redditAPI';

const MEME_SOURCES = [
  { name: 'Dank Memes', subreddit: 'dankmemes', icon: '🔥' },
  { name: 'Wholesome', subreddit: 'wholesomememes', icon: '💖' },
  { name: 'Classic', subreddit: 'memes', icon: '😂' },
  { name: 'Reaction', subreddit: 'reactionmemes', icon: '卐'}
];

const Discover = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load memes when tab changes
  useEffect(() => {
    loadMemes();
  }, [selectedTab]);

  const loadMemes = async () => {
    setLoading(true);
    const subreddit = MEME_SOURCES[selectedTab].subreddit;
    const fetchedPosts = await fetchRedditMemes(subreddit, 25);
    setPosts(fetchedPosts);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMemes();
    setRefreshing(false);
  };

  const handleSaveToFolder = (post: RedditPost) => {
    // TODO: Show modal to select folder and save image
    console.log('Save to folder:', post.title);
  };

  const renderMemeCard = ({ item }: { item: RedditPost }) => (
    <View className='bg-gray-800 rounded-lg mb-4 mx-4 overflow-hidden'>
      {/* Image */}
      <Image
        source={{ uri: item.imageUrl }}
        className='w-full h-80'
        resizeMode='cover'
      />

      {/* Info Section */}
      <View className='p-4'>
        <Text className='text-white font-bold text-base mb-2' numberOfLines={2}>
          {item.title}
        </Text>

        <View className='flex-row justify-between items-center'>
          <View className='flex-row items-center'>
            <Ionicons name="arrow-up" size={16} color="#a855f7" />
            <Text className='text-gray-400 ml-1'>{item.ups}</Text>
            <Text className='text-gray-500 ml-3'>by u/{item.author}</Text>
          </View>

          <TouchableOpacity
            onPress={() => handleSaveToFolder(item)}
            className='bg-purple-500 px-4 py-2 rounded-lg flex-row items-center'
          >
            <Ionicons name="download-outline" size={18} color="white" />
            <Text className='text-white ml-1 font-semibold'>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className='bg-primary flex-1'>
      {/* Header with Tabs */}
      <View className='px-4 pt-4'>
        <Text className='text-white text-3xl font-bold mb-4'>Discover Memes</Text>

        {/* Tab Buttons */}
        <View className='flex-row mb-4'>
          {MEME_SOURCES.map((source, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedTab(index)}
              className={`flex-1 py-3 rounded-lg mr-2 ${
                selectedTab === index ? 'bg-purple-500' : 'bg-gray-800'
              }`}
            >
              <Text className='text-white text-center font-semibold'>
                {source.icon} {source.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    </SafeAreaView>
  );
};

export default Discover;