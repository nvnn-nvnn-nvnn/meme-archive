import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';



export default function TabsLayout() {
  const router = useRouter();
  return (
    
      <View className="flex-1 bg-primary dark:bg-accent items-center ">

      <View className="flex-row items-center justify-between w-full px-5 pt-10">
        <Text className="text-2xl text-textAlt dark:text-textDefault font-bold">MemeArsenal</Text>

        <View className='flex-row items-center gap-2'>
          <TouchableOpacity className='p-2'
           onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person-outline" size={40} color="#9CA3AF" />
            
          </TouchableOpacity>
          {/* Space */}
          <TouchableOpacity className='p-2  '
          onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={40} color="#9CA3AF" />
          </TouchableOpacity>


        </View>
       
      </View>
              
        <View className="flex-1 w-full h-full mb-2 ">
          <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#FFF',
            tabBarInactiveTintColor: '#C77DFF',
            tabBarStyle: {
              backgroundColor: '#1F0954',
              borderTopColor: 'transparent',
              borderTopWidth: 1,
              paddingBottom: Platform.OS === 'ios' ? 20 : 10,
              paddingTop: 10,
              height: Platform.OS === 'ios' ? 90 : 70,
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: '500',
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Archive',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size || 24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: 'Discover',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="compass" size={size || 24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="upload"
            options={{
              title: 'Upload',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="add-circle" size={size || 24} color={color} />
              ),
            }}
          />


          <Tabs.Screen
            name="Search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search-outline" size={size || 24} color={color} />
              ),
            }}
          />



          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size || 24} color={color} />
              ),
            }}
          />

   

    



          </Tabs>

          
        </View>
      </View>
  );
}

