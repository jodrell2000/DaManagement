#!/bin/bash

# Load environment variables from .env file
set -o allexport
if [ -f .env ]; then
    source ../.env
fi
set +o allexport

# JSON file containing the data
JSON_FILE="../data/chat.json"

# Parse JSON data and insert into database
parse_and_insert() {
    local table="$1"
    local key="$2"
    local value="$3"

    local sql="INSERT INTO $table ($key) VALUES ('$value');"

    # Execute SQL query and return the inserted ID
    local id=$(mysql -u $DBUSERNAME -p$DBPASSWORD $DBNAME -e "$sql" -sN -e "SELECT LAST_INSERT_ID();")
    echo "$id"
}

# Parse chatMessages data
parse_chat_messages() {
    local chat_messages=$(jq -r 'keys[]' $JSON_FILE)

    for chat_message in $chat_messages; do
        local command_id=$(parse_and_insert chatCommands command "$chat_message")
        
        local messages=$(jq -r --arg cmd "$chat_message" '.chatMessages[$cmd].messages[]' $JSON_FILE)
        local images=$(jq -r --arg cmd "$chat_message" '.chatMessages[$cmd].pictures[]' $JSON_FILE)

        for message in $messages; do
            mysql -u $DBUSERNAME -p$DBPASSWORD $DBNAME -e "INSERT INTO chatMessages (command_id, message) VALUES ('$command_id', '$message');"
        done

        for picture in $pictures; do
            mysql -u $DBUSERNAME -p$DBPASSWORD $DBNAME -e "INSERT INTO chatImages (command_id, imageURL) VALUES ('$command_id', '$picture');"
        done
    done
}

# Main function
main() {
    parse_chat_messages
}

main
