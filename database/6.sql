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
    ADD INDEX artistDisplayName(artistDisplayName),
    ADD INDEX trackDisplayName(trackDisplayName);


# find and update videoData table with display names from existing tables
SELECT vd.id, vd.artistName, vd.artistDisplayName, a.displayName
FROM videoData vd
         JOIN tracksPlayed tp ON tp.videoData_id = vd.id
         JOIN artists a ON a.id = tp.artistID
WHERE a.displayName IS NOT NULL AND
      vd.artistDisplayName IS NULL;

UPDATE videoData vd, tracksPlayed tp, artists a
SET vd.artistDisplayName = a.displayName
WHERE tp.videoData_id = vd.id AND
      a.id = tp.artistID AND
      a.displayName IS NOT NULL;


# find and update videoData table with display names from existing tables
SELECT vd.id, vd.trackDisplayName, vd.trackName, t.displayName
FROM videoData vd
         JOIN tracksPlayed tp ON tp.videoData_id = vd.id
         JOIN tracks t ON t.id = tp.trackID
WHERE t.displayName IS NOT NULL AND
      vd.trackDisplayName IS NULL;

UPDATE videoData vd, tracksPlayed tp, tracks t
SET vd.trackDisplayName = t.displayName
WHERE tp.videoData_id = vd.id AND
      t.id = tp.trackID AND
      t.displayName IS NOT NULL AND
      vd.trackDisplayName IS NULL;


SELECT tp.videoData_id,
       v.artistName,
       v.artistDisplayName,
       v.trackName,
       v.trackDisplayName,
       max(tp.whenPlayed)
FROM tracksPlayed tp
         JOIN videoData v ON v.id = tp.videoData_id
WHERE v.artistDisplayName IS NULL OR
      v.trackDisplayName IS NULL
GROUP BY tp.videoData_id
ORDER BY MAX(tp.whenPlayed) DESC
LIMIT 50



SELECT tp.videoData_id,
       v.artistName,
       v.artistDisplayName,
       v.trackName,
       v.trackDisplayName,
       tp.whenPlayed
FROM tracksPlayed tp
         JOIN videoData v ON v.id = tp.videoData_id
WHERE v.artistDisplayName IS NULL OR v.trackDisplayName IS NULL
GROUP BY tp.videoData_id ORDER BY tp.whenPlayed DESC
LIMIT 50


SELECT u.username, u.RoboCoins, count(*) 
    FROM roboCoinAudit ra
    JOIN users u ON u.id=ra.users_id
    WHERE ra.auditType_id=5 
    GROUP BY ra.users_id;