USE robotoDB;

CREATE TABLE IF NOT EXISTS roboCoinAudit (
  users_id CHAR(24) NOT NULL,
  before INT NOT NULL,
  after INT NOT NULL,
  numCoins INT NOT NULL,
  changeReason VARCHAR(128) NOT NULL,
  changeTime DATETIME DEFAULT CURRENT_TIMESTAMP
);
