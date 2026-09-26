CREATE TABLE public.gift_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name text NOT NULL,
  contact text NOT NULL,
  address text NOT NULL,
  size text,
  amount integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.gift_claims TO anon, authenticated;
GRANT ALL ON public.gift_claims TO service_role;
ALTER TABLE public.gift_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a gift claim" ON public.gift_claims FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "No direct client reads of gift claims" ON public.gift_claims FOR SELECT TO anon, authenticated USING (false);