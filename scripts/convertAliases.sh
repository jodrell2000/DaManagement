#!/bin/bash

DBNAME="robotoDB"

# JSON file containing the data
JSON_FILE="../data/aliases.json"

# Parse JSON data and insert into database
parse_and_insert() {
    local table="$1"
    local key="$2"
    local value="$3"

    # Construct SQL query with placeholders
    local sql
    sql="INSERT INTO $table ($key) VALUES ('$value');"

    # Execute SQL query using MySQL client
    echo mysql --login-path=local $DBNAME -e "$sql"
}

# Parse chatMessages data
parse_aliases() {
    local aliases
    commands=$(jq -r '.commands | keys[]' "$JSON_FILE")
    echo "commands: ${aliases[0]}"
    # Loop through each alias
    while IFS= read -r line; do
        local alias
        alias=$(echo "$line" | jq -r 'keys[]')
        local command
        command=$(echo "$line" | jq -r '.[]')

        # Insert alias and command into database
        parse_and_insert aliases_table "$alias" "$command"
    done <<<"$aliases"
}

# Main function
main() {
  parse_aliases
}

main