import supabase from '../config/supabaseClients';

// ============================================
// PROFILE OPERATIONS
// ============================================

export const profileService = {
  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create or update profile
  async upsertProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update profile image
  async updateProfileImage(userId, imageUri) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        profile_image_url: imageUri,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================
// FOLDER OPERATIONS
// ============================================

export const folderService = {
  // Get all folders for a user
  async getFolders(userId) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create a new folder
  async createFolder(userId, folderName, color = '#a855f7') {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        name: folderName,
        color: color
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update folder
  async updateFolder(folderId, updates) {
    const { data, error } = await supabase
      .from('folders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete folder
  async deleteFolder(folderId) {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);
    
    if (error) throw error;
  },

  // Rename folder
  async renameFolder(folderId, newName) {
    return await this.updateFolder(folderId, { name: newName });
  },

  // Change folder color
  async changeFolderColor(folderId, newColor) {
    return await this.updateFolder(folderId, { color: newColor });
  },
};

// ============================================
// IMAGE OPERATIONS
// ============================================

export const imageService = {
  // Get all images for a folder
  async getImagesInFolder(folderId) {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all favorite images for a user
  async getFavoriteImages(userId) {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Add image to folder
  async addImage(userId, folderId, imageUri, isFavorite = false) {
    const { data, error } = await supabase
      .from('images')
      .insert({
        user_id: userId,
        folder_id: folderId,
        uri: imageUri,
        is_favorite: isFavorite
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Toggle favorite status
  async toggleFavorite(imageId, currentStatus) {
    const { data, error } = await supabase
      .from('images')
      .update({ 
        is_favorite: !currentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete image
  async deleteImage(imageId) {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (error) throw error;
  },

  // Move image to different folder
  async moveImage(imageId, newFolderId) {
    const { data, error } = await supabase
      .from('images')
      .update({ 
        folder_id: newFolderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get total image count for user
  async getTotalImageCount(userId) {
    const { count, error } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count;
  },

  // Get favorite count for user
  async getFavoriteCount(userId) {
    const { count, error } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_favorite', true);
    
    if (error) throw error;
    return count;
  },
};

// ============================================
// SETTINGS OPERATIONS
// ============================================

export const settingsService = {
  // Get user settings
  async getSettings(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no settings exist, create default ones
      if (error.code === 'PGRST116') {
        return await this.createSettings(userId);
      }
      throw error;
    }
    return data;
  },

  // Create default settings
  async createSettings(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        theme: 'system',
        language: 'en',
        notifications_enabled: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update settings
  async updateSettings(userId, updates) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================
// AUTHENTICATION OPERATIONS
// ============================================

export const authService = {
  // Sign up
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Create default profile and settings
    if (data.user) {
      await profileService.upsertProfile(data.user.id, {
        username: email.split('@')[0],
      });
      await settingsService.createSettings(data.user.id);
    }
    
    return data;
  },

  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};