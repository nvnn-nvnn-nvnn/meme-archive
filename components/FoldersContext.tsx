import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // adjust path if needed
import { supabase } from '../lib/supabase'; // adjust path if needed
import { uploadImageToSupabase } from '../lib/storage';

type Image = { id: string; imageUrl: string; isFavorite?: boolean };

type Folder = {
  id: string;
  name: string;           // added
  images: Image[];
  color: string;
  isPublic?: boolean;
};

type Folders = { [folderId: string]: Folder };

interface FoldersContextProps {
  folders: Folders;
  addFolder: (name: string, color?: string) => Promise<boolean>;
  addImage: (folderId: string, image: Image) => Promise<void>;
  removeImage: (folderId: string, imageId: string) => void;
  reorderImages: (folderId: string, newOrder: Image[]) => void;
  toggleFavorite: (folderId: string, imageId: string) => void;
  removeFolder: (folderId: string) => Promise<void>;
  createFolder: (name: string, color?: string) => Promise<boolean>;
  addFolderColor: (folderId: string, color: string) => void;
  changeName: (folderId: string, newName: string) => Promise<void>;
}

const FoldersContext = createContext<FoldersContextProps | undefined>(undefined);

export const FoldersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folders>({});
  

 const STORAGE_KEY = '@folders_data_v2'; // changed key so old broken data doesn't interfere

// LOAD - runs once when provider mounts
useEffect(() => {
  const loadFromStorage = async () => {
    console.log('[STORAGE] Starting load attempt');
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('[STORAGE] Raw value from AsyncStorage:', saved); // ← most important

      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[STORAGE] Parsed folders keys:', Object.keys(parsed));
        console.log('[STORAGE] First folder name example:', parsed[Object.keys(parsed)[0]]?.name);
        setFolders(parsed);
      } else {
        console.log('[STORAGE] Nothing found in storage');
      }
    } catch (e) {
      console.error('[STORAGE] Load crashed:', e);
    }
  };

  loadFromStorage();
}, []);

