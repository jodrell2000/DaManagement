#!/bin/bash

DBNAME="robotoDB"

# JSON file containing the data
JSON_FILE="../data/aliases.json"

# Function to escape single quotes in a string
escape_single_quotes() {
  local value="$1"
  echo "$value" | sed "s/'/''/g"
}

# Parse chatMessages data
parse_chat_messages() {
  local alias_data
  alias_data=$(jq -r '.aliases | keys[]' $JSON_FILE)
  
  for alias_data in $alias_data; do

    while IFS=$'\n' read -r alias; do
      echo mysql --login-path=local $DBNAME -e "SELECT id FROM chatCommands WHERE command = '$(escape_single_quotes "$command")';"
      echo mysql --login-path=local $DBNAME -e "INSERT INTO chatMessages (command_id, message) VALUES ($command, '$(escape_single_quotes "$alias")');"
    done < <(jq -r --arg cmd "$alias_data" '.aliases[$cmd].command[]' $JSON_FILE)
    
  done
}

# Main function
main() {
  parse_chat_messages
}

main