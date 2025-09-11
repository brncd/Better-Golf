#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_URL = process.env.API_URL || 'http://localhost:5100';
const OUTPUT_FILE = path.join(__dirname, '../types/api.ts');

async function generateTypes() {
  try {
    console.log('🔄 Generating TypeScript types from API specification...');
    
    // Check if API is running
    try {
      execSync(`curl -s ${API_URL}/health`, { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ API is not running. Please start the API server first.');
      process.exit(1);
    }

    // Generate types using openapi-typescript
    const command = `npx openapi-typescript ${API_URL}/swagger/v1/swagger.json --output ${OUTPUT_FILE}`;
    
    console.log(`📡 Fetching OpenAPI spec from: ${API_URL}/swagger/v1/swagger.json`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ TypeScript types generated successfully!');
    console.log(`📁 Output file: ${OUTPUT_FILE}`);
    
    // Add export statement for easier imports
    const exportStatement = '\n// Re-export components for easier imports\nexport type { components } from "./api";\n';
    fs.appendFileSync(OUTPUT_FILE, exportStatement);
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error.message);
    process.exit(1);
  }
}

generateTypes();
