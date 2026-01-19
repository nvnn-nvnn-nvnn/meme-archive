import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const EmptyState = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-white font-bold text-center mb-8 text-lg">
        Upload and create a new folder to organize your memes!
      </Text>

      <TouchableOpacity
        className="bg-accent border-2 border-accent rounded-full p-6"
        onPress={() => router.push('/(tabs)/upload')}
        activeOpacity={0.7} // ← nice touch
      >
        <Ionicons name="add-circle-outline" size={55} color="white" />
      </TouchableOpacity>

      <Text className="text-gray-400 text-center mt-4">
        Tap to create your first folder
      </Text>
    </View>
  );
};

export default EmptyState;