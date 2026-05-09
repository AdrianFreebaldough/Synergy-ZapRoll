import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
  console.error('\n❌ ERROR: Supabase credentials missing or invalid in backend/.env');
  console.error('Please update your .env file with your actual project URL and Anon Key.\n');
  process.exit(1); // Exit early with clear message
}

export const supabase = createClient(supabaseUrl, supabaseKey);
