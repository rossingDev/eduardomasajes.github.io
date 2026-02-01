import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

export const supabase = createClient(
    "https://lkplgezuorfkvvxswwhz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcGxnZXp1b3Jma3Z2eHN3d2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTIzOTcsImV4cCI6MjA4NDE2ODM5N30.NbRaKer9yQApDljNH_okOHvCSQkpiJe6Yf73Ol0QcHM"
)