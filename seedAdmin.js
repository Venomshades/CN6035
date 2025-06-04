// backend/hash-admin.js
import bcrypt from 'bcrypt';

const pwd  = '123456789';
const hash = bcrypt.hashSync(pwd, 10);

console.log('HASH:', hash);
console.log('COMPARE (should be true):', bcrypt.compareSync(pwd, hash));
