UPDATE public.campaign_totals
SET goal_amount = 5000000
WHERE campaign_slug = 'vox-care';

CREATE POLICY "No direct client access to patient stories" ON public.patient_stories FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);