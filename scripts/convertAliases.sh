#!/bin/bash

DBNAME="robotoDB"

# JSON file containing the data
JSON_FILE="../data/aliases.json"

# Function to insert aliases into the database
insert_aliases() {
    local command="$1"
    local alias="$2"

    # Construct SQL query to insert alias
    local sql="INSERT INTO chatAliases (command, alias) VALUES ($command, '$alias');"

    # Execute SQL query using MySQL client
    echo mysql --login-path=local $DBNAME -e "$sql"
}

extract_and_insert_aliases() {
    local commands
    commands=$(jq -r '.commands' "$JSON_FILE")

    # Loop through each command
    echo "$commands" | jq -r 'to_entries[] | .key as $key | .value[] | "\($key),\(.)"' | while IFS=',' read -r command alias; do
        insert_aliases "$command" "$alias"
    done
}

# Main function
main() {
  extract_and_insert_aliases
}

main