const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nthxlkclfnfnzblpinge.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50aHhsa2NsZm5mbnpibHBpbmdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM4MDgxOCwiZXhwIjoyMTA2OTU2ODE4fQ.2NedOAOJKQtnY56kGgJIsxG9wG-mzPnjH6BLMVbxf68';

const supabase = createClient(supabaseUrl, serviceKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    console.log('Result:', { data, error });
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

testConnection();
