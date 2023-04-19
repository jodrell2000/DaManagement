CREATE DATABASE IF NOT EXISTS robotoDB;

USE robotoDB;

DROP TABLE IF EXISTS versions;
CREATE TABLE versions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  versionNo INT UNSIGNED NOT NULL
);
INSERT INTO versions (versionNo) VALUES (1);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id CHAR(24) NOT NULL PRIMARY KEY,
  userInfo JSON NOT NULL,
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
  RoboCoins INT,
  here CHAR(5) NOT NULL
);
