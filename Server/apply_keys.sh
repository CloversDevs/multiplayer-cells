#!/bin/bash

# Check if both arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 VARIABLE_NAME OUTPUT_PATH"
    exit 1
fi

# Check if the .env file exists
if [ ! -f .env ]; then
    echo ".env file not found!"
    exit 1
fi

# Find the variable value
value=$(grep "^$1=" .env | cut -d '=' -f2-)

# Check if the variable was found
if [ -z "$value" ]; then
    echo "Variable '$1' not found in .env file!"
    exit 1
fi

# Create the output directory if it doesn't exist
mkdir -p "$(dirname "$2")"

# Create the .ts file with the export statement
echo "export const $1 = '$value';" > "$2"

echo "File created at $2 with content:"
cat "$2"