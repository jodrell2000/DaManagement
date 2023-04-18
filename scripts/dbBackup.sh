#!/bin/bash

# Set the backup directory path
backup_dir="/home/opc/git/DaManagement/dbBackups"

# Load the database credentials from the .env file
source /home/opc/git/DaManagement/.env

# Set the database name
db_name="robotoDB"

# Set the current date
current_datetime=$(date +%Y-%m-%d-%H-%M-%S)

# Set the date one month ago
one_month_ago=$(date -d "1 month ago" +%Y-%m-%d)

# Run mysqldump to backup the database
mysqldump -u $BACKUPDBUSERNAME -p$DBPASSWORD $db_name > $backup_dir/$db_name-$current_date.sql

# Delete backups that are older than one month
find $backup_dir -name "$db_name-*.sql" -type f -mtime +30 -exec rm {} \;