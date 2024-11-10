#!/bin/bash
LANG=C top -bn1 | grep Cpu | awk '{print $2}'

