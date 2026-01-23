#!/usr/bin/env bash
# Exit on error
set -e

echo "========================================="
echo "Building TiniThink Backend..."
echo "========================================="

# Make mvnw executable (if not already)
chmod +x mvnw

# Clean and build the project
./mvnw clean package -DskipTests

echo "========================================="
echo "Build Complete!"
echo "========================================="