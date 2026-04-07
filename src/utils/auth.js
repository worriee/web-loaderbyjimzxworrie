import bcrypt from 'bcryptjs';

export const adminHash = "$2b$10$xQ1hUX4auSlT1q4FQlgEreDlhtf9xOyTb5IeHQNbRLF50N1Yv0zyi";

export const verifyAdminPassword = (inputPassword) => {
  return bcrypt.compareSync(inputPassword, adminHash);
};
