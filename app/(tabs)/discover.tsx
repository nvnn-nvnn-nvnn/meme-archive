import FolderSelectionModal from '@/components/FolderSelectionModal';
import MemeDetailModal from '@/components/MemeDetailModal';
import SearchBar from '@/components/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRedditMemes, RedditPost } from '../../utils/redditAPI';

const { width } = Dimensions.get('window');

const MEME_SOURCES = [
  { name: 'Dank Memes', subreddit: 'dankmemes', icon: '🐸', gradient: ['#a855f7', '#7c3aed'] },
  { name: 'Wholesome', subreddit: 'wholesomememes', icon: '🥰', gradient: ['#ec4899', '#db2777'] },
  { name: 'Classic', subreddit: 'memes', icon: '😱', gradient: ['#f59e0b', '#d97706'] },
  { name: 'Reaction', subreddit: 'reactiongifs', icon: '👀', gradient: ['#3b82f6', '#2563eb'] },
  { name: 'Couple Memes', subreddit: 'couplememes', icon: '💑', gradient: ['#ef4444', '#dc2626'] },
  { name: 'Relationship Memes', subreddit: 'RelationshipMemes', icon: '😍', gradient: ['#f97316', '#ea580c'] },
  { name: 'Unironic Degenerate Memes', subreddit: 'ForwardsFromKlandma', icon: '⚡', gradient: ['#4c1d95', '#000000'] },
  { name: 'OkBuddyRetard', subreddit: 'okbuddyretard', icon: '🤡', gradient: ['#ec4899', '#a855f7'] },
  { name: 'Distressing', subreddit: 'distressingmemes', icon: '🏴‍☠️', gradient: ['#ef4444', '#3b82f6'] },
  { name: 'Politics', subreddit: 'PoliticalMemes', icon: '🗳️', gradient: ['#67e8f9', '#0ea5e9'] },
  

];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Discover = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const headerSpacerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [headerHeight, 0],
    extrapolate: 'clamp',
  });

  const isSearching = subSearch.trim().length > 0;

  const memeSources = isSearching
    ? [
        ...MEME_SOURCES,
        { 
          name: subSearch.trim(), 
          subreddit: subSearch.trim(), 
          icon: '🔍',
          gradient: ['#8b5cf6', '#6d28d9']
        },
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
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const MemeCard = ({ item, index }: { item: RedditPost; index: number }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          delay: index * 40,
          useNativeDriver: true,
          friction: 9,
          tension: 40,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          delay: index * 40,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        friction: 8,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    };

    return (
      <AnimatedTouchable
        onPress={() => handleMemePress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={{
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
          opacity: fadeAnim,
        }}
      >
        <View className='mx-4 mb-5 rounded-3xl overflow-hidden bg-gray-800/50 shadow-2xl border border-gray-700/30'>
          {/* Image Container with Gradient Overlay */}
          <View className='relative'>
            <Image
              source={{ uri: item.imageUrl }}
              className='w-full aspect-[4/5]'
              resizeMode='cover'
            />
            <LinearGradient
              colors={['transparent', 'rgba(17, 24, 39, 0.6)', 'rgba(17, 24, 39, 0.95)']}
              className='absolute bottom-0 left-0 right-0 h-40'
              pointerEvents='none'
            />
            
            {/* Floating Stats Badge */}
            <View className='absolute top-4 right-4'>
              <View className='bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 flex-row items-center border border-purple-500/30'>
                <Ionicons name="arrow-up" size={14} color="#a855f7" />
                <Text className='text-purple-300 ml-1.5 font-bold text-sm'>
                  {formatNumber(item.ups)}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View className='p-5 pb-4'>
            {/* Title */}
            <Text 
              className='text-white font-bold text-xl mb-4 leading-7' 
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* Author & Subreddit Info */}
            <View className='flex-row items-center justify-between mb-4'>
              <View className='flex-row items-center flex-1'>
                <View className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 items-center justify-center mr-2.5 shadow-lg'>
                  <Text className='text-xs'>👤</Text>
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-300 text-sm font-semibold' numberOfLines={1}>
                    u/{item.author}
                  </Text>
                  <View className='flex-row items-center mt-0.5'>
                    <Ionicons name='logo-reddit' size={12} color="#a855f7"/>  
                    <Text className='text-gray-400 text-xs ml-1.5 font-medium'>
                      r/{selectedSubreddit}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleSaveToFolder(item);
              }}
              activeOpacity={0.8}
              className='overflow-hidden rounded-2xl shadow-xl'
            >
              <LinearGradient
                colors={['#a855f7', '#7c3aed', '#6d28d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className='px-6 py-4 flex-row items-center justify-center'
              >
                <Ionicons name="download-outline" size={22} color="white" />
                <Text className='text-white ml-2.5 font-bold text-base tracking-wide'>
                  Save Meme
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedTouchable>
    );
  };

  const TabButton = ({ item, index }: { item: typeof MEME_SOURCES[0]; index: number }) => {
    const isSelected = selectedTab === index;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 30,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }, []);

    return (
      <AnimatedTouchable
        onPress={() => setSelectedTab(index)}
        activeOpacity={0.8}
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }}
      >
        <View className='overflow-hidden rounded-2xl shadow-lg'>
          {isSelected ? (
            <LinearGradient
              colors={item.gradient || ['#a855f7', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className='py-3.5 px-6 min-w-[110px] items-center justify-center'
            >
              <Text className="text-white text-center font-bold text-base">
                {item.icon}{' '}
                {isSearching && index === memeSources.length - 1
                  ? `r/${item.name}`
                  : item.name}
              </Text>
            </LinearGradient>
          ) : (
            <View className='bg-gray-800/80 py-3.5 px-6 min-w-[110px] items-center justify-center border border-gray-700/50'>
              <Text className="text-gray-300 text-center font-semibold text-base">
                {item.icon}{' '}
                {isSearching && index === memeSources.length - 1
                  ? `r/${item.name}`
                  : item.name}
              </Text>
            </View>
          )}
        </View>
      </AnimatedTouchable>
    );
  };

  const SkeletonCard = ({ index }: { index: number }) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const opacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.6],
    });

    return (
      <Animated.View 
        className='bg-gray-800/50 rounded-3xl mx-4 mb-5 overflow-hidden border border-gray-700/30'
        style={{ opacity }}
      >
        <View className='w-full aspect-[4/5] bg-gray-700' />
        <View className='p-5'>
          <View className='h-6 bg-gray-700 dark:bg-gray-900 rounded-lg mb-3 w-4/5' />
          <View className='h-6 bg-gray-700 dark:bg-gray-900 rounded-lg mb-4 w-3/5' />
          <View className='h-12 bg-gray-700 dark:bg-gray-900 rounded-2xl w-full' />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className='bg-primary dark:bg-accent flex-1'>
      {/* Animated Header with Blur */}
      <Animated.View 
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <View className='bg-primary/95 dark:bg-accent/95 backdrop-blur-xl border-b border-gray-800/30 pb-2'>
          {/* Search Bar */}
          <View className="w-full px-5 pt-4 mb-3">
            <SearchBar 
              onChangeText={setSubSearch}
              value={subSearch}
            />
          </View>

          {/* Title */}
          <View className='px-5 mb-4'>
            <Text className='text-textAlt dark:text-textDefault text-4xl font-black mb-1 tracking-tight'>
              Discover
            </Text>

            <Text className='text-purple-400 text-base font-semibold'>
              Fresh memes daily 🔥
            </Text>
          </View>

          {/* Category Tabs */}
          <FlatList
            data={memeSources}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item, index }) => <TabButton item={item} index={index} />}
          />
        </View>
      </Animated.View>

      {/* Main Content */}
      {loading ? (
        <View className='flex-1 pt-64'>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </View>
      ) : (
        <Animated.FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <MemeCard item={item} index={index} />}
          ListHeaderComponent={
            <Animated.View style={{ height: headerSpacerHeight }} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a855f7"
              colors={['#a855f7', '#7c3aed']}
            />
          }
          ListEmptyComponent={
            <View className='flex-1 justify-center items-center p-8 mt-20'>
              <View className='w-32 h-32 rounded-full bg-gray-800/50 items-center justify-center mb-6 border-2 border-gray-700/50'>
                <Text className='text-7xl'>🤷</Text>
              </View>
              <Text className='text-textAlt dark:text-textDefault text-2xl font-bold mb-3'>
                No Memes Found
              </Text>

              <Text className='text-gray-400 text-center text-base leading-6 max-w-xs'>
                Pull down to refresh or try searching for a different subreddit
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