import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderAvatar: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.senderId = ret.sender ? ret.sender.toString() : '';
        const date = new Date(ret.createdAt);
        ret.time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;

