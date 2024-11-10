#!/bin/bash

#interface="eno1"
interface=$(ip route | grep default | awk '{print $5}')
max_bandwidth=8.5  # Massima larghezza di banda in MB/s per completare il cerchio

# Ottieni i byte ricevuti all'inizio
rx_bytes_start=$(cat /sys/class/net/$interface/statistics/rx_bytes)
sleep 1
rx_bytes_end=$(cat /sys/class/net/$interface/statistics/rx_bytes)

# Calcola la velocità di download in MB/s
download_rate_mb=$(echo "scale=2; ($rx_bytes_end - $rx_bytes_start) / (1024 * 1024)" | bc)

# Calcola la percentuale
if (( $(echo "$download_rate_mb > 0" | bc -l) )); then
    percentage=$(echo "scale=2; ($download_rate_mb / $max_bandwidth) * 100" | bc)
    echo $percentage
else
    echo "0"
fi
