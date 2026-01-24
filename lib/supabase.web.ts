import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      // On web, let Supabase manage its own storage (localStorage in the
      // browser or an in-memory fallback in Node) instead of forcing
      // React Native AsyncStorage, which assumes window is defined.
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);