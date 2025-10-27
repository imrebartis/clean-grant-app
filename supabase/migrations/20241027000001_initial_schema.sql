-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create applications table
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  founder_name text not null,
  founder_email text not null,

  -- Voice recording questions (8 required)
  business_description text default '',
  environmental_problem text default '',
  business_model text default '',
  key_achievements text default '',
  funding_use text default '',
  future_goals text default '',
  competitors text default '',
  unique_positioning text default '',

  -- File upload
  financial_statements_url text,

  status text check (status in ('draft', 'submitted', 'processing', 'completed')) default 'draft',
  makecom_submission_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create voice_recordings table (note: matches your existing voice_recording table)
create table public.voice_recording (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  field_name text check (field_name in (
    'business_description', 'environmental_problem', 'business_model',
    'key_achievements', 'funding_use', 'future_goals',
    'competitors', 'unique_positioning'
  )) not null,
  audio_url text not null,
  transcription text default '',
  duration integer not null, -- in seconds
  file_format text check (file_format in ('mp3', 'm4a', 'wav')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create application_sections table (matches your existing table)
create table public.application_sections (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  section_name text not null,
  content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.voice_recording enable row level security;
alter table public.application_sections enable row level security;

-- Create RLS policies
-- Profiles: Users can only see and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Applications: Users can only see and manage their own applications
create policy "Users can view own applications" on public.applications
  for select using (auth.uid() = user_id);

create policy "Users can insert own applications" on public.applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own applications" on public.applications
  for update using (auth.uid() = user_id);

create policy "Users can delete own applications" on public.applications
  for delete using (auth.uid() = user_id);

-- Voice recordings: Users can only access recordings for their own applications
create policy "Users can view own voice recordings" on public.voice_recording
  for select using (
    exists (
      select 1 from public.applications
      where applications.id = voice_recording.application_id
      and applications.user_id = auth.uid()
    )
  );

create policy "Users can insert own voice recordings" on public.voice_recording
  for insert with check (
    exists (
      select 1 from public.applications
      where applications.id = voice_recording.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Application sections: Users can only access sections for their own applications
create policy "Users can view own application sections" on public.application_sections
  for select using (
    exists (
      select 1 from public.applications
      where applications.id = application_sections.application_id
      and applications.user_id = auth.uid()
    )
  );

create policy "Users can insert own application sections" on public.application_sections
  for insert with check (
    exists (
      select 1 from public.applications
      where applications.id = application_sections.application_id
      and applications.user_id = auth.uid()
    )
  );

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_applications_updated_at
  before update on public.applications
  for each row execute procedure public.update_updated_at_column();