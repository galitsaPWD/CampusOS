
const SUPABASE_URL = 'https://chhnfmdyswmvmkszkvih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaG5mbWR5c3dtdm1rc3prdmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDE0MjcsImV4cCI6MjA4NTkxNzQyN30.SADbdriXLlmzi5j3PU3Uh7mZBUQ7-m-qeXpZXs3mlUo';

const SCHEDULES = [
    {
        category_key: 'residential',
        display_name: 'Residential/Government',
        factor: 1.0,
        min_charge_1_2: 260.00,
        min_charge_3_4: 416.00,
        min_charge_1: 832.00,
        min_charge_1_1_2: 2080.00,
        min_charge_2: 5200.00,
        min_charge_3: 9360.00,
        min_charge_4: 18720.00,
        tier1_rate: 27.25,
        tier2_rate: 28.75,
        tier3_rate: 30.75,
        tier4_rate: 33.25
    },
    {
        category_key: 'full-commercial',
        display_name: 'Commercial/Industrial',
        factor: 2.0,
        min_charge_1_2: 520.00,
        min_charge_3_4: 832.00,
        min_charge_1: 1664.00,
        min_charge_1_1_2: 4160.00,
        min_charge_2: 10400.00,
        min_charge_3: 18720.00,
        min_charge_4: 37440.00,
        tier1_rate: 27.25,
        tier2_rate: 28.75,
        tier3_rate: 30.75,
        tier4_rate: 33.25
    },
    {
        category_key: 'commercial-a',
        display_name: 'Semi Commercial A',
        factor: 1.75,
        min_charge_1_2: 455.00,
        min_charge_3_4: 728.00,
        min_charge_1: 1456.00,
        min_charge_1_1_2: 3640.00,
        min_charge_2: 9100.00,
        min_charge_3: 16380.00,
        min_charge_4: 32760.00,
        tier1_rate: 27.25,
        tier2_rate: 28.75,
        tier3_rate: 30.75,
        tier4_rate: 33.25
    },
    {
        category_key: 'commercial-b',
        display_name: 'Semi Commercial B',
        factor: 1.50,
        min_charge_1_2: 390.00,
        min_charge_3_4: 624.00,
        min_charge_1: 1248.00,
        min_charge_1_1_2: 3120.00,
        min_charge_2: 7800.00,
        min_charge_3: 14040.00,
        min_charge_4: 28080.00,
        tier1_rate: 27.25,
        tier2_rate: 28.75,
        tier3_rate: 30.75,
        tier4_rate: 33.25
    },
    {
        category_key: 'commercial-c',
        display_name: 'Semi Commercial C',
        factor: 1.25,
        min_charge_1_2: 325.00,
        min_charge_3_4: 520.00,
        min_charge_1: 1040.00,
        min_charge_1_1_2: 2600.00,
        min_charge_2: 6500.00,
        min_charge_3: 11700.00,
        min_charge_4: 23400.00,
        tier1_rate: 27.25,
        tier2_rate: 28.75,
        tier3_rate: 30.75,
        tier4_rate: 33.25
    },
    {
        category_key: 'bulk',
        display_name: 'Bulk/Wholesale',
        factor: 3.0,
        min_charge_1_2: 780.00,
        min_charge_3_4: 1248.00,
        min_charge_1: 2496.00,
        min_charge_1_1_2: 6240.00,
        min_charge_2: 15600.00,
        min_charge_3: 28080.00,
        min_charge_4: 56160.00,
        tier1_rate: 27.25,
        tier2_rate: 28.75,
        tier3_rate: 30.75,
        tier4_rate: 33.25
    }
];

async function updateRates() {
    console.log('🚀 Starting Water Rates Update via PostgREST API...');
    
    for (const schedule of SCHEDULES) {
        console.log(`🛠️ Processing: ${schedule.display_name} (${schedule.category_key})...`);
        
        try {
            const updateUrl = `${SUPABASE_URL}/rest/v1/rate_schedules?category_key=eq.${schedule.category_key}`;
            
            const response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    display_name: schedule.display_name,
                    factor: schedule.factor,
                    min_charge_1_2: schedule.min_charge_1_2,
                    min_charge_3_4: schedule.min_charge_3_4,
                    min_charge_1: schedule.min_charge_1,
                    min_charge_1_1_2: schedule.min_charge_1_1_2,
                    min_charge_2: schedule.min_charge_2,
                    min_charge_3: schedule.min_charge_3,
                    min_charge_4: schedule.min_charge_4,
                    tier1_rate: schedule.tier1_rate,
                    tier2_rate: schedule.tier2_rate,
                    tier3_rate: schedule.tier3_rate,
                    tier4_rate: schedule.tier4_rate,
                    updated_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.length === 0) {
                    // Try Upsert if not found
                    console.log(`⚠️ Record not found for ${schedule.category_key}, trying insert...`);
                    const insertUrl = `${SUPABASE_URL}/rest/v1/rate_schedules`;
                    const insertResponse = await fetch(insertUrl, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(schedule)
                    });
                    if (insertResponse.ok) {
                        console.log(`✅ Successfully inserted ${schedule.category_key}.`);
                    } else {
                        console.error(`❌ Insert failed for ${schedule.category_key}:`, await insertResponse.text());
                    }
                } else {
                    console.log(`✅ Successfully updated ${schedule.category_key}.`);
                }
            } else {
                console.error(`❌ Update failed for ${schedule.category_key}:`, await response.text());
                // Fallback attempt: sometimes PATCH needs specific auth or doesn't work well without ID
            }
        } catch (e) {
            console.error(`❌ Script error for ${schedule.category_key}:`, e);
        }
    }
    
    console.log('✨ Rate update process completed.');
}

updateRates();
