// config/supabase.ts
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js'

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // ← Service key, pas anon key

export const supabase = createClient(supabaseUrl, supabaseServiceKey)