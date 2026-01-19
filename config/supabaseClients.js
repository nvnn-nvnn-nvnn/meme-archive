import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'EXPO_PUBLIC_SUPABASE_URL';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZnhnbnNqbXl5a2diZ3Fyb29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA4MDksImV4cCI6MjA4NDMzNjgwOX0.bf7-A13sM_V5Bk6xykovPpZfTGzqWUMlIc6Zf5-z1hs';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 