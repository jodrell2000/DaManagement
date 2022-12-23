USE robotoDB;

CREATE TABLE users (
  id CHAR(24) NOT NULL PRIMARY KEY,
  username CHAR(100) NOT NULL,
  moderator CHAR(5) NOT NULL,
  joinTime BIGINT,
  currentDJ CHAR(5) NOT NULL,
  lastVoted BIGINT,
  lastSpoke BIGINT,
  currentPlayCount INT,
  totalPlayCount INT,
  joinedStage BIGINT,
  firstIdleWarning CHAR(5) NOT NULL,
  secondIdleWarning CHAR(5) NOT NULL,
  spamCount INT,
  lastSnagged BIGINT,
  region CHAR(2),
  BBBootTimestamp BIGINT,
  noiceCount INT,
  propsCount INT,
  RoboPoints INT,
  RoboCoins INT,
  here CHAR(5) NOT NULL
);

604154083f4bfc001c3a42ed