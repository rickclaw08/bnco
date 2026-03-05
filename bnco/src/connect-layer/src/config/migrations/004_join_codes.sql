ALTER TABLE studios ADD COLUMN IF NOT EXISTS join_code VARCHAR(10) UNIQUE;

-- Generate codes for existing studios
UPDATE studios SET join_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)) WHERE join_code IS NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_studios_join_code ON studios(join_code);
