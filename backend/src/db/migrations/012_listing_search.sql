CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text index for multi-word listing searches such as "road bike".
CREATE INDEX IF NOT EXISTS idx_listings_search_vector
  ON listings USING GIN (
    to_tsvector(
      'simple',
      COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(location, '')
    )
  );

-- Trigram indexes make partial and typo-tolerant matching faster.
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm
  ON listings USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_listings_description_trgm
  ON listings USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_listings_location_trgm
  ON listings USING GIN (location gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_categories_name_trgm
  ON categories USING GIN (name gin_trgm_ops);
