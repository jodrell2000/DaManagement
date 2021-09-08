#!/bin/bash

export CMD="node --trace-warnings DaManagement.js" 

while true 
do
  $CMD
  echo "Restarting"
  sleep 30
done
