-- Ejecutar una sola vez en Supabase → SQL Editor
create table if not exists settings(id int primary key, data jsonb not null default '{}');
do $$ declare t text; begin
 foreach t in array array['employees','shifts','marks','leaves','obras','assign'] loop
  execute format('create table if not exists %I(id uuid primary key, data jsonb not null, created_at timestamptz not null default now())',t);
 end loop;
 foreach t in array array['settings','employees','shifts','marks','leaves','obras','assign'] loop
  execute format('alter table %I enable row level security',t);
  execute format('drop policy if exists "usuarios autenticados" on %I',t);
  execute format('create policy "usuarios autenticados" on %I for all to authenticated using (true) with check (true)',t);
 end loop;
end $$;
-- Bucket de fotos de marcación
insert into storage.buckets(id,name,public) values('fotos','fotos',true) on conflict (id) do nothing;
drop policy if exists "subir fotos" on storage.objects;
create policy "subir fotos" on storage.objects for insert to authenticated with check (bucket_id='fotos');
drop policy if exists "actualizar fotos" on storage.objects;
create policy "actualizar fotos" on storage.objects for update to authenticated using (bucket_id='fotos');
