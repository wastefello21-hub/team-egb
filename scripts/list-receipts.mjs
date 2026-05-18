#!/usr/bin/env node

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    console.log('Fetching receipts from Supabase...');
    const { data, error } = await supabase
      .from('contributions')
      .select('id, receipt_number, name, phone, amount, mode, date')
      .limit(3);
    
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    
    console.log('Found receipts:');
    data?.forEach(row => {
      console.log(`  Receipt ${row.receipt_number}: ${row.name} (${row.phone}) - ₹${row.amount}`);
    });
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

test();
