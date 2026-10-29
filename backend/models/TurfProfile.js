import mongoose from 'mongoose';

const contactDetailsSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const turfProfileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters long'],
      maxlength: [150, 'Business name cannot exceed 150 characters']
    },
    contactDetails: {
      type: contactDetailsSchema,
      default: () => ({})
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 }
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: 'Verification status must be pending, verified, or rejected'
      },
      default: 'pending',
      index: true
    },

    // Extensible fields for sports facility operations
    tagline: {
      type: String,
      trim: true,
      default: 'Modern Sports Venue'
    },
    category: {
      type: String,
      default: 'Multi-sport Turf'
    },
    sports: {
      type: [String],
      default: ['Football']
    },
    hourlyRate: {
      type: Number,
      default: 1500,
      min: 0
    },
    images: {
      type: [String],
      default: []
    },
    amenities: {
      type: [String],
      default: ['High-Power Floodlights', 'Free Parking', 'Changing Rooms & Showers']
    },
    description: {
      type: String,
      default: ''
    },
    openingHour: {
      type: String,
      default: '06:00'
    },
    closingHour: {
      type: String,
      default: '23:00'
    },
    slotDurationMinutes: {
      type: Number,
      default: 90
    },
    slots: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    blockedSlots: {
      type: [
        {
          date: { type: String, required: true },
          slotId: { type: String, required: true },
          reason: { type: String, default: 'Maintenance' },
          blockedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1.0,
      max: 5.0
    },
    reviewsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.name = ret.businessName; // Alias for frontend compatibility
        ret.supportedSports = ret.sports; // Alias for frontend compatibility
        ret.heroImage = ret.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80';
        ret.gallery = ret.images || [];
        ret.hourlyPrice = ret.hourlyRate;
        ret.location = ret.address;
        ret.distance = '1.2 km away';
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

turfProfileSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.name = obj.businessName;
  obj.supportedSports = obj.sports;
  obj.heroImage = obj.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80';
  obj.gallery = obj.images || [];
  obj.hourlyPrice = obj.hourlyRate;
  obj.location = obj.address;
  obj.distance = '1.2 km away';
  delete obj._id;
  delete obj.__v;
  return obj;
};

const TurfProfile = mongoose.model('TurfProfile', turfProfileSchema);

export default TurfProfile;
