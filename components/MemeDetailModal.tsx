// components/MemeDetailModal.tsx
import { RedditPost } from '@/utils/redditAPI';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface MemeDetailModalProps {
  visible: boolean;
  post: RedditPost | null;
  onClose: () => void;
  onSave: () => void;
}





const MemeDetailModal: React.FC<MemeDetailModalProps> = ({
  visible,
  post,
  onClose,
  onSave,
}) => {

  const [fullScreenImage, setFullScreenImage] = useState(false);


  // Early return if no post data
  if (!post) {
    return null;
  }



  const openFullScreenImage = () => {

    if (!post.imageUrl){
      Alert.alert('Error', 'There is no image to view.')
      return;
    }

    setFullScreenImage(true);


  }


  const closeFullScreenImage = () => {
    setFullScreenImage(false);
  }




  return (

    <>
     <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Meme Details</Text>
            <View style={styles.spacer} /> {/* For alignment */}
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            
          >



            <TouchableOpacity
              onPress={openFullScreenImage}
              activeOpacity={0.9}
            >

            <Image
              source={{ uri: post.imageUrl }}
              style={styles.image}
              resizeMode="contain"
    
            />

            </TouchableOpacity>
            {/* Image */}
         

            {/* Title */}
            <Text style={styles.memeTitle}>{post.title}</Text>

            {/* Post Info */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>u/{post.author}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="arrow-up-outline" size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>{post.ups} upvotes</Text>
              </View>

              <View style= {styles.infoRow}>
                <Ionicons name="logo-reddit" size={16} color="#9CA3AF" />
                <Text className='text-gray-500 ml-4'>r/{post.subreddit}</Text>
              </View>
              
              {/* {post.comments && (
                <View style={styles.infoRow}>
                  <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.infoText}>{post.comments} comments</Text>
                </View>
              )} */}
            </View>
          </ScrollView>

          {/* Footer with Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onSave}
              style={styles.saveButton}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Save to Folder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    
    
    <Modal
      visible={fullScreenImage}
      transparent={true}
      animationType="slide"
      onRequestClose={closeFullScreenImage}
    
    
    >
      <View
        className='flex-1 bg-black justify-center items-center'
      
      >

        <TouchableOpacity 
        className='absolute top-10 right-5 z-10 p-2.5 bg-black/50 rounded-full'
         onPress={closeFullScreenImage}>
            <Ionicons name="close" size={36} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full h-full rounded-xl"
          resizeMode="contain"
        />
          
      </View>


    </Modal>



    </>
   





    
  );


};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111827',
    width: '95%',
    height: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    width: 28, // Matches close button size for centering
  },
  scrollContent: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
  },
  memeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingVertical: 16,
    lineHeight: 22,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MemeDetailModal;