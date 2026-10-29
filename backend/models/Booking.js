import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TurfProfile',
      required: [true, 'Turf venue is required'],
      index: true
    },
    turfName: {
      type: String,
      required: true
    },
    turfCity: {
      type: String,
      default: 'Bangalore'
    },
    turfLocation: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Turf owner is required'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking user is required'],
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userPhone: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: [true, 'Booking date is required (YYYY-MM-DD)'],
      index: true
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot string is required']
    },
    slotId: {
      type: String,
      required: [true, 'Slot ID is required'],
      index: true
    },
    sport: {
      type: String,
      default: 'Football'
    },
    court: {
      type: String,
      default: 'Main Court / Turf'
    },
    amount: {
      type: Number,
      required: [true, 'Booking amount is required'],
      min: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed'],
      default: 'Confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Reserved', 'Failed'],
      default: 'Paid'
    },
    paymentMode: {
      type: String,
      enum: ['online', 'manual', 'demo'],
      default: 'demo'
    },
    paymentId: {
      type: String,
      default: () => `PAY_${Date.now()}`
    },
    bookingRef: {
      type: String,
      default: () => `PM-BKG-${Math.floor(1000 + Math.random() * 9000)}`
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date
    },
    rescheduledFrom: {
      date: String,
      slotId: String,
      timeSlot: String
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.groundId = ret.turf ? ret.turf.toString() : '';
        ret.groundName = ret.turfName;
        ret.userId = ret.user ? ret.user.toString() : '';
        ret.totalAmount = ret.amount;
        ret.splitShare = ret.amount;
        ret.participantsCount = 1;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index to speed up availability queries & prevent double bookings
bookingSchema.index({ turf: 1, date: 1, slotId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

