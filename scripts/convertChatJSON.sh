#!/bin/bash

# MySQL credentials
MYSQL_USER="$DBUSERNAME"
MYSQL_PASSWORD="$DBPASSWORD"
MYSQL_DATABASE="$DBNAME"

# JSON file containing the data
JSON_FILE="data.json"

# Parse JSON data and insert into database
parse_and_insert() {
    local table="$1"
    local key="$2"
    local value="$3"

    local sql="INSERT INTO $table ($key) VALUES ('$value');"

    # Execute SQL query and return the inserted ID
    local id=$(mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "$sql" -sN -e "SELECT LAST_INSERT_ID();")
    echo "$id"
}

# Parse chatMessages data
parse_chat_messages() {
    local chat_messages=$(jq -r 'keys[]' $JSON_FILE)

    for chat_message in $chat_messages; do
        local command_id=$(parse_and_insert chatCommands command "$chat_message")
        
        local messages=$(jq -r --arg cmd "$chat_message" '.chatMessages[$cmd].messages[]' $JSON_FILE)
        local pictures=$(jq -r --arg cmd "$chat_message" '.chatMessages[$cmd].pictures[]' $JSON_FILE)

        for message in $messages; do
            local message_id=$(parse_and_insert chatMessages message "$message")
            mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "INSERT INTO chatMessages (command_id, message_id) VALUES ('$command_id', '$message_id');"
        done

        for picture in $pictures; do
            local picture_id=$(parse_and_insert chatPictures pictureURL "$picture")
            mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "INSERT INTO chatPictures (command_id, picture_id) VALUES ('$command_id', '$picture_id');"
        done
    done
}

# Main function
main() {
    parse_chat_messages
}

main
