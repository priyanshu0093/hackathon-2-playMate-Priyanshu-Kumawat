import mongoose from 'mongoose';

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/playmate');
  const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false }));
  const Turf = mongoose.model('TurfProfile', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  console.log('Cleaning test matches and turfs...');
  await Match.deleteMany({ title: 'Wednesday Midweek Turf Derby' });
  await Match.deleteMany({ coverImage: { $in: ['', null] } });
  await Turf.deleteMany({ businessName: /Sam|Apex Arena Football Hub|Rajesh Sharma/i });

  const player = await User.findOne({ role: 'player' });
  const owner = await User.findOne({ role: 'turf_owner' });

  // 1. Bangalore Turfs
  const bglrTurfs = [
    {
      businessName: 'Kickoff Arena 7v7 Turf',
      tagline: 'FIFA Pro Quality Artificial Grass with High Floodlights',
      category: 'Multi-sport Turf',
      city: 'Bangalore',
      address: '12th Main Road, Indiranagar, Bangalore - 560038',
      coordinates: { lat: 12.9716, lng: 77.6412 },
      verificationStatus: 'verified',
      sports: ['Football', 'Cricket'],
      hourlyRate: 1400,
      images: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80'
      ],
      amenities: ['High-Power Floodlights', 'Free Parking', 'Changing Rooms & Showers', 'Dugouts'],
      rating: 4.9,
      reviewsCount: 142
    },
    {
      businessName: 'SkyTurf Rooftop Sports Club',
      tagline: 'Rooftop Multi-sport Box Arena with Panoramic City View',
      category: 'Box Cricket & Football',
      city: 'Bangalore',
      address: '80 Feet Road, 4th Block, Koramangala, Bangalore - 560034',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      verificationStatus: 'verified',
      sports: ['Cricket', 'Football'],
      hourlyRate: 1200,
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=900&q=80'
      ],
      amenities: ['Overhead Netting', 'LED Scoreboard', 'Sound System', 'Free Parking', 'Cafe'],
      rating: 4.8,
      reviewsCount: 218
    },
    {
      businessName: 'Velocity Badminton & Squash Hub',
      tagline: 'BWF Certified 6 Synthetic Wooden Indoor Courts',
      category: 'Badminton Courts',
      city: 'Bangalore',
      address: '27th Main, Sector 1, HSR Layout, Bangalore - 560102',
      coordinates: { lat: 12.9121, lng: 77.6446 },
      verificationStatus: 'verified',
      sports: ['Badminton'],
      hourlyRate: 450,
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1613918431703-aa50393693f1?auto=format&fit=crop&w=900&q=80'
      ],
      amenities: ['Anti-Glare High Bay LED', 'Shoe Rental', 'Locker Facility', 'Stringing Service'],
      rating: 4.7,
      reviewsCount: 96
    }
  ];

  for (const t of bglrTurfs) {
    const exists = await Turf.findOne({ businessName: t.businessName });
    if (!exists) {
      await Turf.create({ ...t, owner: owner?._id });
    } else {
      await Turf.updateOne({ _id: exists._id }, { $set: t });
    }
  }

  // 2. Indore Turfs
  const indoreTurfs = [
    {
      businessName: 'Holkar Sports Arena & Football Turf',
      tagline: 'Premier FIFA-Approved 7v7 Astro Turf under Floodlights',
      category: 'Multi-sport Turf',
      city: 'Indore',
      address: 'Scheme No. 54, Vijay Nagar, Indore - 452010',
      coordinates: { lat: 22.7533, lng: 75.8937 },
      verificationStatus: 'verified',
      sports: ['Football', 'Cricket'],
      hourlyRate: 1300,
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80'
      ],
      amenities: ['FIFA Grade Turf', 'Floodlights', 'Changing Rooms', 'Ample Parking', 'Snack Bar'],
      rating: 4.9,
      reviewsCount: 88
    },
    {
      businessName: 'Malwa Box Cricket Arena',
      tagline: 'High-Impact Box Cricket Pitch with Automatic Bowling Machine',
      category: 'Box Cricket',
      city: 'Indore',
      address: 'AB Road, Near Industry House, New Palasia, Indore - 452001',
      coordinates: { lat: 22.7244, lng: 75.8839 },
      verificationStatus: 'verified',
      sports: ['Cricket'],
      hourlyRate: 1100,
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80'
      ],
      amenities: ['Bowling Machine', 'Overhead Netting', 'Leather Ball Pitches', 'Locker Room'],
      rating: 4.8,
      reviewsCount: 112
    },
    {
      businessName: 'Shuttle Point Indoor Badminton Club',
      tagline: 'Air-conditioned Wooden Flooring Badminton Courts',
      category: 'Badminton Courts',
      city: 'Indore',
      address: 'Bhawarkua Main Road, Transport Nagar, Indore - 452014',
      coordinates: { lat: 22.6916, lng: 75.8667 },
      verificationStatus: 'verified',
      sports: ['Badminton'],
      hourlyRate: 400,
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1613918431703-aa50393693f1?auto=format&fit=crop&w=900&q=80'
      ],
      amenities: ['Wooden Cushioned Courts', 'Pro Lighting', 'Racquet Stringing', 'Free RO Water'],
      rating: 4.7,
      reviewsCount: 64
    }
  ];

  for (const t of indoreTurfs) {
    const exists = await Turf.findOne({ businessName: t.businessName });
    if (!exists) {
      await Turf.create({ ...t, owner: owner?._id });
    } else {
      await Turf.updateOne({ _id: exists._id }, { $set: t });
    }
  }

  // 3. Bangalore Matches
  const bglrMatches = [
    {
      title: 'Saturday Night 7v7 Football Clash',
      sport: 'Football',
      coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '8:00 PM - 9:30 PM',
      duration: '1.5 hrs',
      city: 'Bangalore',
      location: 'Indiranagar 100ft Road',
      venue: 'Kickoff Arena 7v7 Turf',
      host: player?._id,
      hostName: 'Rohan Sharma',
      hostAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      maxPlayers: 14,
      skillLevel: 'Intermediate',
      visibility: 'public',
      isPublic: true,
      estimatedCost: 2800,
      feePerPlayer: 200,
      status: 'Open',
      description: 'High energy 7v7 football on artificial turf under lights. Bibs and match ball provided. Studs/turf shoes allowed.',
      rules: ['Turf shoes only', 'Be on time 15m prior', 'Fair play strictly enforced']
    },
    {
      title: 'Sunday Morning Box Cricket Frenzy',
      sport: 'Cricket',
      coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      time: '7:00 AM - 9:00 AM',
      duration: '2.0 hrs',
      city: 'Bangalore',
      location: 'Koramangala 4th Block',
      venue: 'SkyTurf Rooftop Sports Club',
      host: player?._id,
      hostName: 'Aditya Nair',
      hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      maxPlayers: 16,
      skillLevel: 'All Levels',
      visibility: 'public',
      isPublic: true,
      estimatedCost: 2880,
      feePerPlayer: 180,
      status: 'Open',
      description: 'Weekend morning box cricket! Quality tennis balls, English willow bats provided, 8 overs each side tournament style.',
      rules: ['Over the roof boundary is out', 'Underarm bowling option for amateurs', 'Light t-shirt recommended']
    },
    {
      title: 'Advanced Badminton Doubles Sparring',
      sport: 'Badminton',
      coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '6:30 PM - 8:00 PM',
      duration: '1.5 hrs',
      city: 'Bangalore',
      location: 'HSR Layout Sector 1',
      venue: 'Velocity Badminton & Squash Hub',
      host: player?._id,
      hostName: 'Tanya Sengupta',
      hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      maxPlayers: 4,
      skillLevel: 'Advanced',
      visibility: 'public',
      isPublic: true,
      estimatedCost: 640,
      feePerPlayer: 160,
      status: 'Open',
      description: 'High intensity feather shuttle sparring. Solid smashes, fast rallies, rotating pairs every 21-point game.',
      rules: ['Non-marking shoes mandatory', 'Yonex feather shuttles provided', 'Rotational format']
    }
  ];

  for (const m of bglrMatches) {
    const exists = await Match.findOne({ title: m.title, city: 'Bangalore' });
    if (!exists) {
      await Match.create(m);
    } else {
      await Match.updateOne({ _id: exists._id }, { $set: m });
    }
  }

  // 4. Indore Matches
  const indoreMatches = [
    {
      title: 'Indore Super League 7v7 Football',
      sport: 'Football',
      coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '7:30 PM - 9:00 PM',
      duration: '1.5 hrs',
      city: 'Indore',
      location: 'Vijay Nagar Scheme 54',
      venue: 'Holkar Sports Arena & Football Turf',
      host: player?._id,
      hostName: 'Kabir Verma',
      hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      maxPlayers: 14,
      skillLevel: 'Intermediate',
      visibility: 'public',
      isPublic: true,
      estimatedCost: 2600,
      feePerPlayer: 185,
      status: 'Open',
      description: 'Competitive 7v7 under floodlights in Vijay Nagar. Warm-up 15 mins prior, bibs & size 5 match balls included.',
      rules: ['Turf cleats only', 'Bibs provided', '15 min warm-up']
    },
    {
      title: 'Indore Holkar Box Cricket Cup',
      sport: 'Cricket',
      coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80',
      date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      time: '6:30 AM - 8:30 AM',
      duration: '2.0 hrs',
      city: 'Indore',
      location: 'New Palasia AB Road',
      venue: 'Malwa Box Cricket Arena',
      host: player?._id,
      hostName: 'Rahul Malviya',
      hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      maxPlayers: 16,
      skillLevel: 'All Levels',
      visibility: 'public',
      isPublic: true,
      estimatedCost: 2400,
      feePerPlayer: 150,
      status: 'Open',
      description: 'Early morning box cricket thrill with tennis hard balls. Round-robin matches with trophy for MVP.',
      rules: ['Net boundary rules apply', 'Bats provided', 'Fair play']
    },
    {
      title: 'Bhawarkua Badminton Doubles Rally',
      sport: 'Badminton',
      coverImage: 'https://images.unsplash.com/photo-1613918431703-aa50393693f1?auto=format&fit=crop&w=900&q=80',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '7:00 PM - 8:30 PM',
      duration: '1.5 hrs',
      city: 'Indore',
      location: 'Transport Nagar, Bhawarkua',
      venue: 'Shuttle Point Indoor Badminton Club',
      host: player?._id,
      hostName: 'Priya Sharma',
      hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      maxPlayers: 4,
      skillLevel: 'Intermediate',
      visibility: 'public',
      isPublic: true,
      estimatedCost: 600,
      feePerPlayer: 150,
      status: 'Open',
      description: 'Friendly competitive doubles on premium wooden courts. Mavis 350 nylon shuttles provided.',
      rules: ['Non-marking shoes only', 'Best of 3 games', 'Water provided']
    }
  ];

  for (const m of indoreMatches) {
    const exists = await Match.findOne({ title: m.title, city: 'Indore' });
    if (!exists) {
      await Match.create(m);
    } else {
      await Match.updateOne({ _id: exists._id }, { $set: m });
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

