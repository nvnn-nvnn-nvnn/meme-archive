import React, { createContext, useContext, useState } from 'react';

import { Alert } from 'react-native';

type Image = { id: string; imageUrl: string; isFavorite?: boolean };

// 👇 FIXED: Folder is an OBJECT with images array and color
type Folder = {
  images: Image[];
  color: string;
};

// 👇 FIXED: Folders is an object of Folder objects
type Folders = { [folderId: string]: Folder };

interface FoldersContextProps {
  folders: Folders;
  addFolder: (id: string, color?: string) => boolean;
  addImage: (folderId: string, image: Image) => void;
  removeImage: (folderId: string, imageId: string) => void;
  reorderImages: (folderId: string, newOrder: Image[]) => void;
  toggleFavorite: (folderId: string, imageId: string) => void;
  removeFolder: (folderId: string) => void;
  createFolder: (folderId: string) => void;
  addFolderColor: (folderId: string, color: string) => void;
  changeName: (folderId: string, newId: string) => void;
}

const FoldersContext = createContext<FoldersContextProps | undefined>(undefined);

export const FoldersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folders>({
    'demo': {
      images: [
        { 
          id: 'img1', 
          imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
          isFavorite: true 
        },
        { 
          id: 'img2', 
          imageUrl: 'https://i.imgflip.com/1bij.jpg',
          isFavorite: false 
        },
        { 
          id: 'img3', 
          imageUrl: 'https://i.imgflip.com/3oe0dk.jpg',
          isFavorite: true 
        }
      ],
      color: '#FF6B6B'
    }
  });

  const addFolder = (id: string, color: string) => {

    const FOLDER_LIMIT = 5;     

    const folderCount =  Object.keys(folders)
    .filter(id => id !== 'Favorites')
    .length


    if (folderCount >= FOLDER_LIMIT){
      console.log(`Maximum folders reached -- Log `);
      Alert.alert('Folder Limit Reached', `You can only create ${FOLDER_LIMIT} folders. Delete a folder to create a new one.`);
      return false;
    }





    setFolders(prev => prev[id] ? prev : { 
      ...prev, 
      [id]: { 
        images: [], 
        color: color,  // Use provided color, not hardcoded
    
      } 
    });
    return true; 
  };
 


  const addFolderColor = (folderId: string, color: string) => {
    setFolders(prev => {
      const currentFolder = prev[folderId];
      
      if (!currentFolder) {
        console.error(`Folder "${folderId}" doesn't exist!`);
        return prev;
      }
      
      // 👇 FIXED: Update color in folder object
      return {
        ...prev,
        [folderId]: {
          ...currentFolder,
          color: color
        }
      };
    });
  };

  // 👇 FIXED: addImage function for new structure
  const addImage = (folderId: string, image: Image) => {    
    setFolders(prev => {
      const folder = prev[folderId];
      
      if (!folder) {
        // Create folder if it doesn't exist
        return {
          ...prev,
          [folderId]: {
            images: [image],
            color: color
          }
        };
      }
      
      return {
        ...prev,
        [folderId]: {
          ...folder,
          images: [...folder.images, image]
        }
      };
    });
  };

  // 👇 FIXED: removeImage function for new structure
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

  // 👇 FIXED: reorderImages function for new structure
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

  // 👇 FIXED: toggleFavorite function for new structure
  // const toggleFavorite = (folderId: string, imageId: string) => {
  //   setFolders(prev => {
  //     const folder = prev[folderId];
  //     if (!folder) return prev;
      
  //     return {
  //       ...prev,
  //       [folderId]: {
  //         ...folder,
  //         images: folder.images.map(img =>
  //           img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img
  //         )
  //       }
  //     };
  //   });
  // };


    // 👇 FIXED: toggleFavorite function for new structure
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
            images: [],
            color: '#FFD700'
        };
      }

      const favoritedImages = updatedFolders[folderId].images.find( img => img.id === imageId);

      if (favoritedImages?.isFavorite){
       

        const alreadyInFavorites = updatedFolders['Favorites'].images.some(
          img => img.id === imageId
        );


          if (!alreadyInFavorites){
          updatedFolders['Favorites'].images.push(favoritedImages);
        }
      
      } else {

        updatedFolders['Favorites'].images = updatedFolders['Favorites'].images.filter(
          img => img.id !== imageId
        );
      } 


   

      return updatedFolders;
    });
  };
















  const removeFolder = (folderId: string) => {
    setFolders(prev => {
      const { [folderId]: removed, ...rest } = prev;
      return rest;
    });
  };

  // 👇 FIXED: createFolder function for new structure
  const createFolder = (folderId: string, color: string) => {
    
      const FOLDER_LIMIT = 5;     

      const folderCount =  Object.keys(folders)
      .filter(id => id !== 'Favorites')
      .length


      if (folderCount >= FOLDER_LIMIT){
        console.log(`Maximum folders reached -- Log `);
        Alert.alert('Folder Limit Reached', `You can only create ${FOLDER_LIMIT} folders. Delete a folder to create a new one.`);
        return false;
      }




    setFolders(prev => {
      if (prev[folderId]) {
        console.log(`Folder "${folderId}" already exists`);
        return prev;
      }
      
      return {
        ...prev,
        [folderId]: {
          images: [],
          color: '#4ECDC4'
        }
      };
    });
    return true; 
  };

  const changeName = (folderId: string, newId: string) => {

    setFolders(prev => {
      
      if (prev[newId]){
        console.log(`Folder "${newId}" already exists`)
        return prev
      };
    
      if (!prev[folderId]) {
        console.log(`Folder "${folderId}" does not exist`)
        return prev
    
      };

      const folderToRename = prev[folderId];


      const { [folderId]: _, ...rest } = prev;

      return{
        ...rest,
         [newId]: folderToRename

      }
  
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
      changeName
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