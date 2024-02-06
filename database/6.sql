USE robotoDB;

DROP TABLE IF EXISTS videoData;
CREATE TABLE IF NOT EXISTS videoData
(
    id                CHAR(11)     NOT NULL PRIMARY KEY,
    artistName        VARCHAR(128) NOT NULL,
    trackName         VARCHAR(128) NOT NULL,
    artistDisplayName VARCHAR(128) DEFAULT "",
    trackDisplayName  VARCHAR(128) DEFAULT ""
);

ALTER TABLE tracksPlayed
    DROP INDEX yt_id,
    DROP COLUMN yt_id,
    ADD COLUMN videoData_id CHAR(11) DEFAULT NULL,
    ADD INDEX yt_id (videoData_id);
