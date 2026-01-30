import { supabase } from '@/lib/supabase';

// utils/storage.ts
export const STORAGE_LIMITS = {
  FREE_TIER: 100 * 1024 * 1024, // 100MB
  PREMIUM_TIER: 1024 * 1024 * 1024, // 1GB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB per file
};

export const checkStorageLimit = async (userId: string, fileSize: number): Promise<{
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}> => {
  // Get user's current storage usage
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('storage_used_bytes, storage_limit_bytes')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { allowed: false, reason: 'Failed to check storage' };
  }

  const currentUsage = profile.storage_used_bytes || 0;
  const limit = profile.storage_limit_bytes || STORAGE_LIMITS.FREE_TIER;

  // Check if file is too large
  if (fileSize > STORAGE_LIMITS.MAX_FILE_SIZE) {
    return {
      allowed: false,
      reason: `File too large. Max size is ${STORAGE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      currentUsage,
      limit,
    };
  }

  // Check if adding this file would exceed limit
  if (currentUsage + fileSize > limit) {
    return {
      allowed: false,
      reason: 'Storage limit exceeded',
      currentUsage,
      limit,
    };
  }

  return { allowed: true, currentUsage, limit };
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};