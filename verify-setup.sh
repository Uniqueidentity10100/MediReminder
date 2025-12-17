#!/bin/bash

# MediReminder Installation Verification Script
# This script checks if your environment is ready to run the application

echo "🏥 MediReminder - Installation Verification"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js is installed: $NODE_VERSION"
    
    # Check if version is 16 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 16 ]; then
        echo -e "${GREEN}✓${NC} Node.js version is compatible (16+)"
    else
        echo -e "${YELLOW}⚠${NC} Node.js version is below 16. Please upgrade."
    fi
else
    echo -e "${RED}✗${NC} Node.js is not installed. Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo ""

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm is installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm is not installed. Please install npm."
    exit 1
fi

echo ""

# Check PostgreSQL
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓${NC} PostgreSQL is installed: $PSQL_VERSION"
else
    echo -e "${RED}✗${NC} PostgreSQL is not installed. Please install PostgreSQL 13+ from https://www.postgresql.org"
    exit 1
fi

echo ""

# Check if PostgreSQL is running
echo "Checking if PostgreSQL is running..."
if pg_isready &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL is running"
else
    echo -e "${RED}✗${NC} PostgreSQL is not running. Start it with: brew services start postgresql@14"
    exit 1
fi

echo ""

# Check if database exists
echo "Checking if database 'medireminder' exists..."
if psql -lqt | cut -d \| -f 1 | grep -qw medireminder; then
    echo -e "${GREEN}✓${NC} Database 'medireminder' exists"
else
    echo -e "${YELLOW}⚠${NC} Database 'medireminder' does not exist. Creating it..."
    createdb medireminder
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Database 'medireminder' created successfully"
    else
        echo -e "${RED}✗${NC} Failed to create database. Please create it manually: createdb medireminder"
        exit 1
    fi
fi

echo ""

# Check if .env file exists
echo "Checking .env file..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check if required variables are set
    if grep -q "JWT_SECRET=your_super_secret" .env; then
        echo -e "${YELLOW}⚠${NC} WARNING: You're using the default JWT_SECRET. Please change it!"
    fi
    
    if grep -q "DB_PASSWORD=your_password_here" .env; then
        echo -e "${YELLOW}⚠${NC} WARNING: You're using the default DB_PASSWORD. Please update it!"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file does not exist. Creating from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created. Please edit it with your database credentials."
    echo -e "${YELLOW}⚠${NC} Run this script again after editing .env"
    exit 1
fi

echo ""

# Check if node_modules exist
echo "Checking dependencies..."
if [ -d "node_modules" ] && [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies are installed"
else
    echo -e "${YELLOW}⚠${NC} Dependencies not fully installed. Run: npm run install:all"
fi

echo ""

# Check if ports are available
echo "Checking if required ports are available..."

# Check port 4000
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠${NC} Port 4000 is already in use. Stop the process or change the port."
else
    echo -e "${GREEN}✓${NC} Port 4000 is available (Backend)"
fi

# Check port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠${NC} Port 3000 is already in use. Stop the process or change the port."
else
    echo -e "${GREEN}✓${NC} Port 3000 is available (Frontend)"
fi

echo ""
echo "=========================================="
echo "Verification Complete!"
echo ""
echo "Next steps:"
echo "1. If you see any warnings above, address them first"
echo "2. Make sure your .env file has the correct database credentials"
echo "3. Run 'npm run dev:full' to start the application"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo "=========================================="
