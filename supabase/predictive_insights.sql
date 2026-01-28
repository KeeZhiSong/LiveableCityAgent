-- Predictive Insights table for n8n workflow storage
create table if not exists predictive_insights (
  id uuid default gen_random_uuid() primary key,
  district text not null,
  category text not null,              -- 'greenery', 'transport', 'safety', 'infrastructure'
  title text not null,
  description text not null,
  severity text default 'info',        -- 'info', 'warning', 'critical'
  confidence float default 0.0,        -- 0.0 to 1.0
  predicted_impact text,               -- human-readable impact summary
  data_sources text[],                 -- array of source names
  metadata jsonb default '{}'::jsonb,  -- flexible extra data from n8n
  created_at timestamptz default now(),
  expires_at timestamptz               -- optional TTL
);

create index idx_predictive_insights_created on predictive_insights (created_at desc);
create index idx_predictive_insights_district on predictive_insights (district);

alter table predictive_insights enable row level security;

create policy "Allow public read" on predictive_insights
  for select using (true);

create policy "Allow service role insert" on predictive_insights
  for insert with check (auth.role() = 'service_role');
