#!/bin/bash

DBNAME="robotoDB"

# JSON file containing the data
# JSON_FILE="../data/chat.json"
JSON_FILE="../data/testchat.json"

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

# Function to escape single quotes in a string
escape_single_quotes() {
    local value="$1"
    echo "$value" | sed "s/'/''/g"
}

# Parse chatMessages data
parse_chat_messages() {
    local chat_messages=$(jq -r '.chatMessages | keys[]' $JSON_FILE)

    for chat_message in $chat_messages; do
        local command_id=$(parse_and_insert chatCommands command "$chat_message")
        
        local messages=$(jq -r --arg cmd "$chat_message" '.chatMessages[$cmd].messages[]' $JSON_FILE)
        local images=$(jq -r --arg cmd "$chat_message" '.chatMessages[$cmd].pictures[]' $JSON_FILE)

        for message in $messages; do
            mysql --login-path=local $DBNAME -e "INSERT INTO chatMessages (command_id, message) VALUES ($command_id, '$(escape_single_quotes "$message")');"
        done

        for picture in $pictures; do
            mysql --login-path=local $DBNAME -e "INSERT INTO chatImages (command_id, imageURL) VALUES ($command_id, '$(escape_single_quotes "$picture")');"
        done
    done
}

# Main function
main() {
    parse_chat_messages
}

main
