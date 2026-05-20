import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://omhqiojdvczywaodzbwu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uu3wpABIYSyrCa6O9MwHaA_LswlpKRQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
