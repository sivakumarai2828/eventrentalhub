-- Allow guests to submit booking requests without an account.
alter table public.booking_requests alter column customer_id drop not null;
alter table public.booking_requests add column if not exists guest_name text not null default '';
alter table public.booking_requests add column if not exists guest_email text;
alter table public.booking_requests add column if not exists guest_phone text;
