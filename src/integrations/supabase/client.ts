
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ufwptcqxikxomjmpfxsf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmd3B0Y3F4aWt4b21qbXBmeHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTA5NzksImV4cCI6MjA2MDM4Njk3OX0.P65ckfT7f4IWHJzKJzSRSF9-d_O3qegLqgIUikoTyTA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
