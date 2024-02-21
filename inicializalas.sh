#!/bin/bash

echo "[    ] Válaszd ki a futtatási környezetet:"
echo "          1 docker-compose"
echo "          2 kubernetes"

while true; do
    read -p "[    ] Válasz: " input

    if [ $input -eq 1 ]
    then
        set -e
        echo "[    ] Repo inicializása docker-compose környezethez..."
        declare -a forras_fajlok=("konfiguracio.toml" "mentes_privat.sh" "privat_kiadasa.sh" "privat_konfiguracio.toml" "szurendo_szavak.ts" "privat_csomagolasa.sh")
        declare -a cel_utvonalak=("konfiguracio.toml" "admin/mentes_privat.sh" "forras/kiadas/privat_kiadasa.sh" "privat_konfiguracio.toml" "priv/szurendo_szavak.ts" "forras/csomagolas/privat_csomagolasa.sh")
        break
    elif [ $input -eq 2 ]
    then
        set -e
        echo "[    ] Repo inicializása kubernetes környezethez..."
        declare -a forras_fajlok=("k8s_konfiguracio.toml" "mentes_privat.sh" "privat_kiadasa.sh" "privat_konfiguracio.toml" "szurendo_szavak.ts" "privat_csomagolasa.sh")
        declare -a cel_utvonalak=("konfiguracio.toml" "admin/mentes_privat.sh" "forras/kiadas/privat_kiadasa.sh" "privat_konfiguracio.toml" "priv/szurendo_szavak.ts" "forras/csomagolas/privat_csomagolasa.sh")
        break
    else
        echo "[HIBA] Hibas bemenet!"
    fi
done

EREDETI_MAPPA="admin/inicializalas"

for i in "${!forras_fajlok[@]}"; do
    echo "[    ] ${forras_fajlok[$i]}"
    echo "[    ] => ./${cel_utvonalak[$i]}"
    if [ -f "${cel_utvonalak[$i]}" ]; then
        echo "[INFO] A fájl már létezik (./${cel_utvonalak[$i]})"
    else
        cp "$EREDETI_MAPPA/${forras_fajlok[$i]}" "${cel_utvonalak[$i]}"
    fi
done