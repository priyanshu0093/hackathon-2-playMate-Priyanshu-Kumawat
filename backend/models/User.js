import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && this.authProvider !== 'google';
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Exclude from query results by default
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      index: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true
    },
    role: {
      type: String,
      enum: {
        values: ['player', 'turf_owner'],
        message: 'Role must be either player or turf_owner'
      },
      default: 'player',
      required: true,
      index: true
    },
    avatar: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: 'Bangalore',
      trim: true,
      index: true
    },
    preferredSports: {
      type: [String],
      default: ['Football', 'Badminton']
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'All Levels', ''],
      default: 'Intermediate'
    },
    playingRole: {
      type: String,
      default: 'Midfielder',
      trim: true
    },
    preferredPositions: {
      type: [String],
      default: ['Midfielder', 'Forward']
    },
    preferredLocations: {
      type: [String],
      default: []
    },
    availability: {
      days: {
        type: [String],
        default: ['Saturday', 'Sunday', 'Friday']
      },
      timeSlots: {
        type: [String],
        default: ['Evening (5 PM - 9 PM)', 'Morning (6 AM - 9 AM)']
      }
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1.0,
      max: 5.0
    },
    ratingsCount: {
      type: Number,
      default: 1
    },
    matchesPlayed: {
      type: Number,
      default: 0,
      min: 0
    },
    stats: {
      played: { type: Number, default: 0 },
      won: { type: Number, default: 0 },
      lost: { type: Number, default: 0 },
      hosted: { type: Number, default: 0 },
      mvpCount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

// Method to verify password against bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON representation helper
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
