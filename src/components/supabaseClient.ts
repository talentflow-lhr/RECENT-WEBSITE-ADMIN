import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://onssghljexptdladoekw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_F8gFU_y97mT9aGZ-DYs_1Q_IW-Gr9vh'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

