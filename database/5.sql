USE robotoDB;

CREATE TABLE IF NOT EXISTS roboCoinAudit (
  users_id CHAR(24) NOT NULL,
  beforeChange INT NOT NULL,
  afterChange INT NOT NULL,
  numCoins INT NOT NULL,
  changeReason VARCHAR(128) NOT NULL,
  changeTime DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roboCoinAuditTypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reason VARCHAR(128) NOT NULL
);

INSERT INTO roboCoinAuditTypes (id, reason) VALUES
(1, "Welcome Gift"),
(2, "User Gift");

ALTER TABLE roboCoinAudit
ADD COLUMN auditType_id INT;

ALTER TABLE roboCoinAudit
ADD INDEX userReason (users_id, auditType_id);

ALTER TABLE artists
DROP COLUMN `displayArtistsID`,
ADD COLUMN `displayName` text;

ALTER TABLE tracks
DROP COLUMN `displayTracksID`,
ADD COLUMN `displayName` text;
