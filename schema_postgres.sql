-- CAMPAR SGC Digital v0.9 - Modelo preliminar PostgreSQL/Supabase
-- Diseñado para sustituir localStorage en la fase multiusuario.

create table users (
  id uuid primary key,
  full_name text not null,
  role text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key,
  code text not null unique,
  name text not null,
  dimensions text,
  plan_code text,
  plan_revision text,
  heat_treatment_required boolean not null default false,
  active boolean not null default true
);

create table purchase_orders (
  id uuid primary key,
  order_number text not null unique,
  plant text not null,
  status text not null default 'Activa',
  created_at timestamptz not null default now(),
  created_by uuid references users(id)
);

create table purchase_order_lines (
  id uuid primary key,
  purchase_order_id uuid not null references purchase_orders(id),
  product_id uuid not null references products(id),
  ordered_qty integer not null check (ordered_qty > 0),
  required_date date,
  priority text
);

create table sawmills (
  id uuid primary key,
  operational_name text not null unique,
  authorization_code text not null unique
);

create table allocations (
  id uuid primary key,
  purchase_order_line_id uuid not null references purchase_order_lines(id),
  sawmill_id uuid not null references sawmills(id),
  assigned_qty integer not null check (assigned_qty > 0),
  created_at timestamptz not null default now()
);

create table production_movements (
  id uuid primary key,
  allocation_id uuid not null references allocations(id),
  from_stage text,
  to_stage text not null,
  qty integer not null check (qty > 0),
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references users(id)
);

create table lots (
  id uuid primary key,
  lot_code text not null unique,
  allocation_id uuid not null references allocations(id),
  qty integer not null check (qty > 0),
  production_stage text not null default 'Limpios',
  quality_status text not null default 'Pendiente de inspección',
  created_at timestamptz not null default now()
);

create table inspections (
  id uuid primary key,
  inspection_code text not null unique,
  lot_id uuid not null references lots(id),
  sample_size integer not null,
  result text not null,
  release_status text not null,
  released_by uuid references users(id),
  released_at timestamptz,
  moisture_reference text,
  findings text,
  evidence_reference text,
  created_at timestamptz not null default now(),
  created_by uuid references users(id)
);

create table nonconformities (
  id uuid primary key,
  nc_code text not null unique,
  lot_id uuid not null references lots(id),
  inspection_id uuid references inspections(id),
  reason text not null,
  severity text,
  status text not null default 'Abierta',
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key,
  delivery_code text not null unique,
  purchase_order_id uuid not null references purchase_orders(id),
  lot_id uuid not null references lots(id),
  qty integer not null check (qty > 0),
  plant text not null,
  scheduled_date date,
  status text not null default 'Programada',
  receipt_reference text,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key,
  entity_type text not null,
  entity_id uuid not null,
  document_type text not null,
  file_path text not null,
  version text,
  created_at timestamptz not null default now(),
  created_by uuid references users(id)
);

create table audit_history (
  id uuid primary key,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now(),
  created_by uuid references users(id)
);

insert into sawmills (id, operational_name, authorization_code) values
  (gen_random_uuid(), 'Cosme', 'MX-1361'),
  (gen_random_uuid(), 'Duma', 'MX-1071');
