USE robotoDB;

ALTER TABLE tracksPlayed 
MODIFY COLUMN `upvotes` int NOT NULL DEFAULT '0', 
MODIFY COLUMN `downvotes` int NOT NULL DEFAULT '0';