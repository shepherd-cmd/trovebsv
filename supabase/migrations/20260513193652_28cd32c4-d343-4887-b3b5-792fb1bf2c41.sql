DROP POLICY IF EXISTS "Treasury transactions are viewable by everyone" ON public.treasury_transactions;
DROP POLICY IF EXISTS "System can insert treasury transactions" ON public.treasury_transactions;

CREATE POLICY "Users can view their own treasury transactions"
  ON public.treasury_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own treasury transactions"
  ON public.treasury_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);