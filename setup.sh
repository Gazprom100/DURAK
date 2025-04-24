#!/bin/bash

echo "🃏 Setting up DURAK card game..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create essential directories if they don't exist
mkdir -p public/images

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  echo "🔄 Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit: DURAK card game setup"
fi

# Run development server
echo "🚀 Starting development server..."
npm run dev 