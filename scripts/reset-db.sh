#!/bin/bash
# Reset database - WARNING: Deletes all data!

echo "⚠️  WARNING: This will DELETE all data in your database!"
echo "Press Ctrl+C to cancel, or enter to continue..."
read

# Get project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/\..*//')

echo "Resetting database for project: $PROJECT_REF"
supabase db reset --project-ref $PROJECT_REF

echo "✅ Database reset complete"