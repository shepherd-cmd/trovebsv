-- Create user profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create trigger to auto-create profile on user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create documents table
create table public.documents (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  image_url text not null,
  rarity_score integer not null check (rarity_score >= 1 and rarity_score <= 100),
  usefulness_score integer not null check (usefulness_score >= 1 and usefulness_score <= 100),
  ai_analysis jsonb,
  inscription_txid text,
  price_per_page numeric(10, 8),
  total_pages integer,
  status text not null default 'pending' check (status in ('pending', 'analyzing', 'inscribed', 'failed')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.documents enable row level security;

create policy "Documents are viewable by everyone"
  on public.documents for select
  using (true);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

-- Create royalties table
create table public.royalties (
  id uuid not null default gen_random_uuid() primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  reader_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10, 8) not null,
  page_number integer not null,
  created_at timestamp with time zone not null default now()
);

alter table public.royalties enable row level security;

create policy "Users can view their own royalties"
  on public.royalties for select
  using (auth.uid() = owner_id or auth.uid() = reader_id);

create policy "Authenticated users can create royalty records"
  on public.royalties for insert
  with check (auth.uid() = reader_id);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_documents_updated_at
  before update on public.documents
  for each row execute function public.update_updated_at_column();

-- Create storage bucket for document images
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true);

-- Storage policies
create policy "Anyone can view document images"
  on storage.objects for select
  using (bucket_id = 'documents');

create policy "Authenticated users can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own documents"
  on storage.objects for update
  using (
    bucket_id = 'documents' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );