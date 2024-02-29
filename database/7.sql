USE robotoDB;

CREATE TABLE tags
(
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(16),
    INDEX name (name)
);

CREATE TABLE videoData_tags
(
    videoData_id CHAR(11) NOT NULL,
    tags_id      INT      NOT NULL,
    INDEX video_tag (videoData_id, tags_id)
);

INSERT INTO tags (name)
VALUES ("wmg"),
       ("junk");

CREATE TABLE chatCommands
(
    id      INT PRIMARY KEY AUTO_INCREMENT,
    command VARCHAR(16) NOT NULL,
    UNIQUE INDEX command (command)
);

CREATE TABLE chatMessages
(
    command_id INT NOT NULL,
    message    TEXT,
    INDEX command_id (command_id)
);

CREATE TABLE chatImages
(
    command_id INT NOT NULL,
    imageURL   TEXT,
    INDEX command_id (command_id)
);

CREATE TABLE chatAliases
(
    command_id INT         NOT NULL,
    alias      VARCHAR(16) NOT NULL,
    INDEX aliasCommand (alias, command_id),
    INDEX commandAlias (command_id, alias)
)