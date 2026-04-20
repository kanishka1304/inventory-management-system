const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/myNewDB')
  .then(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.findOneAndUpdate(
      { email: 'test@example.com' },
      { name: 'Test User', email: 'test@example.com', password: hashedPassword },
      { upsert: true }
    );
    console.log('Test user created/updated: test@example.com / password123');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
