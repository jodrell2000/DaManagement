USE robotoDB;

ALTER TABLE tracksPlayed
ADD COLUMN upvotes INT UNSIGNED NOT NULL DEFAULT 0,
ADD COLUMN downvotes INT UNSIGNED NOT NULL DEFAULT 0,
ADD COLUMN snags INT UNSIGNED NOT NULL DEFAULT 0;
