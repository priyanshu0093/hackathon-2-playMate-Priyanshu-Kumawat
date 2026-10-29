import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'Player' },
    skillLevel: { type: String, default: 'Intermediate' },
    team: {
      type: String,
      enum: ['Team A', 'Team B', 'Unassigned'],
      default: 'Unassigned'
    },
    attended: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Unpaid'],
      default: 'Pending'
    },
    paymentId: { type: String },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const joinRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const waitlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Match title is required'],
      trim: true
    },
    sport: {
      type: String,
      required: [true, 'Sport is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: [true, 'Match date is required'],
      index: true
    },
    time: {
      type: String,
      required: [true, 'Match time is required']
    },
    duration: {
      type: String,
      default: '1.5 hrs'
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    venue: {
      type: String,
      default: 'Community Ground'
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TurfProfile'
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    hostName: {
      type: String,
      required: true
    },
    hostAvatar: {
      type: String,
      default: ''
    },
    maxPlayers: {
      type: Number,
      required: true,
      default: 10,
      min: 2
    },
    skillLevel: {
      type: String,
      enum: ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Professional'],
      default: 'All Levels'
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    estimatedCost: {
      type: Number,
      default: 0
    },
    feePerPlayer: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Open', 'Spots Available', 'Full', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
      index: true
    },
    rules: {
      type: [String],
      default: [
        'Arrive 10 minutes prior to match time',
        'Wear appropriate sports footwear',
        'Respect referee and fellow players'
      ]
    },
    participants: [participantSchema],
    joinRequests: [joinRequestSchema],
    waitlist: [waitlistSchema],
    invitedPlayers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        invitedAt: { type: Date, default: Date.now }
      }
    ],
    teams: {
      teamA: {
        name: { type: String, default: 'Team A' },
        score: { type: Number, default: 0 },
        players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      },
      teamB: {
        name: { type: String, default: 'Team B' },
        score: { type: Number, default: 0 },
        players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }
    },
    result: {
      winner: { type: String, enum: ['Team A', 'Team B', 'Draw', 'None'], default: 'None' },
      teamAScore: { type: Number, default: 0 },
      teamBScore: { type: Number, default: 0 },
      mvp: { type: String, default: '' },
      notes: { type: String, default: '' },
      completedAt: { type: Date }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.playersJoined = ret.participants?.length || 0;
        ret.totalSpots = ret.maxPlayers;
        ret.totalCost = ret.estimatedCost;
        ret.pricePerPerson = ret.feePerPlayer;
        ret.roster = (ret.participants || []).map((p) => ({
          id: p.user ? p.user.toString() : '',
          name: p.name,
          avatar: p.avatar,
          role: p.role || 'Player',
          team: p.team || 'Unassigned',
          status: p.user?.toString() === ret.host?.toString() ? 'Host' : 'Confirmed',
          paymentStatus: p.paymentStatus,
          attended: p.attended
        }));
        ret.host = {
          id: ret.host ? ret.host.toString() : '',
          name: ret.hostName,
          avatar: ret.hostAvatar,
          rating: 4.9,
          verified: true
        };
        ret.distance = '2.5 km away';
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save hook to compute feePerPlayer and sync status
matchSchema.pre('save', function () {
  if (this.participants && this.maxPlayers) {
    if (this.participants.length >= this.maxPlayers && this.status === 'Open') {
      this.status = 'Full';
    } else if (this.participants.length < this.maxPlayers && this.status === 'Full') {
      this.status = 'Open';
    }
  }

  if (this.estimatedCost > 0 && this.maxPlayers > 0 && (!this.feePerPlayer || this.feePerPlayer === 0)) {
    this.feePerPlayer = Math.ceil(this.estimatedCost / this.maxPlayers);
  }
});

const Match = mongoose.model('Match', matchSchema);

export default Match;

