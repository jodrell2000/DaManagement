USE robotoDB;

CREATE TABLE commandsToCount (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    command CHAR(16) NOT NULL
);

CREATE TABLE extendedTrackStats (
    tracksPlayed_id INT UNSIGNED NOT NULL,
    commandsToCount_id INT UNSIGNED NOT NULL,
    count INT UNSIGNED NOT NULL,
    PRIMARY KEY (tracksPlayed_id, commandsToCount_id)
);

INSERT INTO commandsToCount (command) VALUES ("props"), ("noice"), ("spin"), ("tune");
