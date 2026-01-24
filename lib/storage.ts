import { supabase } from './supabase';

// Uploads a local file URI (e.g. from Expo ImagePicker) to Supabase Storage
// and returns a public URL that can be used across devices.
//
// NOTE: Make sure you have a "memes" bucket created in Supabase Storage
// and that it is configured to allow public access (or adjust this helper
// to use signed URLs instead of publicUrl if you prefer).
export async function uploadImageToSupabase(
  userId: string,
  localUri: string,
): Promise<string> {
  if (!userId) {
    throw new Error('uploadImageToSupabase: missing userId');
  }
  if (!localUri) {
    throw new Error('uploadImageToSupabase: missing localUri');
  }

  // Derive a file extension and basic content-type from the URI
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

  // Fetch the local file into a Blob that supabase-js can upload
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error(`Failed to read file from URI: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('user-content')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('user-content').getPublicUrl(filePath);
  if (!data || !data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return data.publicUrl;
}
