import crypto from 'crypto';

/**
 * Utility to generate high-entropy randomized tokens for secure routing.
 * Usage: node src/utils/tokenGenerator.js
 */
const generateSecureToken = (length = 16) => {
  return crypto.randomBytes(length / 2).toString('hex');
};

const tokenMap = {
  'Student Registration': generateSecureToken(),
  'Employee Registration': generateSecureToken(),
  'Guest Registration': generateSecureToken(),
  'Student Attendance': generateSecureToken(),
  'Employee Attendance': generateSecureToken(),
  'General Survey': generateSecureToken(),
};

console.log('\n==========================================');
console.log('SYNERGY SECURE ROUTE TOKENS');
console.log('==========================================\n');

Object.entries(tokenMap).forEach(([name, token]) => {
  console.log(`${name.padEnd(25)} : ${token}`);
});

console.log('\n==========================================');
console.log('DIRECTIONS:');
console.log('1. Copy these tokens into backend/src/config/secureRoutes.ts');
console.log('2. Provide the full URLs to the mobile developer.');
console.log('==========================================\n');
