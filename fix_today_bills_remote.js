
const SUPABASE_URL = 'https://chhnfmdyswmvmkszkvih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaG5mbWR5c3dtdm1rc3prdmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDE0MjcsImV4cCI6MjA4NTkxNzQyN30.SADbdriXLlmzi5j3PU3Uh7mZBUQ7-m-qeXpZXs3mlUo';

async function fixTodayBills() {
    console.log('🔍 Fetching today\'s bills to fix rates...');
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // 1. Fetch Rate Schedules
        const rsResp = await fetch(`${SUPABASE_URL}/rest/v1/rate_schedules`, {
            headers: { 'apikey': SUPABASE_ANON_KEY }
        });
        const rates = await rsResp.json();
        
        // 2. Fetch Today's Bills with Customer Data
        const bResp = await fetch(`${SUPABASE_URL}/rest/v1/billing?reading_date=eq.${today}&select=*,customers!customer_id(*)`, {
            headers: { 'apikey': SUPABASE_ANON_KEY }
        });
        const bills = await bResp.json();

        if (bills.code) throw new Error(bills.message);

        console.log(`📊 Found ${bills.length} bills to verify.`);

        for (const bill of bills) {
            const customer = bill.customers;
            if (!customer) continue;

            const catKey = (customer.category || 'residential').toLowerCase();
            const meterSize = (customer.meter_size || '1/2').trim();
            const schedule = rates.find(s => s.category_key === catKey);
            
            if (!schedule) continue;

            let baseRateCol = 'min_charge_1_2';
            if (meterSize === '3/4') baseRateCol = 'min_charge_3_4';
            else if (meterSize === '1') baseRateCol = 'min_charge_1';
            else if (meterSize === '1 1/2') baseRateCol = 'min_charge_1_1_2';
            else if (meterSize.startsWith('2')) baseRateCol = 'min_charge_2';
            else if (meterSize.startsWith('3')) baseRateCol = 'min_charge_3';
            else if (meterSize.startsWith('4')) baseRateCol = 'min_charge_4';

            const baseRate = parseFloat(schedule[baseRateCol]) || 260; 
            const factor = parseFloat(schedule.factor) || 1.0;
            const consumption = parseFloat(bill.consumption) || 0;

            let consumptionCharge = 0;
            if (consumption > 10) {
                let excess = consumption - 10;
                const t1 = Math.min(excess, 10);
                consumptionCharge += t1 * (parseFloat(schedule.tier1_rate) * factor);
                excess -= t1;
                if (excess > 0) {
                    const t2 = Math.min(excess, 10);
                    consumptionCharge += t2 * (parseFloat(schedule.tier2_rate) * factor);
                    excess -= t2;
                    if (excess > 0) {
                        const t3 = Math.min(excess, 10);
                        consumptionCharge += t3 * (parseFloat(schedule.tier3_rate) * factor);
                        excess -= t3;
                        if (excess > 0) consumptionCharge += excess * (parseFloat(schedule.tier4_rate) * factor);
                    }
                }
            }

            const correctAmount = baseRate + consumptionCharge; // Assuming no discount for this simple fix
            
            // If the bill amount doesn't match and arrears is 0, it's definitely an old-logic bill
            if (Math.abs(parseFloat(bill.amount) - correctAmount) > 0.01) {
                console.log(`⚖️ Fixing Bill #${bill.bill_no}: Old: ${bill.amount} -> New: ${correctAmount}`);
                
                // Update the bill
                await fetch(`${SUPABASE_URL}/rest/v1/billing?id=eq.${bill.id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: correctAmount,
                        balance: correctAmount,
                        base_charge: baseRate,
                        consumption_charge: consumptionCharge
                    })
                });
            } else {
                console.log(`✅ Bill #${bill.bill_no} already correct (${bill.amount}).`);
            }
        }

        console.log('✨ Fix completed.');
    } catch (e) {
        console.error('❌ Error fixing bills:', e);
    }
}

fixTodayBills();
