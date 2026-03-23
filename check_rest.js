const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
    const { data, error } = await supabase.from('patients').select('*').limit(2);
    if (error) console.error(error);
    else {
        console.log("Columns:", Object.keys(data[0] || {}));
        console.log("Patient 1:", data[0]?.name, data[0]?.initials);
    }
})();
