ALTER TABLE public.campaign_totals ADD COLUMN IF NOT EXISTS donor_count integer NOT NULL DEFAULT 0;
UPDATE public.campaign_totals SET donor_count = 63 WHERE campaign_slug = 'vox-care';