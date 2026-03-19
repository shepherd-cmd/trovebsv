-- Seed 3 test documents for development/demo purposes
-- Safe to run multiple times (ON CONFLICT DO NOTHING)

DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN

  -- Test archivist profile
  INSERT INTO public.profiles (id, username, has_paid_entry_fee, inscription_credits)
  VALUES (test_user_id, 'archive_demo', true, 5)
  ON CONFLICT (id) DO NOTHING;

  -- 1. WW1 love letter
  INSERT INTO public.documents (
    id, user_id, title, description, category,
    image_url, rarity_score, usefulness_score,
    status, inscription_txid, price_per_page, total_pages,
    owner_paymail, delisted, view_count
  ) VALUES (
    '10000000-0000-0000-0000-000000000001',
    test_user_id,
    'Love letter home from the Western Front, 1917',
    'Handwritten letter from Private Thomas Hewitt to his wife in Barnsley. Written from a trench near Passchendaele. Ink faded but fully legible. Envelope stamped by military censor.',
    'WW1 Correspondence',
    'https://picsum.photos/seed/ww1letter/600/600',
    87, 92, 'inscribed', 'mock-txid-001',
    0.00000300, 2, '$archive_demo', false, 14
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. Victorian family portrait
  INSERT INTO public.documents (
    id, user_id, title, description, category,
    image_url, rarity_score, usefulness_score,
    status, inscription_txid, price_per_page, total_pages,
    owner_paymail, delisted, view_count
  ) VALUES (
    '10000000-0000-0000-0000-000000000002',
    test_user_id,
    'Victorian family portrait, Sheffield 1887',
    'Cabinet card of the Marsden family. Father standing, mother seated, four children. Photographer stamp: J. Wragg & Sons, Division Street. Exceptional condition.',
    'Victorian Photography',
    'https://picsum.photos/seed/victorian1887/600/600',
    74, 68, 'inscribed', 'mock-txid-002',
    0.00000300, 1, '$archive_demo', false, 7
  ) ON CONFLICT (id) DO NOTHING;

  -- 3. WW2 ration book
  INSERT INTO public.documents (
    id, user_id, title, description, category,
    image_url, rarity_score, usefulness_score,
    status, inscription_txid, price_per_page, total_pages,
    owner_paymail, delisted, view_count
  ) VALUES (
    '10000000-0000-0000-0000-000000000003',
    test_user_id,
    'WW2 ration book and identity card, Liverpool 1943',
    'Complete ration book belonging to Margaret Doyle, age 34, Liverpool. Counterfoils intact. Accompanying identity card with original photograph. Both in remarkable condition.',
    'WW2 Home Front',
    'https://picsum.photos/seed/rationbook43/600/600',
    91, 88, 'inscribed', 'mock-txid-003',
    0.00000300, 4, '$archive_demo', false, 23
  ) ON CONFLICT (id) DO NOTHING;

END $$;
