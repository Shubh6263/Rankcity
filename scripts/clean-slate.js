const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nthxlkclfnfnzblpinge.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aHhsa2NsZm5mbnpibHBpbmdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM4MDgxOCwiZXhwIjoyMTA2OTU2ODE4fQ.2NedOAOJKQtnY56kGgJIsxG9wG-mzPnjH6BLMVbxf68';

const supabase = createClient(supabaseUrl, serviceKey);

async function cleanSlate() {
  console.log('Purging dummy data from Supabase...');

  // Delete campaigns
  const { error: cErr } = await supabase.from('campaigns').delete().neq('id', 'keep_none');
  console.log('Deleted campaigns:', cErr ? cErr.message : 'OK');

  // Delete reviews
  const { error: rErr } = await supabase.from('reviews').delete().neq('id', 'keep_none');
  console.log('Deleted reviews:', rErr ? rErr.message : 'OK');

  // Delete enquiries
  const { error: eErr } = await supabase.from('enquiries').delete().neq('id', 'keep_none');
  console.log('Deleted enquiries:', eErr ? eErr.message : 'OK');

  // Delete businesses
  const { error: bErr } = await supabase.from('businesses').delete().neq('id', 'keep_none');
  console.log('Deleted businesses:', bErr ? bErr.message : 'OK');

  // Delete mock user profiles (keep real clerk users if any)
  const { error: pErr } = await supabase.from('profiles').delete().like('id', 'user_%');
  console.log('Deleted mock profiles:', pErr ? pErr.message : 'OK');

  console.log('Clean slate finished on Supabase!');
}

cleanSlate();
