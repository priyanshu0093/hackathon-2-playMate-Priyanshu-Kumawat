import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderName: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: [
        'match_invite',
        'join_request',
        'request_approved',
        'request_rejected',
        'booking_confirmed',
        'booking_cancelled',
        'booking_pending',
        'booking_rejected',
        'match_reminder',
        'team_assigned',
        'general'
      ],
      default: 'general'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    actionLink: {
      type: String,
      default: ''
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.unread = !ret.read;
        ret.time = 'Just now';
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

