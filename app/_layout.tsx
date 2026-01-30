import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';

import { FoldersProvider } from "../components/FoldersContext";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  // Ensure LIGHT mode is the default theme on app start.
  // Users can still switch to dark mode from Appearance settings
  // for the duration of the session.
  useEffect(() => {
    setColorScheme('light');
  }, [setColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <FoldersProvider>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="folder/[id]"
              options={{ 
                headerShown: false,
                presentation: 'card'
              }}
            />

            <Stack.Screen
              name="user/[id]"
              options={{ 
                headerShown: false,
                presentation: 'card'
              }}
            />

            <Stack.Screen
              // Renders app/settings/index.tsx (access via /settings)
              name="settings/index"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              // Renders app/settings/index.tsx (access via /settings)
              name="settings"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen 
              name="settings/[id]" 
              options={({ route }: { route?: { params?: { title?: string } } }) => ({
                title: route?.params?.title || 'Settings',
                presentation: 'card',
                headerShown: false,
              })}
            />

           <Stack.Screen
              name="(auth)/Login"
              options={{ headerShown: false }}
          />

          <Stack.Screen
              name="(auth)/Signup"
              options={{ headerShown: false }}
          />
            
          </Stack>
        </FoldersProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}