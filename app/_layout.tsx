import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

import { FoldersProvider } from "../components/FoldersContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        </Stack>
      </FoldersProvider>
    </GestureHandlerRootView>
  );
}