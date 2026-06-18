-- EventRentHub schema (PostgreSQL / Supabase)
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users  (mirror of auth.users, kept in sync by a trigger below)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
    id          uuid primary key references auth.users (id) on delete cascade,
    name        text not null default '',
    email       text unique not null,
    phone       text,
    role        text not null default 'customer'
                check (role in ('customer', 'owner', 'admin')),
    created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
    id              uuid primary key default gen_random_uuid(),
    name            text unique not null,
    description     text not null default '',
    cover_image_url text,
    created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- items
-- ---------------------------------------------------------------------------
create table if not exists public.items (
    id                  uuid primary key default gen_random_uuid(),
    owner_id            uuid not null references public.users (id) on delete cascade,
    category_id         uuid not null references public.categories (id),
    name                text not null,
    description         text not null default '',
    price_per_day       numeric(10, 2) not null default 0,
    security_deposit    numeric(10, 2) not null default 0,
    quantity_available  integer not null default 1,
    pickup_city         text not null default '',
    pickup_address      text not null default '',
    status              text not null default 'active'
                        check (status in ('active', 'inactive')),
    created_at          timestamptz not null default now()
);
create index if not exists idx_items_owner on public.items (owner_id);
create index if not exists idx_items_category on public.items (category_id);
create index if not exists idx_items_city on public.items (pickup_city);
create index if not exists idx_items_status on public.items (status);

-- ---------------------------------------------------------------------------
-- item_images
-- ---------------------------------------------------------------------------
create table if not exists public.item_images (
    id            uuid primary key default gen_random_uuid(),
    item_id       uuid not null references public.items (id) on delete cascade,
    image_url     text not null,
    display_order integer not null default 0,
    is_primary    boolean not null default false,
    created_at    timestamptz not null default now()
);
create index if not exists idx_item_images_item on public.item_images (item_id);

-- ---------------------------------------------------------------------------
-- availability (explicit windows)
-- ---------------------------------------------------------------------------
create table if not exists public.availability (
    id                  uuid primary key default gen_random_uuid(),
    item_id             uuid not null references public.items (id) on delete cascade,
    available_from      date not null,
    available_to        date not null,
    quantity_available  integer not null default 1
);
create index if not exists idx_availability_item on public.availability (item_id);

-- ---------------------------------------------------------------------------
-- booking_requests
-- ---------------------------------------------------------------------------
create table if not exists public.booking_requests (
    id            uuid primary key default gen_random_uuid(),
    customer_id   uuid not null references public.users (id) on delete cascade,
    owner_id      uuid not null references public.users (id) on delete cascade,
    status        text not null default 'PENDING'
                  check (status in ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    event_type    text not null default '',
    event_date    date,
    pickup_date   date not null,
    return_date   date not null,
    budget        numeric(10, 2),
    notes         text not null default '',
    created_at    timestamptz not null default now()
);
create index if not exists idx_bookings_customer on public.booking_requests (customer_id);
create index if not exists idx_bookings_owner on public.booking_requests (owner_id);
create index if not exists idx_bookings_status on public.booking_requests (status);

-- ---------------------------------------------------------------------------
-- booking_items
-- ---------------------------------------------------------------------------
create table if not exists public.booking_items (
    id                  uuid primary key default gen_random_uuid(),
    booking_request_id  uuid not null references public.booking_requests (id) on delete cascade,
    item_id             uuid not null references public.items (id) on delete cascade,
    quantity            integer not null default 1,
    daily_rate          numeric(10, 2) not null default 0
);
create index if not exists idx_booking_items_request on public.booking_items (booking_request_id);

-- ---------------------------------------------------------------------------
-- Keep public.users in sync with auth.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (id, email, name, phone, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'name', ''),
        new.raw_user_meta_data ->> 'phone',
        coalesce(new.raw_user_meta_data ->> 'role', 'customer')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
