#!/usr/bin/env node

/**
 * Vercel Deployment Setup Script for mon.royaltyrepair.org
 * 
 * This script automates:
 * 1. Project linking to Vercel
 * 2. Domain configuration
 * 3. Environment variable setup
 * 4. Initial deployment
 * 
 * Usage: node scripts/setup-vercel.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function run(command, description) {
  try {
    console.log(`\n✓ ${description}`);
    console.log(`  Running: ${command}`);
    const output = execSync(command, { encoding: 'utf-8' });
    console.log(`  ${output.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.error(`✗ Error: ${description}`);
    console.error(`  ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   Vercel Deployment Setup for mon.royaltyrepair.org');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Check Vercel CLI
  console.log('📦 Step 1: Checking Vercel CLI...');
  try {
    const version = execSync('vercel --version', { encoding: 'utf-8' });
    console.log(`✓ Vercel CLI ${version.trim()} found\n`);
  } catch (error) {
    console.error('✗ Vercel CLI not found. Install with: npm i -g vercel');
    process.exit(1);
  }

  // Step 2: Verify project structure
  console.log('📁 Step 2: Verifying project structure...');
  const requiredFiles = ['package.json', 'next.config.js', 'src/app/page.tsx'];
  const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  
  if (missingFiles.length === 0) {
    console.log('✓ Project structure verified\n');
  } else {
    console.warn(`⚠ Missing files: ${missingFiles.join(', ')}`);
    console.warn('  This project may not be a Next.js app\n');
  }

  // Step 3: Link to Vercel
  console.log('🔗 Step 3: Linking project to Vercel...');
  const projectName = await question('\nEnter project name (default: montfort-mon): ') || 'montfort-mon';
  
  if (!run(`vercel link --cwd . --name ${projectName} --yes`, `Linking to Vercel project "${projectName}"`)) {
    const manualLink = await question('\n❓ Would you like to continue with manual setup? (y/n): ');
    if (manualLink.toLowerCase() !== 'y') {
      console.log('\n✗ Setup cancelled');
      rl.close();
      process.exit(1);
    }
  }

  // Step 4: Configure domain
  console.log('\n🌐 Step 4: Configuring domain...');
  const domain = 'mon.royaltyrepair.org';
  console.log(`\nDomain to configure: ${domain}`);
  const confirmDomain = await question('Proceed? (y/n): ');
  
  if (confirmDomain.toLowerCase() === 'y') {
    run(`vercel domains add ${domain}`, `Adding domain ${domain}`);
  }

  // Step 5: Environment variables
  console.log('\n🔐 Step 5: Setting environment variables...');
  const setupEnv = await question('\nAdd environment variables? (y/n): ');
  
  if (setupEnv.toLowerCase() === 'y') {
    const envVars = [
      { key: 'NEXT_PUBLIC_APP_ENV', value: 'production' },
      { key: 'NEXT_PUBLIC_API_URL', value: 'https://mon.royaltyrepair.org' }
    ];

    for (const env of envVars) {
      const customValue = await question(`${env.key} (default: ${env.value}): `) || env.value;
      run(`vercel env add ${env.key} ${customValue}`, `Setting ${env.key}`);
    }
  }

  // Step 6: Verify build
  console.log('\n🔨 Step 6: Building project...');
  if (run('npm run build', 'Building Next.js project')) {
    console.log('✓ Build successful\n');
  } else {
    console.warn('⚠ Build failed. Check errors above.\n');
  }

  // Step 7: Deploy
  console.log('🚀 Step 7: Deployment options');
  const deployChoice = await question('\nDeploy now? (dev/prod/skip): ') || 'skip';
  
  if (deployChoice.toLowerCase() === 'dev') {
    console.log('\n📍 Starting development server...');
    run('vercel dev', 'Starting Vercel dev');
  } else if (deployChoice.toLowerCase() === 'prod') {
    console.log('\n🌍 Deploying to production...');
    run('vercel deploy --prod --confirm', 'Deploying to production');
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✓ Setup Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 Next Steps:');
  console.log(`  1. Add DNS CNAME record: mon → cname.vercel.com`);
  console.log(`  2. Wait for DNS propagation (up to 48 hours)`);
  console.log(`  3. Visit: https://mon.royaltyrepair.org`);
  console.log(`  4. Check deployment: vercel deploy --prod\n`);
  console.log('📚 Resources:');
  console.log('  • Vercel Docs: https://vercel.com/docs');
  console.log('  • DNS Setup: https://vercel.com/docs/projects/domains');
  console.log('  • CLI Docs: https://vercel.com/docs/cli\n');

  rl.close();
}

main().catch(error => {
  console.error('\n✗ Setup failed:', error);
  rl.close();
  process.exit(1);
});
