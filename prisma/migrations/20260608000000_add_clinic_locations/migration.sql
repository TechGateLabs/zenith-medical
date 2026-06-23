-- Add clinic_locations table for multi-location support
-- Each clinic location can be edited from the admin panel and surfaces on the
-- home page, contact page, and footer.

CREATE TABLE IF NOT EXISTS "clinic_locations" (
    "id"         TEXT PRIMARY KEY,
    "name"       TEXT NOT NULL,
    "address"    TEXT NOT NULL,
    "phone"      TEXT,
    "fax"        TEXT,
    "hours"      TEXT,
    "mapsQuery"  TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isPrimary"  BOOLEAN NOT NULL DEFAULT false,
    "published"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "clinic_locations_orderIndex_idx" ON "clinic_locations" ("orderIndex");
CREATE INDEX IF NOT EXISTS "clinic_locations_published_idx" ON "clinic_locations" ("published");
