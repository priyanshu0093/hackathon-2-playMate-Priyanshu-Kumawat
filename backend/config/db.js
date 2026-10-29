import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playmate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed initial demo accounts, venues, matches and bookings into MongoDB
    await seedInitialData();

    return conn;
  } catch (error) {
    console.error(`[Database Connection Error]: ${error.message}`);
  }
};

/**
 * Seed initial accounts and resources if MongoDB collections are empty.
 */
async function seedInitialData() {
  try {
    const { default: User } = await import('../models/User.js');
    const { default: TurfProfile } = await import('../models/TurfProfile.js');
    const { default: Match } = await import('../models/Match.js');
    const { default: Booking } = await import('../models/Booking.js');
    const { default: Notification } = await import('../models/Notification.js');
    const { default: ChatMessage } = await import('../models/ChatMessage.js');

    const userCount = await User.countDocuments();
    let player, ownerBangalore, ownerPune;

    const demoPasswordHash = await bcrypt.hash('playmate123', 10);

    if (userCount === 0) {
      console.log('[Database] Seeding initial verified demo accounts into MongoDB...');

      // 1. Demo Player: Alex Morgan
      player = await User.create({
        name: 'Alex Morgan',
        email: 'alex.morgan@playmate.io',
        password: demoPasswordHash,
        role: 'player',
        city: 'Bangalore',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        preferredSports: ['Football', 'Badminton', 'Cricket'],
        skillLevel: 'Intermediate',
        playingRole: 'Midfielder',
        preferredPositions: ['Midfielder', 'Striker'],
        preferredLocations: ['Indiranagar', 'Koramangala'],
        phone: '+91 98765 43210',
        bio: 'Midfielder on the pitch, aggressive badminton smasher on weekends. Always down for competitive & friendly games!',
        rating: 4.9,
        ratingsCount: 14,
        matchesPlayed: 42,
        stats: { played: 42, won: 28, lost: 14, hosted: 12, mvpCount: 6 }
      });

      // 2. Demo Turf Owner: Sunil Rao (Bangalore)
      ownerBangalore = await User.create({
        name: 'Sunil Rao',
        email: 'sunil@kickoffarena.com',
        password: demoPasswordHash,
        role: 'turf_owner',
        city: 'Bangalore',
        phone: '+91 99887 76655',
        bio: 'Passionate sports facility operator dedicated to community athletics.',
        rating: 5.0,
        ratingsCount: 32,
        matchesPlayed: 0
      });

      // 3. Demo Turf Owner: Vikram Patil (Pune)
      ownerPune = await User.create({
        name: 'Vikram Patil',
        email: 'vikram@puneturf.com',
        password: demoPasswordHash,
        role: 'turf_owner',
        city: 'Pune',
        phone: '+91 98230 11223',
        bio: 'Facility director at Shivajinagar Pro Turf Arena.',
        rating: 5.0,
        ratingsCount: 19,
        matchesPlayed: 0
      });

      // Additional sample players for match rosters & player discovery
      await User.create([
        {
          name: 'Rohan Sharma',
          email: 'rohan.sharma@example.com',
          password: demoPasswordHash,
          role: 'player',
          city: 'Bangalore',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
          preferredSports: ['Football', 'Cricket'],
          skillLevel: 'Intermediate',
          playingRole: 'Defender',
          rating: 4.8,
          matchesPlayed: 25
        },
        {
          name: 'Sneha Rao',
          email: 'sneha.rao@example.com',
          password: demoPasswordHash,
          role: 'player',
          city: 'Bangalore',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
          preferredSports: ['Football', 'Badminton'],
          skillLevel: 'Advanced',
          playingRole: 'Goalkeeper',
          rating: 4.9,
          matchesPlayed: 38
        },
        {
          name: 'Kabir Verma',
          email: 'kabir.verma@example.com',
          password: demoPasswordHash,
          role: 'player',
          city: 'Bangalore',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          preferredSports: ['Football'],
          skillLevel: 'Intermediate',
          playingRole: 'Striker',
          rating: 4.7,
          matchesPlayed: 19
        }
      ]);
    } else {
      player = await User.findOne({ role: 'player' });
      ownerBangalore = await User.findOne({ email: 'sunil@kickoffarena.com' });
      ownerPune = await User.findOne({ email: 'vikram@puneturf.com' });
    }

    // Seed Turf Profiles if empty
    const turfCount = await TurfProfile.countDocuments();
    let turf1, turf2;

    if (turfCount === 0 && ownerBangalore) {
      console.log('[Database] Seeding initial Turf Venues...');

      turf1 = await TurfProfile.create({
        owner: ownerBangalore._id,
        businessName: 'Kickoff Arena Turf',
        tagline: 'Premier FIFA-grade 7v7 & Box Cricket Arena',
        category: 'Multi-sport Turf',
        contactDetails: {
          phone: '+91 99887 76655',
          email: 'sunil@kickoffarena.com',
          website: 'https://kickoffarena.example.com'
        },
        city: 'Bangalore',
        address: '12th Main Road, Indiranagar, Bangalore - 560038',
        coordinates: { lat: 12.9716, lng: 77.6412 },
        verificationStatus: 'verified',
        sports: ['Football', 'Box Cricket'],
        hourlyRate: 1500,
        images: [
          'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80'
        ],
        amenities: ['High-Power Floodlights', 'Free Parking', 'Changing Rooms & Showers', 'Filtered Water Station'],
        openingHour: '06:00',
        closingHour: '23:00',
        rating: 4.9,
        reviewsCount: 28,
        slots: [
          { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1500 },
          { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Available', price: 1500 },
          { id: 's3', time: '05:00 PM - 06:30 PM', status: 'Available', price: 1500 },
          { id: 's4', time: '06:30 PM - 08:00 PM', status: 'Available', price: 1500 },
          { id: 's5', time: '08:00 PM - 09:30 PM', status: 'Available', price: 1500 }
        ]
      });

      if (ownerPune) {
        turf2 = await TurfProfile.create({
          owner: ownerPune._id,
          businessName: 'Shivajinagar Pro Turf Arena',
          tagline: 'Modern Multi-sport Sports Venue',
          category: 'Multi-sport Turf',
          contactDetails: {
            phone: '+91 98230 11223',
            email: 'vikram@puneturf.com',
            website: 'https://puneturf.example.com'
          },
          city: 'Pune',
          address: 'FC Road Extension, Shivajinagar, Pune - 411005',
          coordinates: { lat: 18.5204, lng: 73.8567 },
          verificationStatus: 'verified',
          sports: ['Football', 'Cricket'],
          hourlyRate: 1400,
          images: [
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80'
          ],
          amenities: ['High-Power Floodlights', 'Free Parking', 'Changing Rooms & Showers'],
          openingHour: '06:00',
          closingHour: '23:00',
          rating: 4.8,
          reviewsCount: 16,
          slots: [
            { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1400 },
            { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Available', price: 1400 },
            { id: 's3', time: '05:00 PM - 06:30 PM', status: 'Available', price: 1400 },
            { id: 's4', time: '06:30 PM - 08:00 PM', status: 'Available', price: 1400 }
          ]
        });
      }
    } else {
      turf1 = await TurfProfile.findOne({ city: 'Bangalore' });
    }

    // Seed Matches if empty
    const matchCount = await Match.countDocuments();
    if (matchCount === 0 && player) {
      console.log('[Database] Seeding initial Sports Matches...');

      const match1 = await Match.create({
        title: 'Saturday Night 7v7 Football Clash',
        sport: 'Football',
        coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '8:00 PM - 9:30 PM',
        duration: '1.5 hrs',
        city: 'Bangalore',
        location: 'Indiranagar 100ft Road',
        venue: turf1 ? turf1.businessName : 'Kickoff Arena Turf',
        venueId: turf1 ? turf1._id : null,
        host: player._id,
        hostName: player.name,
        hostAvatar: player.avatar,
        maxPlayers: 14,
        skillLevel: 'Intermediate',
        visibility: 'public',
        isPublic: true,
        estimatedCost: 3080,
        feePerPlayer: 220,
        status: 'Open',
        description: 'Competitive yet friendly 7v7 on FIFA-approved artificial turf. Warm-up starts 15 mins before kick-off. Teams balanced by skill level.',
        participants: [
          {
            user: player._id,
            name: player.name,
            avatar: player.avatar,
            role: 'Midfielder',
            skillLevel: 'Intermediate',
            team: 'Team A',
            attended: true,
            paymentStatus: 'Paid'
          }
        ],
        rules: [
          'Turf studs or flat trainers only (no metal studs)',
          'Bibs and water cooler provided at venue',
          'Fair play strictly enforced'
        ]
      });

      // Seed match chat message
      await ChatMessage.create({
        match: match1._id,
        sender: player._id,
        senderName: player.name,
        senderAvatar: player.avatar,
        text: 'Hey squad! Turf is booked for tonight. I’ll carry the blue and orange bibs!'
      });

      // Seed notification for player
      await Notification.create({
        recipient: player._id,
        type: 'booking_confirmed',
        title: 'Turf Reservation Confirmed 🎉',
        message: 'Your slot at Kickoff Arena Turf for tomorrow 8:00 PM is confirmed.',
        actionLink: '/player/my-activity',
        read: false
      });
    }

    // Seed Bookings if empty
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && player && turf1 && ownerBangalore) {
      console.log('[Database] Seeding initial Booking reservations...');

      await Booking.create({
        turf: turf1._id,
        turfName: turf1.businessName,
        turfCity: turf1.city,
        turfLocation: turf1.address,
        owner: ownerBangalore._id,
        user: player._id,
        userName: player.name,
        userEmail: player.email,
        userPhone: player.phone || '+91 98765 43210',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '08:00 PM - 09:30 PM',
        slotId: 's5',
        sport: 'Football',
        amount: 1500,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        paymentMode: 'demo',
        bookingRef: `PM-BKG-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    console.log('[Database] Initial data seeding check completed.');
  } catch (err) {
    console.error('[Database Seed Warning]:', err.message);
  }
}
