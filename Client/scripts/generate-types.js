#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5100';
const OUTPUT_FILE = path.join(__dirname, '../types/api-generated.ts');
const SWAGGER_ENDPOINT = `${API_URL}/swagger/v1/swagger.json`;

// Function to check if API is accessible
function checkApiHealth() {
  return new Promise((resolve, reject) => {
    const client = API_URL.startsWith('https') ? https : http;
    const healthUrl = `${API_URL}/health`;
    
    const req = client.get(healthUrl, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Function to check if Swagger endpoint is accessible
function checkSwaggerEndpoint() {
  return new Promise((resolve, reject) => {
    const client = API_URL.startsWith('https') ? https : http;
    
    const req = client.get(SWAGGER_ENDPOINT, { timeout: 10000 }, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            JSON.parse(data);
            resolve(true);
          } catch (e) {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function generateTypes() {
  try {
    console.log('🔄 Generating TypeScript types from API specification...');
    console.log(`🌐 API URL: ${API_URL}`);
    
    // Check if API is running
    console.log('🔍 Checking API health...');
    const isApiHealthy = await checkApiHealth();
    
    if (!isApiHealthy) {
      console.log('⚠️  API health endpoint not accessible, checking Swagger directly...');
    }
    
    // Check Swagger endpoint
    console.log('📡 Checking Swagger endpoint...');
    const isSwaggerAccessible = await checkSwaggerEndpoint();
    
    if (!isSwaggerAccessible) {
      console.error('❌ Swagger endpoint is not accessible.');
      console.error('   Please ensure:');
      console.error('   1. The API server is running');
      console.error('   2. Swagger is enabled in the API configuration');
      console.error(`   3. The endpoint ${SWAGGER_ENDPOINT} is accessible`);
      process.exit(1);
    }
    
    console.log('✅ Swagger endpoint is accessible');
    
    // Ensure openapi-typescript is installed
    try {
      execSync('npm list openapi-typescript', { stdio: 'ignore' });
    } catch (error) {
      console.log('📦 Installing openapi-typescript...');
      execSync('npm install --save-dev openapi-typescript', { stdio: 'inherit' });
    }
    
    // Create types directory if it doesn't exist
    const typesDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    // Generate types using openapi-typescript
    const command = `npx openapi-typescript "${SWAGGER_ENDPOINT}" --output "${OUTPUT_FILE}"`;
    
    console.log(`📡 Fetching OpenAPI spec from: ${SWAGGER_ENDPOINT}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ TypeScript types generated successfully!');
    console.log(`📁 Output file: ${OUTPUT_FILE}`);
    
    // Add helpful exports and comments
    const additionalContent = `
// Auto-generated TypeScript types from Better Golf API
// Generated on: ${new Date().toISOString()}
// API URL: ${API_URL}

// Re-export components for easier imports
export type { components } from './api-generated';

// Common type aliases for convenience
export type TournamentPostDTO = components['schemas']['TournamentPostDTO'];
export type TournamentListGetDTO = components['schemas']['TournamentListGetDTO'];
export type SingleTournamentDTO = components['schemas']['SingleTournamentDTO'];
export type PlayerPostDTO = components['schemas']['PlayerPostDTO'];
export type PlayerListGetDTO = components['schemas']['PlayerListGetDTO'];
export type SinglePlayerDTO = components['schemas']['SinglePlayerDTO'];
export type CoursePostDTO = components['schemas']['CoursePostDTO'];
export type CoursesListGetDTO = components['schemas']['CoursesListGetDTO'];
export type SingleCourseDTO = components['schemas']['SingleCourseDTO'];
export type HolePostDTO = components['schemas']['HolePostDTO'];
export type HoleListGetDTO = components['schemas']['HoleListGetDTO'];
export type CategoryPostDTO = components['schemas']['CategoryPostDTO'];
export type CategoryListGetDTO = components['schemas']['CategoryListGetDTO'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type AuthResponse = components['schemas']['AuthResponse'];
`;
    
    const aliasFile = path.join(typesDir, 'api-aliases.ts');
    fs.writeFileSync(aliasFile, additionalContent);
    
    console.log(`📁 Type aliases created: ${aliasFile}`);
    console.log('');
    console.log('💡 Usage:');
    console.log('   import type { TournamentPostDTO } from "@/types/api-aliases";');
    console.log('   import type { components } from "@/types/api-generated";');
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout.toString());
    if (error.stderr) console.error('stderr:', error.stderr.toString());
    process.exit(1);
  }
}

generateTypes();
