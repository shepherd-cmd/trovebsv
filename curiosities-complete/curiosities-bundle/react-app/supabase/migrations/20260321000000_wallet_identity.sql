-- ─────────────────────────────────────────────────────────────────────────────
-- curIosities — Wallet & Identity migration
--
-- Progressive Web3 identity model:
--
--   custodial  → signed up with email/Google/Apple. Earnings held by the
--                platform until the user is ready to claim them.
--   sigma      → Sigma ID pseudonymous BSV identity. Payments route to
--                their Sigma wallet directly.
--   metanet    → Metanet Client / Babbage SDK full self-custody. Payments
--                go directly to their device-held keys.
--
-- Users start at 'custodial' and upgrade at their own pace — motivated by
-- their growing pending_balance_bsv.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  -- Which wallet layer the user is on
  add column if not exists wallet_type text not null default 'custodial'
    check (wallet_type in ('custodial', 'sigma', 'metanet')),

  -- How they signed in (for display + routing purposes)
  add column if not exists identity_provider text not null default 'email'
    check (identity_provider in ('email', 'google', 'apple', 'sigma', 'metanet')),

  -- Sigma ID handle (e.g. '@seb' on the Sigma network)
  add column if not exists sigma_id text unique,

  -- Metanet identity public key or paymail
  add column if not exists metanet_identity text unique,

  -- BSV address / paymail for receiving payments (null until wallet connected)
  add column if not exists bsv_address text,

  -- Custodial earnings held by the platform pending wallet connection
  -- Resets to 0 when user claims by connecting a real wallet
  add column if not exists pending_balance_bsv numeric(18, 8) not null default 0,

  -- Display name (separate from username — can be pseudonymous)
  add column if not exists display_name text;

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists profiles_wallet_type_idx on public.profiles(wallet_type);
create index if not exists profiles_sigma_id_idx    on public.profiles(sigma_id) where sigma_id is not null;

-- ── Helper: credit pending balance for custodial users ────────────────────────
-- Called by process-payment edge function when the owner has no self-custody wallet yet.
create or replace function public.credit_pending_balance(
  user_id uuid,
  amount_bsv numeric
)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set pending_balance_bsv = pending_balance_bsv + amount_bsv
  where id = user_id
    and wallet_type = 'custodial';
end;
$$;

-- ── Helper: claim pending balance (called when user upgrades to Sigma/Metanet) ─
create or replace function public.claim_pending_balance(
  user_id uuid,
  new_wallet_type text,
  new_identity text  -- sigma_id or metanet_identity
)
returns numeric
language plpgsql
security definer
as $$
declare
  balance numeric;
begin
  select pending_balance_bsv into balance
  from public.profiles
  where id = user_id;

  -- Upgrade wallet type and store identity, clear custodial balance
  update public.profiles
  set wallet_type        = new_wallet_type,
      identity_provider  = new_wallet_type,  -- sigma or metanet
      pending_balance_bsv = 0,
      sigma_id           = case when new_wallet_type = 'sigma'   then new_identity else sigma_id end,
      metanet_identity   = case when new_wallet_type = 'metanet' then new_identity else metanet_identity end
  where id = user_id;

  -- Return the balance so the edge function can trigger the actual BSV payout
  return coalesce(balance, 0);
end;
$$;

-- ── RLS: users can only see/update their own wallet fields ───────────────────
-- (existing policies already cover this via auth.uid() = id, no changes needed)
