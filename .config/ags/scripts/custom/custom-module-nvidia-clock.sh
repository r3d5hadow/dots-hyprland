#!/bin/bash

# Get NVIDIA GPU clock speed using nvidia-smi
clock_speed=$(nvidia-smi --query-gpu=clocks.sm --format=csv,noheader,nounits)

# Calculate clock speed percentage (assuming max clock speed is 2000MHz)
max_clock_speed=2000
clock_percentage=$(echo "scale=2; (${clock_speed} / ${max_clock_speed}) * 100" | bc)

# Print output as a number between 0 and 100
echo ${clock_percentage}