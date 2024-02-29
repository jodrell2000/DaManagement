USE robotoDB;

DROP TABLE IF EXISTS videoData;
CREATE TABLE IF NOT EXISTS videoData
(
    id                CHAR(11)     NOT NULL PRIMARY KEY,
    artistName        VARCHAR(128) NOT NULL,
    trackName         VARCHAR(128) NOT NULL,
    artistDisplayName VARCHAR(128),
    trackDisplayName  VARCHAR(128)
);

ALTER TABLE tracksPlayed
    DROP INDEX yt_id,
    DROP COLUMN yt_id,
    ADD COLUMN videoData_id CHAR(11) DEFAULT NULL,
    ADD INDEX yt_id (videoData_id);

ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255),
    ADD INDEX username (username);

ALTER TABLE users
    ADD COLUMN email VARCHAR(255);

ALTER TABLE roboCoinAudit
    MODIFY COLUMN beforeChange DECIMAL(10, 2),
    MODIFY COLUMN afterChange DECIMAL(10, 2),
    MODIFY COLUMN numCoins DECIMAL(10, 2);

ALTER TABLE users
    MODIFY COLUMN RoboCoins DECIMAL(10, 2);

INSERT INTO roboCoinAuditTypes (id, reason)
VALUES (5, "Track fixing");

ALTER TABLE tracksPlayed
    ADD INDEX whenPlayed (whenPlayed);

ALTER TABLE videoData
    ADD INDEX artistDisplayName (artistDisplayName),
    ADD INDEX trackDisplayName (trackDisplayName);