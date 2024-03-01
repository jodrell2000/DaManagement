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

get_command_id() {
    local table="$1"
    local command="$2"

    # Construct SQL query with placeholders
    local sql
    sql="SELECT id FROM $table WHERE command = '$command';"

    # Execute SQL query using MySQL client
    local id=$(mysql --login-path=local $DBNAME -e "$sql" -sN -e "SELECT LAST_INSERT_ID();")
    echo "$id"

}

# Parse chatMessages data
parse_aliases() {
    local aliases
    commands=$(jq -r '.commands | keys[]' "$JSON_FILE")
    echo "commands: ${commands[0]}"
    
    for command_data in $commands; do
      while IFS=$'\n' read -r alias; do
          echo "command_data: $command_data"
          command_id=$(get_command_id chatCommands "$command_data")
          echo "command ID: $command_id"
          echo mysql --login-path=local $DBNAME -e "INSERT INTO chatAliases (command_id, alias) VALUES ($command_id, $alias);"
      done < <(jq -r --arg cmd "$command_data" '.commands[$cmd].[]' $JSON_FILE)
    done
}

extract_commands() {
    local commands=$(jq -r '.commands' "$JSON_FILE")

    # Loop through each command
    while IFS= read -r line; do
        local key=$(echo "$line" | jq -r 'keys[]')
        local values=$(echo "$line" | jq -r '.[] | @csv' | tr -d '"')

        # Output key and corresponding values
        echo "Key: $key"
        echo "Values: $values"
        echo "-------------------------"
    done <<<"$commands"
}

# Main function
main() {
  extract_commands
}

main