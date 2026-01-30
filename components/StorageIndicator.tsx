import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { STORAGE_LIMITS, checkStorageLimit, formatBytes } from '@/utils/storageVerification';
import { useAuth } from '@/contexts/AuthContext';

export const StorageIndicator = ({ userId }: { userId: string }) => {
  const [storage, setStorage] = useState({
  used: 0,
  limit: STORAGE_LIMITS.FREE_TIER,
});
  const { user } = useAuth();

  useEffect(() => {

    if (!user) return;

    const fetchStorage = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('storage_used_bytes, storage_limit_bytes')
        .eq('id', userId)
        .single();

      if (data) {
        setStorage({
          used: data.storage_used_bytes || 0,
          limit: data.storage_limit_bytes || STORAGE_LIMITS.FREE_TIER,
        });
        console.log('StorageIndicator profile data', userId, data); 
      } else {
        setStorage({
          used: 0,
          limit: STORAGE_LIMITS.FREE_TIER,
        });
        console.log('StorageIndicator profile data', userId, data);
      }
    };

    fetchStorage();
  }, [userId]);

  const percentage =
  storage.limit > 0 ? (storage.used / storage.limit) * 100 : 0;

  return (
    <View className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <Text className="text-gray-400 text-sm mb-2">Storage Used</Text>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-lg font-bold">
          {formatBytes(storage.used)} / {formatBytes(storage.limit)}
        </Text>
        <Text className="text-gray-400 text-sm">
          {percentage.toFixed(1)}%
        </Text>
      </View>
      
      {/* Progress Bar */}
      <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <View 
          className={`h-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-purple-500'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </View>
    </View>
  );
};