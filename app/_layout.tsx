import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

import { FoldersProvider } from "../components/FoldersContext";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
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

            
          </Stack>
        </FoldersProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}