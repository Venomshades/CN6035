// backend/verifyAdminHash.js
import mariadb from './mariadb.js';
import bcrypt from 'bcrypt';

(async () => {
  const email = 'admin@admin.com';
  const plain = '123456789';  // the password you’re testing

  // 1) Fetch the stored hash from the DB
  const [rows] = await mariadb.execute(
    'SELECT password FROM users WHERE email = ?',
    [email]
  );
  if (!rows.length) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }
  const storedHash = rows[0].password;
  console.log('Stored hash:', storedHash);

  // 2) Compare
  const match = bcrypt.compareSync(plain, storedHash);
  console.log(`Does "${plain}" match the stored hash? →`, match);

  process.exit(match ? 0 : 1);
})();
