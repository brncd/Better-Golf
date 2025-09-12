#!/bin/bash

# Better Golf - Automated Type Synchronization Script
# This script ensures client types stay synchronized with the API

set -e

API_URL="${API_URL:-http://localhost:5100}"
CLIENT_DIR="$(dirname "$0")/.."
TYPES_DIR="$CLIENT_DIR/types"

echo "🔄 Better Golf Type Synchronization"
echo "=================================="
echo "API URL: $API_URL"
echo "Client Dir: $CLIENT_DIR"
echo ""

# Function to check if API is running
check_api() {
    echo "🔍 Checking API availability..."
    if curl -s --max-time 5 "$API_URL/health" > /dev/null 2>&1; then
        echo "✅ API is running"
        return 0
    else
        echo "❌ API is not running at $API_URL"
        echo "   Please start the API server first:"
        echo "   cd ../Api && dotnet run"
        return 1
    fi
}

# Function to backup existing types
backup_types() {
    if [ -f "$TYPES_DIR/index.ts" ]; then
        echo "📦 Backing up existing types..."
        cp "$TYPES_DIR/index.ts" "$TYPES_DIR/index.ts.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backup created"
    fi
}

# Function to generate new types
generate_types() {
    echo "🔄 Generating types from API..."
    cd "$CLIENT_DIR"
    node scripts/generate-types.js
}

# Function to validate generated types
validate_types() {
    echo "🔍 Validating generated types..."
    cd "$CLIENT_DIR"
    
    if [ -f "$TYPES_DIR/api-generated.ts" ] && [ -f "$TYPES_DIR/api-aliases.ts" ]; then
        echo "✅ Type files generated successfully"
        
        # Run TypeScript check
        if npm run type-check > /dev/null 2>&1; then
            echo "✅ TypeScript validation passed"
            return 0
        else
            echo "⚠️  TypeScript validation failed - check for type conflicts"
            return 1
        fi
    else
        echo "❌ Type generation failed"
        return 1
    fi
}

# Function to update imports (optional)
update_imports() {
    echo "🔄 Updating type imports..."
    
    # Create a migration guide
    cat > "$TYPES_DIR/MIGRATION_GUIDE.md" << EOF
# Type Migration Guide

## Generated Types Available

The following types are now auto-generated from the API:

### Import from api-aliases.ts (recommended):
\`\`\`typescript
import type { 
  TournamentPostDTO,
  TournamentListGetDTO,
  SingleTournamentDTO,
  PlayerPostDTO,
  // ... other types
} from '@/types/api-aliases';
\`\`\`

### Import from api-generated.ts (advanced):
\`\`\`typescript
import type { components } from '@/types/api-generated';
type TournamentPostDTO = components['schemas']['TournamentPostDTO'];
\`\`\`

## Migration Steps

1. Replace manual type definitions with generated ones
2. Update imports to use api-aliases.ts
3. Run \`npm run type-check\` to verify
4. Test the application thoroughly

## Generated Files

- \`api-generated.ts\` - Raw OpenAPI generated types
- \`api-aliases.ts\` - Convenient type aliases
- \`index.ts\` - Your existing manual types (backup available)

EOF
    
    echo "✅ Migration guide created at $TYPES_DIR/MIGRATION_GUIDE.md"
}

# Main execution
main() {
    if ! check_api; then
        exit 1
    fi
    
    backup_types
    
    if generate_types; then
        if validate_types; then
            update_imports
            echo ""
            echo "🎉 Type synchronization completed successfully!"
            echo ""
            echo "📋 Next steps:"
            echo "1. Review generated types in types/api-generated.ts"
            echo "2. Use convenient aliases from types/api-aliases.ts"
            echo "3. Read types/MIGRATION_GUIDE.md for migration help"
            echo "4. Run 'npm run type-check' to verify integration"
            echo ""
        else
            echo "⚠️  Type generation completed but validation failed"
            echo "   Please check the generated types manually"
            exit 1
        fi
    else
        echo "❌ Type generation failed"
        exit 1
    fi
}

# Run with error handling
if ! main; then
    echo ""
    echo "❌ Type synchronization failed"
    echo "   Check the error messages above for details"
    exit 1
fi
