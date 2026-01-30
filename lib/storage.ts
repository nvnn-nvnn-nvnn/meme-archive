import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { STORAGE_LIMITS, checkStorageLimit, formatBytes } from '@/utils/storageVerification';

// Uploads a local file URI (e.g. from Expo ImagePicker) to Supabase Storage
// and returns a public URL that can be used across devices.
// This version also:
// - Measures the file size
// - Checks the user's storage limits via storageVerification
// - Returns both the public URL and file size

export async function uploadImageToSupabase(
  userId: string,
  localUri: string,
): Promise<{ publicUrl: string; fileSize: number }> {
  if (!userId) {
    throw new Error('uploadImageToSupabase: missing userId');
  }
  if (!localUri) {
    throw new Error('uploadImageToSupabase: missing localUri');
  }

  try {
    // 1) Try to get file size for storage checks
    let fileSize = 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri as any);
      const info: any = fileInfo;
      if (info && typeof info.size === 'number') {
        fileSize = info.size;
      }
    } catch (infoError) {
      console.warn('[UPLOAD] Failed to get file info for size check', infoError);
    }

    // 2) If we have a size, enforce storage limits
    if (fileSize > 0) {
      const storageCheck = await checkStorageLimit(userId, fileSize);
      if (!storageCheck.allowed) {
        const reason = storageCheck.reason || 'Storage limit exceeded';
        const used = storageCheck.currentUsage ?? 0;
        const limit = storageCheck.limit ?? STORAGE_LIMITS.FREE_TIER;
        const message = `${reason}. Using ${formatBytes(used)} of ${formatBytes(limit)}.`;
        throw new Error(message);
      }
    }

    // 3) Derive a file extension and basic content-type from the URI
    let ext = 'jpg';
    const lastDot = localUri.lastIndexOf('.');
    if (lastDot !== -1) {
      ext = localUri.substring(lastDot + 1).split(/[?#]/)[0].toLowerCase();
    }

    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filePath = `${userId}/${fileName}.${ext}`;

    console.log('[UPLOAD] Starting upload', {
      userId,
      localUri,
      bucket: 'user-images',
      filePath,
      contentType,
      fileSizeBytes: fileSize,
    });

    let uploadBody: ArrayBuffer | Blob;

    if (localUri.startsWith('file://')) {
      console.log('[UPLOAD] Reading file with FileSystem.readAsStringAsync (base64)');
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        // Use literal string to avoid type issues with EncodingType in some setups
        encoding: 'base64' as any,
      });
      console.log('[UPLOAD] Base64 length:', base64.length);

      const arrayBuffer = decode(base64);
      console.log('[UPLOAD] ArrayBuffer byteLength:', arrayBuffer.byteLength);
      uploadBody = arrayBuffer;
    } else {
      // Fallback for non-file URIs (e.g. web/http)
      console.log('[UPLOAD] Fetching local URI with fetch (non-file URI)');
      const response = await fetch(localUri);
      console.log('[UPLOAD] Fetch response', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`Failed to read file from URI: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      // size may not exist in all environments, but log if present
      const blobSize = (blob as any)?.size ?? 'unknown';
      console.log('[UPLOAD] Blob created from non-file URI, size:', blobSize);
      uploadBody = blob as any;
    }

    console.log('[UPLOAD] Uploading to Supabase Storage');
    const { data: uploadData, error } = await supabase.storage
      .from('user-images')
      .upload(filePath, uploadBody as any, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (error) {
      console.error('[UPLOAD] Supabase upload error', error);
      throw error;
    }
    console.log('[UPLOAD] Upload successful', uploadData);

    const { data } = supabase.storage.from('user-images').getPublicUrl(filePath);
    console.log('[UPLOAD] getPublicUrl result', data);
    if (!data || !data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('[UPLOAD] Completed successfully, publicUrl:', data.publicUrl);
    return { publicUrl: data.publicUrl, fileSize };
  } catch (err) {
    console.error('[UPLOAD] Fatal error during uploadImageToSupabase', err);
    throw err;
  }
}
