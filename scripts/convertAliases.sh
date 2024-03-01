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
    
    # Execute SQL query using MySQL client
    local id
    id=$(mysql --login-path=local $DBNAME -e "$sql" -sN)
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
    echo "$commands" | jq -r 'to_entries[] | .key as $key | .value[] | "\($key),\(.)"' | while IFS=',' read -r command alias; do
        # Get the command ID
        local command_id
        command_id=$(get_command_id "chatCommands" "$command")
        
        # Insert the alias into the database
        insert_aliases "$command_id" "$alias"
    done
}

# Main function
main() {
  extract_and_insert_aliases
}

main