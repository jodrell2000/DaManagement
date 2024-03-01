#!/bin/bash

DBNAME="robotoDB"

# JSON file containing the data
JSON_FILE="../data/aliases.json"

get_command_id() {
    local table="$1"
    local command="$2"

    # Construct SQL query with placeholders
    local sql
    sql="SELECT id FROM $table WHERE command = '$command';"
    echo "SQL Query: $sql"
    
    # Execute SQL query using MySQL client
    local id
    id=$(mysql --login-path=local $DBNAME -e "$sql" -sN)
    echo "Command ID: $id"  # Add this line for debugging purposes
    echo "$id"

}

# Function to insert aliases into the database
insert_aliases() {
    local command_id="$1"
    local alias="$2"

    # Construct SQL query to insert alias
    local sql="INSERT INTO chatAliases (command_id, alias) VALUES ($command_id, '$alias');"

    # Execute SQL query using MySQL client
    echo mysql --login-path=local $DBNAME -e "$sql"
}

extract_and_insert_aliases() {
    local commands=$(jq -r '.commands' "$JSON_FILE")

    # Loop through each command
    echo "$commands" | jq -r 'to_entries[] | .key as $key | .value[] | "Key: \($key)\nValue: \(.)\n-------------------------"' | while IFS=$'\t' read -r command alias; do
        # Get the command ID
        echo "command: $command"
        local command_id
        command_id=$(get_command_id "chatCommands" "$command")
        
        echo "command_id: $command_id - alias: $alias"
        # Insert the alias into the database
        insert_aliases "$command_id" "$alias"
    done
}

debug() {
    local commands=$(jq -r '.commands' "$JSON_FILE")

    # Loop through each command
    echo "$commands" | jq -r 'to_entries[] | .key as $key | .value[] | "Key: \($key)\nValue: \(.)\n-------------------------"'
}

# Main function
main() {
  debug
}

main