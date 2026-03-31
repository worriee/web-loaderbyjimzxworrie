/**
 * TOTP Secret Key Generator
 * 
 * Run this once to generate a secret key for your Google Authenticator app.
 * A TOTP secret is a random Base32 string (letters A-Z and numbers 2-7).
 */

const generateSecret = (length = 20) => {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += base32Chars.charAt(Math.floor(Math.random() * base32Chars.length));
  }
  return secret;
};

const mySecret = generateSecret();

console.log('\n--- YOUR NEW SECRET KEY ---');
console.log(mySecret);
console.log('---------------------------\n');
