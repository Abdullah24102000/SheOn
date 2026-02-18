import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbrranerfntuvlfnyikn.supabase.co';
const supabaseKey = 'sb_publishable_opChWj_u08eKeTWWmPhCpg_i3SsUi8z';

export const supabase = createClient(supabaseUrl, supabaseKey)