#!/bin/bash

DBNAME="robotoDB"

# JSON file containing the data
JSON_FILE="../data/chat.json"

# Parse JSON data and insert into database
parse_and_insert() {
    local table="$1"
    local key="$2"
    local value="$3"

    local sql="INSERT INTO $table ($key) VALUES ('$value');"

    # Execute SQL query and return the inserted ID
    local id=$(mysql --login-path=local $DBNAME -e "$sql" -sN -e "SELECT LAST_INSERT_ID();")
    echo "$id"
}

# Parse chatMessages data
parse_chat_messages() {
  local messageSQL="INSERT INTO chatMessages (command_id, message) VALUES (?, ?);"
  local imagesSQL="INSERT INTO chatImages (command_id, imageURL) VALUES (?, ?);"
    local chat_data
    chat_data=$(jq -r '.chatMessages | keys[]' $JSON_FILE)

    for command_data in $chat_data; do
        local command_id
        command_id=$(parse_and_insert chatCommands command "$command_data")

        local messages
        messages=$(jq -r --arg cmd "$command_data" '.chatMessages[$cmd].messages[]' $JSON_FILE)
        local images
        images=$(jq -r --arg cmd "$command_data" '.chatMessages[$cmd].pictures[]' $JSON_FILE)

        IFS=$'\n' read -r -a messages_array <<< "$messages"

        for message in "${messages_array[@]}"; do
            mysql --login-path=local -D $DBNAME -B -e \
                                                          "PREPARE stmt FROM '$messageSQL'; \
                                                          SET @command_id='$command_id', @message='$message'; \
                                                          EXECUTE stmt USING @command_id, @message; \
                                                          DEALLOCATE PREPARE stmt;"
        done

        for image in $images; do
            mysql --login-path=local -D $DBNAME -e \
                                                          "PREPARE stmt FROM '$imagesSQL'; \
                                                          SET @command_id='$command_id', @image='$image'; \
                                                          EXECUTE stmt USING @command_id, @image; \
                                                          DEALLOCATE PREPARE stmt;"
        done
    done
}

# Main function
main() {
    parse_chat_messages
}

main