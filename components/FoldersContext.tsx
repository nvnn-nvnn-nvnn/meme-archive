import React, { createContext, useContext, useEffect, useState } from 'react';

import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // adjust path if needed
import { uploadImageToSupabase } from '../lib/storage';
import { supabase } from '../lib/supabase'; // adjust path if needed

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
  addFolder: (name: string, color?: string) => Promise<string | null>;
  addImage: (folderId: string, image: Image) => Promise<void>;
  removeImage: (folderId: string, imageId: string) => Promise<void>;
  reorderImages: (folderId: string, newOrder: Image[]) => void;
  toggleFavorite: (folderId: string, imageId: string) => void;
  removeFolder: (folderId: string) => Promise<void>;
  createFolder: (name: string, color?: string) => Promise<string | null>;
  addFolderColor: (folderId: string, color: string) => void;
  changeName: (folderId: string, newName: string) => Promise<void>;
}

const FoldersContext = createContext<FoldersContextProps | undefined>(undefined);

export const FoldersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folders>({});

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
      return null;
    }

    // Check limit in database
    const { count, error: countError } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      Alert.alert('Error', 'Could not check folder limit');
      return null;
    }

    if ((count || 0) >= FOLDER_LIMIT) {
      Alert.alert('Folder Limit Reached', `You can only create ${FOLDER_LIMIT} folders.`);
      return null;
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
  // 1) Delete all images in this folder
  const { error: imagesError } = await supabase
    .from('images')
    .delete()
    .eq('folder_id', folderId)
    .eq('user_id', user.id);
  if (imagesError) {
    console.error('Failed to delete folder images:', imagesError);
    Alert.alert('Error', 'Could not delete folder images');
    return;
  }
  // 2) Delete the folder itself
  const { error: folderError } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', user.id);
  if (folderError) {
    console.error('Failed to delete folder:', folderError);
    Alert.alert('Error', 'Could not delete folder');
    return;
  }
  // 3) Update local state
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
  let fileSize: number | null = null;

  if (!remoteUrl.startsWith('http')) {
    try {
      const { publicUrl, fileSize: size } = await uploadImageToSupabase(user.id, image.imageUrl);
      remoteUrl = publicUrl;
      fileSize = size;
    } catch (e: any) {
      console.error('Image upload failed:', e);
      const message = e?.message || 'Could not upload image';
      Alert.alert('Error', message);
      return;
    }
  }

  // Save to Supabase and get the inserted row back, including file_size_bytes when known
  const { data, error } = await supabase
    .from('images')
    .insert({
      user_id: user.id,
      folder_id: folderId,
      uri: remoteUrl,
      is_favorite: image.isFavorite ?? false,
      ...(fileSize !== null ? { file_size_bytes: fileSize } : {}),
    })
    .select('id, uri, is_favorite')
    .single();

  if (error || !data) {
    console.error('Supabase image insert failed:', error);
    Alert.alert('Error', 'Could not save image');
    return;
  }

  const savedImage: Image = {
    id: data.id,
    imageUrl: data.uri,
    isFavorite: data.is_favorite ?? false,
  };

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



const removeImage = async (folderId: string, imageId: string) => {
  if (!user) return;
  // First delete from Supabase
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId)
    .eq('user_id', user.id);
  if (error) {
    console.error('Failed to delete image from Supabase:', error);
    Alert.alert('Error', 'Could not delete image');
    return;
  }
  // Then update local state
  setFolders(prev => {
    const folder = prev[folderId];
    if (!folder) return prev;
    return {
      ...prev,
      [folderId]: {
        ...folder,
        images: folder.images.filter(img => img.id !== imageId),
      },
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