import { createClient } from '@supabase/supabase-js';

// Publishable key only. Database grants and RLS enforce authorization.
export const adminClient = createClient('https://zwjzlzyqsqxqtjxhgmbs.supabase.co',
  'sb_publishable_TU_GC-BZ9hE6GBtF4mPLZQ_qLZyfSQd', {
    auth: { storage: sessionStorage, storageKey: 'justcolors-admin', detectSessionInUrl: new URLSearchParams(window.location.search).get('admin-auth') === '1' },
  });
