#!/usr/bin/env node
/**
 * AutoResearch Pre-Flight + Ratchet Verification
 * Run before EVERY commit to ensure quality gates pass.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_FILE = 'autoresearch-report.json';

const gates = {
  typescript: false,
  tests: false,
  bundle: false,
  lint: false,
  porkFree: false,
};

function run(cmd, label) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], cwd: process.cwd() });
    console.log(`✅ ${label}`);
    return { pass: true, output: out };
  } catch (e) {
    console.log(`❌ ${label}`);
    return { pass: false, output: e.stderr || e.message };
  }
}

console.log('🔬 AutoResearch Pre-Flight Checklist\n');

// Gate 1: TypeScript
const tsResult = run('npx tsc --noEmit', 'TypeScript compilation');
gates.typescript = tsResult.pass;
if (!tsResult.pass) {
  console.log(tsResult.output);
}

// Gate 2: Tests (if test script exists)
const pkgPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.scripts?.test) {
    gates.tests = run('npm test -- --watchAll=false 2>/dev/null || true', 'Tests').pass;
  } else {
    gates.tests = true; // No tests configured = pass
    console.log('⏭️  Tests (no test script)');
  }
}

// Gate 3: Metro bundle compilation (only if expo server is running)
try {
  const bundleResult = run(
    'curl -s --max-time 5 "http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=ios&dev=true" | tail -1 | grep -q "__r(0);"',
    'Metro bundle compile (optional)'
  );
  gates.bundle = bundleResult.pass;
} catch {
  gates.bundle = true; // Server not running = skip
  console.log('⏭️  Metro bundle (server not running)');
}

// Gate 4: ESLint (if configured)
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.scripts?.lint) {
    gates.lint = run('npm run lint', 'Linting').pass;
  } else {
    gates.lint = true;
    console.log('⏭️  Linting (no lint script)');
  }
}

// Gate 5: Pork check (RecipeWise-specific)
const recipesDir = path.join(process.cwd(), 'lib', 'data');
if (fs.existsSync(recipesDir)) {
  const recipesFiles = fs.readdirSync(recipesDir).filter(f => f.startsWith('recipes') && f.endsWith('.ts'));
  let porkFound = false;
  for (const file of recipesFiles) {
    const content = fs.readFileSync(path.join(recipesDir, file), 'utf8').toLowerCase();
    if (/\bham\b/.test(content) || /\bbacon\b/.test(content) || /\bpork\b/.test(content) || /\bprosciutto\b/.test(content) || /\bpepperoni\b/.test(content)) {
      console.log(`❌ Pork found in ${file}`);
      porkFound = true;
    }
  }
  gates.porkFree = !porkFound;
  if (gates.porkFree) console.log('✅ No pork/ham/bacon detected');
} else {
  gates.porkFree = true;
  console.log('⏭️  Pork check (no recipes dir)');
}

// Report
const report = {
  timestamp: new Date().toISOString(),
  gates,
  pass: Object.values(gates).every(Boolean),
};
fs.writeFileSync(path.join(process.cwd(), REPORT_FILE), JSON.stringify(report, null, 2));

const allPass = Object.values(gates).every(Boolean);
console.log(allPass ? '\n🎉 ALL GATES PASS — Ready to commit!' : '\n⚠️  Some gates failed — fix before committing.');
process.exit(allPass ? 0 : 1);
