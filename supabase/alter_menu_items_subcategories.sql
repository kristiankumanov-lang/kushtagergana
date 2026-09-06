-- subcategory can be NOT NULL without a default only because menu_items is currently empty.
alter table guesthouse.menu_items
  add column subcategory text not null,
  add column subcategory_order integer not null default 0,
  add column description text,
  add constraint menu_items_name_key unique (name);
