#!/bin/bash

# Get NVIDIA GPU memory usage using nvidia-smi
memory_used=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits)
memory_total=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits)

# Calculate memory usage percentage
memory_percentage=$(echo "scale=2; (${memory_used} / ${memory_total}) * 100" | bc)

# Print output as a number between 0 and 100
echo ${memory_percentage}