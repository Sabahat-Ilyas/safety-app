#!/bin/bash

# Configuration
SERVER_URL="http://localhost:5000/api"
TEST_NAME="Verification User"
TEST_EMAIL="verify@example.com"
TEST_PASSWORD="password123"

echo "=== Starting Login Verification ==="

# 1. Attempt login with unregistered email
echo "Testing login with unregistered email..."
LOGIN_UNREG=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\", \"password\":\"$TEST_PASSWORD\"}" "$SERVER_URL/login")
echo "Response: $LOGIN_UNREG"
if [[ $LOGIN_UNREG == *"Account does not exist"* ]]; then
    echo "✅ Correctly rejected unregistered email."
else
    echo "❌ Failed to reject unregistered email."
fi

# 2. Register user
echo "Registering user..."
REG_RESP=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"name\":\"$TEST_NAME\", \"email\":\"$TEST_EMAIL\", \"password\":\"$TEST_PASSWORD\"}" "$SERVER_URL/signup")
echo "Response: $REG_RESP"

# 3. Attempt login with registered email (exact case)
echo "Testing login with registered email (exact case)..."
LOGIN_EXACT=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\", \"password\":\"$TEST_PASSWORD\"}" "$SERVER_URL/login")
echo "Response: $LOGIN_EXACT"
if [[ $LOGIN_EXACT == *"Login successful"* ]]; then
    echo "✅ Login successful with exact case."
else
    echo "❌ Login failed with exact case."
fi

# 4. Attempt login with registered email (mixed case)
echo "Testing login with registered email (mixed case)..."
MIXED_EMAIL="vERify@ExAmPlE.com"
LOGIN_MIXED=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$MIXED_EMAIL\", \"password\":\"$TEST_PASSWORD\"}" "$SERVER_URL/login")
echo "Response: $LOGIN_MIXED"
if [[ $LOGIN_MIXED == *"Login successful"* ]]; then
    echo "✅ Login successful with mixed case (normalization working)."
else
    echo "❌ Login failed with mixed case."
fi

echo "=== Verification Finished ==="
