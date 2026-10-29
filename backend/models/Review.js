import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['turf', 'player'],
      required: true,
      index: true
    },
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TurfProfile',
      index: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reviewerName: {
      type: String,
      required: true
    },
    reviewerAvatar: {
      type: String,
      default: ''
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.date = new Date(ret.createdAt).toLocaleDateString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Prevent duplicate reviews using partial filter expressions
reviewSchema.index(
  { reviewer: 1, turf: 1 },
  { unique: true, partialFilterExpression: { type: 'turf', turf: { $exists: true } } }
);
reviewSchema.index(
  { reviewer: 1, targetUser: 1, match: 1 },
  { unique: true, partialFilterExpression: { type: 'player', targetUser: { $exists: true } } }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;

