const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (copied from the model)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'restaurant', 'rider', 'admin'],
    default: 'student',
    required: true
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Connect to MongoDB using the provided connection string
    const MONGODB_URI = 'mongodb://localhost:27017/borrands';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB at mongodb://localhost:27017/borrands');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'rabiutemi@gmail.com' });
    if (existingUser) {
      console.log('⚠️  User with email rabiutemi@gmail.com already exists');
      console.log('User details:', {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        university: existingUser.university,
        isVerified: existingUser.isVerified,
        isActive: existingUser.isActive
      });
      return;
    }

    // Create new user
    const user = new User({
      name: 'Rabi Utemi',
      email: 'rabiutemi@gmail.com',
      password: 'Amanillah@12',
      phone: '+2348012345678',
      role: 'student',
      university: 'University of Lagos',
      isVerified: true,
      isActive: true
    });

    await user.save();
    console.log('✅ User created successfully!');
    console.log('User details:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    });

    console.log('\n📝 Login Credentials:');
    console.log('Email: rabiutemi@gmail.com');
    console.log('Password: Amanillah@12');
    console.log('Role: student');

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createUser();
