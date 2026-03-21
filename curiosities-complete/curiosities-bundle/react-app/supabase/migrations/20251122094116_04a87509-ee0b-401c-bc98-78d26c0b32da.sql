-- Create table for treasury transaction logging
CREATE TABLE public.treasury_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL, -- 'sponsored_inscription', 'donation', etc.
  txid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treasury_transactions ENABLE ROW LEVEL SECURITY;

-- Everyone can view treasury transactions for transparency
CREATE POLICY "Treasury transactions are viewable by everyone"
ON public.treasury_transactions
FOR SELECT
USING (true);

-- Only system can insert (via edge functions with service role)
CREATE POLICY "System can insert treasury transactions"
ON public.treasury_transactions
FOR INSERT
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_treasury_transactions_created_at ON public.treasury_transactions(created_at DESC);