#!/bin/bash

# Script to add logo column to restaurants table

echo "🔧 Adding logo column to restaurants table..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
elif [ -f env.local ]; then
    export $(cat env.local | grep -v '^#' | xargs)
fi

# Extract database connection details
DB_HOST="${DB_HOST:-borrands.com.ng}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-borrands_Orderup}"
DB_USERNAME="${DB_USERNAME:-borrands_Temi}"
DB_PASSWORD="${DB_PASSWORD:-Amanillah12}"

echo "Connecting to: $DB_HOST:$DB_PORT/$DB_DATABASE"
echo "User: $DB_USERNAME"

# Check if column exists first
COLUMN_EXISTS=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -N -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='$DB_DATABASE' AND TABLE_NAME='restaurants' AND COLUMN_NAME='logo';" 2>/dev/null)

if [ "$COLUMN_EXISTS" = "1" ]; then
    echo "✅ Logo column already exists!"
else
    echo "Adding logo column..."
    # Run the migration
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" <<EOF
ALTER TABLE \`restaurants\` 
ADD COLUMN \`logo\` VARCHAR(191) NULL AFTER \`image\`;
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Logo column added successfully!"
    else
        echo "❌ Failed to add logo column."
        exit 1
    fi
fi

# Verify column exists
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e "SHOW COLUMNS FROM restaurants LIKE 'logo';" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Logo column added successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Stop your Next.js dev server (Ctrl+C)"
    echo "2. Run: rm -rf .next"
    echo "3. Run: npx prisma generate"
    echo "4. Restart: npm run dev"
else
    echo "❌ Failed to add logo column. Please check your database connection and permissions."
    exit 1
fi
