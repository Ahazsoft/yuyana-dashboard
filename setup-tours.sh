#!/bin/bash

# Setup script to extract tours from yuyana-travel, copy images, and import tours

echo "Setting up tours data..."

# First, extract tour data from yuyana-travel
echo "Extracting tour data from yuyana-travel..."
cd ../yuyana-travel
npm install
npm run extract

# Go back to dashboard directory
cd ../yuyana-dashboard

# Create public directory if it doesn't exist
mkdir -p ./public/images
mkdir -p ./public/documents

# Copy images from yuyana-travel to public directory
echo "Copying images..."
cp -r ../yuyana-travel/assets/images/tour/* ./public/images/ 2>/dev/null || echo "No images found in yuyana-travel/assets/images/tour/"

# Copy other possible image locations
cp -r ../yuyana-travel/assets/images/* ./public/images/ 2>/dev/null || echo "No other images found in yuyana-travel/assets/images/"

# Copy documents if any
cp -r ../yuyana-travel/assets/documents/* ./public/documents/ 2>/dev/null || echo "No documents found in yuyana-travel/assets/documents/"

echo "Images and documents copied successfully!"

# Import tours to database
echo "Importing tours to database..."
npx tsx scripts/import-tours-to-db.ts

echo "Setup completed successfully!"