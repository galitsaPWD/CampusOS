
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://chhnfmdyswmvmkszkvih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaG5mbWR5c3dtdm1rc3prdmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDE0MjcsImV4cCI6MjA4NTkxNzQyN30.SADbdriXLlmzi5j3PU3Uh7mZBUQ7-m-qeXpZXs3mlUo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect() {
    console.log('🔍 Fetching all customers...');
    const { data: customers, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, status');
    
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${customers.length} customers.`);
    const marjorie = customers.find(c => c.last_name.toUpperCase().includes('ALEJAR') || c.first_name.toUpperCase().includes('MARJORIE'));
    
    if (marjorie) {
        console.log('✅ Found Marjorie Alejar:', marjorie);
        
        console.log(`🔍 Fetching bills for customer ID: ${marjorie.id}...`);
        const { data: bills, error: billError } = await supabase
            .from('billing')
            .select('*')
            .eq('customer_id', marjorie.id)
            .order('due_date', { ascending: false });
        
        if (billError) {
            console.error('Error fetching bills:', billError);
        } else {
            console.table(bills.map(b => ({
                id: b.id,
                period: b.billing_period,
                amount: b.amount,
                balance: b.balance,
                status: b.status,
                penalty: b.penalty
            })));
        }
    } else {
        console.log('❌ Marjorie Alejar not found in customers list.');
        console.log('Listing all customers for manual inspection:');
        console.table(customers.slice(0, 20)); // Show top 20
    }
    process.exit(0);
}

inspect();
