import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function inspect() {
  console.log('--- Attendance Table Schema ---');
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns found:', Object.keys(data[0] || {}));
    console.log('Sample data:', data[0]);
  }

  console.log('\n--- Sessions Table Status ---');
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, session_type, is_open, qr_access_token');
  
  console.log(sessions);
}

inspect();
