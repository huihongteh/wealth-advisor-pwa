// scripts/hashPassword.js
const bcrypt = require('bcrypt');
const plainPassword = process.argv[2]; // Get password from command line argument

if (!plainPassword) {
  console.error("Usage: node scripts/hashPassword.js <your_password>");
  process.exit(1);
}

const saltRounds = 10; // Recommended salt rounds

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log('Plain Password:', plainPassword);
    console.log('Hashed Password:', hash);
});