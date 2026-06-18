-- Seed the five starter categories (idempotent).
insert into public.categories (name, description) values
    ('Backdrops', 'Photo walls, arches and statement backgrounds for any event.'),
    ('Furniture', 'Tables, chairs, lounges and accent pieces for guests.'),
    ('Drapes',    'Fabric draping, ceiling treatments and pipe-and-drape kits.'),
    ('Lighting',  'Uplighting, fairy lights, chandeliers and ambient fixtures.'),
    ('Floral',    'Floral walls, arrangements, centerpieces and greenery.')
on conflict (name) do nothing;
