#!/bin/bash

export CMD="node DaManagement.js" 

while true 
do
  $CMD
  echo "Restarting"
  sleep 30
done