// SAVE - runs when folders change (with debounce)
useEffect(() => {
  if (Object.keys(folders).length === 0) return; // skip empty

  console.log('[STORAGE] Folders changed → scheduling save. Count:', Object.keys(folders).length);

  const timeout = setTimeout(async () => {
    try {
      const json = JSON.stringify(folders);
      console.log('[STORAGE] Stringified size (chars):', json.length);
      await AsyncStorage.setItem(STORAGE_KEY, json);
      console.log('[STORAGE] SAVE SUCCESSFUL');
    } catch (e) {
      console.error('[STORAGE] SAVE FAILED:', e);
    }
  }, 1000); // 1 second debounce

  return () => clearTimeout(timeout);
}, [folders]);




  // Load folders from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setFolders({});
      return;
    }

    const loadFolders = async () => {
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('id, name, color, is_public')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const foldersMap: Folders = {};

        data.forEach((f: any) => {
          foldersMap[f.id] = {
            id: f.id,
            name: f.name,
            color: f.color,
            isPublic: f.is_public ?? false,
            images: [], // images will be loaded later
          };
        });

        // Keep Favorites as a special local folder
        foldersMap['Favorites'] = {
          id: 'Favorites',
          name: 'Favorites',
          color: '#FFD700',
          images: [], // populate from favorites later
        };

        const { data: imagesData } = await supabase
        .from('images')
        .select('id, uri, is_favorite, folder_id')
        .eq('user_id', user.id);

      imagesData?.forEach(img => {
        if (foldersMap[img.folder_id]) {
          foldersMap[img.folder_id].images.push({
            id: img.id,
            imageUrl: img.uri,
            isFavorite: img.is_favorite,
          });
        }
      });

        setFolders(foldersMap);
      } catch (err) {
        console.error('Failed to load folders:', err);
        Alert.alert('Error', 'Could not load your folders');
      }
    };

    loadFolders();
  }, [user]);

  const FOLDER_LIMIT = 5;

  const createFolder = async (name: string, color: string = '#a855f7') => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return false;
    }

    // Check limit in database
    const { count, error: countError } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      Alert.alert('Error', 'Could not check folder limit');
      return false;
    }

    if ((count || 0) >= FOLDER_LIMIT) {
      Alert.alert('Folder Limit Reached', `You can only create ${FOLDER_LIMIT} folders.`);
      return false;
    }

    // Create in Supabase
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Error', error.message || 'Failed to create folder');
      return null;
    }

    // Add to local state
    setFolders(prev => ({
      ...prev,
      [data.id]: {
        id: data.id,
        name: data.name,
        color: data.color,
        isPublic: false,
        images: [],
      },
    }));

    return data.id;
  };

  const addFolder = async (name: string, color: string = '#a855f7') => {
    return await createFolder(name, color);  // now returns ID or null
  };



  const addFolderColor = (folderId: string, color: string) => {
    setFolders(prev => {
      const current = prev[folderId];
      if (!current) return prev;

      // Optional: save to Supabase
      supabase
        .from('folders')
        .update({ color })
        .eq('id', folderId)
        .eq('user_id', user?.id)
        .then(({ error }) => {
          if (error) console.error('Failed to save color:', error);
        });

      return {
        ...prev,
        [folderId]: { ...current, color },
      };
    });
  };

  const changeName = async (folderId: string, newName: string) => {
    if (!user) return;

    const trimmed = newName.trim();
    if (!trimmed) return;

    // Optional: check unique name
    const { data: existing } = await supabase
      .from('folders')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', trimmed)
      .neq('id', folderId);

    const existingCount = existing ? existing.length : 0;
    if (existingCount > 0) {
      Alert.alert('Error', 'A folder with this name already exists');
      return;
    }

    const { error } = await supabase
      .from('folders')
      .update({ name: trimmed })
      .eq('id', folderId)
      .eq('user_id', user.id);

    if (error) {
      Alert.alert('Error', 'Could not rename folder');
      return;
    }

    setFolders(prev => ({
      ...prev,
      [folderId]: { ...prev[folderId], name: trimmed },
    }));
  };

  const removeFolder = async (folderId: string) => {
    if (!user || folderId === 'Favorites') return;

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id);

    if (error) {
      Alert.alert('Error', 'Could not delete folder');
      return;
    }

    setFolders(prev => {
      const { [folderId]: _, ...rest } = prev;
      return rest;
    });
  };

  // Keep your existing addImage, removeImage, reorderImages, toggleFavorite for now
  // (we'll add Supabase sync for images in the next step when you're ready)

 const addImage = async (folderId: string, image: Image) => {
  if (!user) return;

  let remoteUrl = image.imageUrl;

  if (!remoteUrl.startsWith('http')) {
    try {
      remoteUrl = await uploadImageToSupabase(user.id, image.imageUrl);
    } catch (e) {
      console.error('Image upload failed:', e);
      Alert.alert('Error', 'Could not upload image');
      return;
    }
  }

  // Save to Supabase
  const { error } = await supabase
    .from('images')
    .insert({
      user_id: user.id,
      folder_id: folderId,
      uri: remoteUrl,          // or publicUrl from storage later
      is_favorite: image.isFavorite ?? false,
    });

  if (error) {
    Alert.alert('Error', 'Could not save image');
    return;
  }

  const savedImage: Image = { ...image, imageUrl: remoteUrl };

  // Update local state
  setFolders(prev => {
    const folder = prev[folderId];
    if (!folder) return prev;
    return {
      ...prev,
      [folderId]: {
        ...folder,
        images: [...folder.images, savedImage],
      },
    };
  });
};

  const removeImage = (folderId: string, imageId: string) => {
    setFolders(prev => {
      const folder = prev[folderId];
      if (!folder) return prev;
      
      return {
        ...prev,
        [folderId]: {
          ...folder,
          images: folder.images.filter(img => img.id !== imageId)
        }
      };
    });
  };

  const reorderImages = (folderId: string, newOrder: Image[]) => {
    setFolders(prev => {
      const folder = prev[folderId];
      if (!folder) return prev;
      
      return {
        ...prev,
        [folderId]: {
          ...folder,
          images: newOrder
        }
      };
    });
  };

  const toggleFavorite = (folderId: string, imageId: string) => {
    setFolders(prev => {
      const folder = prev[folderId];
      if (!folder) return prev;
      
      const updatedFolders = {
        ...prev,
        [folderId]: {
          ...folder,
          images: folder.images.map(img =>
            img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
          )
        }
      };

      if (!updatedFolders['Favorites']){
        updatedFolders['Favorites'] = {
            id: 'Favorites',
            name: 'Favorites',
            images: [],
            color: '#FFD700'
        };
      }

      const favoritedImage = updatedFolders[folderId].images.find(img => img.id === imageId);

      if (favoritedImage?.isFavorite) {
        const alreadyInFavorites = updatedFolders['Favorites'].images.some(
          img => img.id === imageId
        );
        if (!alreadyInFavorites) {
          updatedFolders['Favorites'].images.push(favoritedImage);
        }
      } else {
        updatedFolders['Favorites'].images = updatedFolders['Favorites'].images.filter(
          img => img.id !== imageId
        );
      }

      return updatedFolders;
    });
  };

  return (
    <FoldersContext.Provider value={{ 
      folders,
      addFolder,
      addImage,
      toggleFavorite,
      removeImage,
      reorderImages,
      removeFolder,
      createFolder,
      addFolderColor,
      changeName,
    }}>
      {children}
    </FoldersContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FoldersContext);
  if (!context) throw new Error("useFolders must be used within a FoldersProvider");
  return context;
};