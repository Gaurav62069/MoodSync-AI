import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      // Agar pehle se admin h, to use Owner bana do (Upgrade)
      if (adminExists.role !== 'owner') {
          adminExists.role = 'owner';
          await adminExists.save();
          console.log('👑 Admin upgraded to Owner successfully.');
      }
      return;
    }

    // Create New Owner
    await User.create({
      username: 'MoodSync Owner',
      email: process.env.OWNER_EMAIL,
      password: process.env.OWNER_PASSWORD,
      role: 'owner', // 👈 KING ROLE
      isBlocked: false
    });

    console.log(`👑 Owner Account Created: ${process.env.ADMIN_EMAIL}`);

  } catch (error) {
    console.error(`❌ Seeding Failed: ${error.message}`);
  }
};