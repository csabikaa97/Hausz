#!/bin/bash

cd /home/csabikaa97/ts3audiobot

rm mukszik
touch mukszik

dotnet-runtime-22.dotnet TS3AudioBot.dll > log.txt
