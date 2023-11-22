#!/bin/bash

if [ ! -f "docker-compose.yml" ]; then
  echo "A scriptet a gyökérmappában kell futtatni (hausz)."
  exit
fi

backup_folder="admin/mentes"

if [ ! -d "$backup_folder" ]; then
  echo "A biztonsági mentés mappa nem létezik."
  exit
fi

echo "Backing up container: 'adatbazis'..."
docker export adatbazis -o "${backup_folder}/adatbazis.tar"

echo "Backing up container: 'kiadas'..."
docker export kiadas -o "${backup_folder}/kiadas.tar"

echo "Backing up container: 'public'..."
docker export public -o "${backup_folder}/public.tar"

echo "Backing up container: 'teamspeak_adatbazis'..."
docker export teamspeak_adatbazis -o "${backup_folder}/teamspeak_adatbazis.tar"

echo "Backing up container: 'teamspeak'..."
docker export teamspeak -o "${backup_folder}/teamspeak.tar"

echo "Backup complete."