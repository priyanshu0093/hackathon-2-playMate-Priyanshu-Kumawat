export const SPORTS_CATEGORIES = [
  {
    id: 'cricket',
    name: 'Cricket',
    icon: 'Trophy',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    activeMatches: 18,
    activeGrounds: 14,
    color: '#2F80ED',
    popularFormat: 'Box Cricket / 8-a-side'
  },
  {
    id: 'football',
    name: 'Football',
    icon: 'Award',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    activeMatches: 24,
    activeGrounds: 20,
    color: '#20B486',
    popularFormat: '5v5 & 7v7 Turf'
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    activeMatches: 15,
    activeGrounds: 12,
    color: '#F2994A',
    popularFormat: 'Doubles / Singles'
  },
  {
    id: 'basketball',
    name: 'Basketball',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    activeMatches: 11,
    activeGrounds: 8,
    color: '#9B51E0',
    popularFormat: '3v3 Half-court & 5v5'
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    activeMatches: 8,
    activeGrounds: 6,
    color: '#219653',
    popularFormat: 'Clay / Hard Court'
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    icon: 'Target',
    image: 'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=800&q=80',
    activeMatches: 19,
    activeGrounds: 9,
    color: '#EB5757',
    popularFormat: 'Doubles Rally'
  }
];

export const CURRENT_USER = {
  id: 'usr_me',
  name: 'Alex Morgan',
  handle: '@alex_m23',
  city: 'Bangalore, Indiranagar',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Midfielder on the pitch, aggressive badminton smasher on weekends. Always down for competitive & friendly games!',
  phone: '+91 98765 43210',
  rating: 4.9,
  matchesPlayed: 42,
  hostedCount: 12,
  onTimeRate: '98%',
  fairPlayScore: '5.0 / 5',
  preferredSports: [
    { sport: 'Football', skill: 'Intermediate', role: 'Central Midfielder' },
    { sport: 'Badminton', skill: 'Advanced', role: 'Doubles Backcourt' },
    { sport: 'Cricket', skill: 'Intermediate', role: 'All-Rounder' }
  ],
  stats: {
    mvpAwards: 8,
    goalsAssists: '23 G / 15 A',
    totalHoursPlayed: 76
  }
};

export const INITIAL_MATCHES = [
  {
    id: 'match_1',
    title: 'Saturday Night 7v7 Football Clash',
    sport: 'Football',
    coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_1',
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Today, 28 Oct',
    time: '8:00 PM - 9:30 PM',
    duration: '1.5 hrs',
    venue: 'Kickoff Arena Turf, Indiranagar',
    venueId: 'ground_1',
    distance: '1.8 km away',
    city: 'Bangalore',
    playersJoined: 11,
    totalSpots: 14,
    pricePerPerson: 220,
    totalCost: 3080,
    skillLevel: 'Intermediate',
    status: 'Almost Full',
    isPublic: true,
    description: 'Competitive yet friendly 7v7 football under floodlights. High tempo game with bibs and match ball provided. Studs / turf shoes allowed.',
    rules: [
      'Turf shoes or flat studs only (No metal studs)',
      'Reach 15 mins before kick-off for warm-up',
      'Bibs and water cooler provided at venue',
      'Fair play strictly enforced; respect referee/host'
    ],
    roster: [
      { id: 'usr_me', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Midfielder', status: 'Confirmed' },
      { id: 'usr_1', name: 'Rohan Sharma (Host)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', role: 'Defender', status: 'Host' },
      { id: 'usr_2', name: 'Kabir Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'Striker', status: 'Confirmed' },
      { id: 'usr_3', name: 'Sneha Rao', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', role: 'Goalkeeper', status: 'Confirmed' },
      { id: 'usr_4', name: 'Arjun Sen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', role: 'Winger', status: 'Confirmed' },
      { id: 'usr_5', name: 'Vikram Joshi', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', role: 'Midfielder', status: 'Confirmed' }
    ]
  },
  {
    id: 'match_2',
    title: 'Sunday Morning Box Cricket Frenzy',
    sport: 'Cricket',
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_6',
      name: 'Aditya Nair',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      verified: true
    },
    date: 'Tomorrow, 29 Oct',
    time: '7:00 AM - 9:00 AM',
    duration: '2.0 hrs',
    venue: 'SkyTurf Sports Club, Koramangala',
    venueId: 'ground_2',
    distance: '3.2 km away',
    city: 'Bangalore',
    playersJoined: 9,
    totalSpots: 16,
    pricePerPerson: 180,
    totalCost: 2880,
    skillLevel: 'All Levels',
    status: 'Spots Available',
    isPublic: true,
    description: 'Weekend morning box cricket! Leather bounce tennis balls, quality English willow bats provided, 8 overs each side tournament style.',
    rules: [
      'Over the roof boundary is out (box cricket rules)',
      'Underarm bowling option available for amateurs',
      'White/light sports t-shirt recommended',
      'Please arrive by 6:50 AM sharp'
    ],
    roster: [
      { id: 'usr_6', name: 'Aditya Nair (Host)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', role: 'All-Rounder', status: 'Host' },
      { id: 'usr_7', name: 'Pooja Hegde', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', role: 'Batter', status: 'Confirmed' },
      { id: 'usr_8', name: 'Manish Kumar', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80', role: 'Bowler', status: 'Confirmed' }
    ]
  },
  {
    id: 'match_3',
    title: 'Advanced Badminton Doubles Sparring',
    sport: 'Badminton',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_9',
      name: 'Tanya Sengupta',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5.0,
      verified: true
    },
    date: 'Tomorrow, 29 Oct',
    time: '6:30 PM - 8:00 PM',
    duration: '1.5 hrs',
    venue: 'Velocity Badminton Hub, HSR Layout',
    venueId: 'ground_3',
    distance: '4.5 km away',
    city: 'Bangalore',
    playersJoined: 4,
    totalSpots: 4,
    pricePerPerson: 160,
    totalCost: 640,
    skillLevel: 'Advanced',
    status: 'Full',
    isPublic: true,
    description: 'High intensity Yonex feather shuttle sparring. Looking for players with solid court movement, smashes, and tournament experience.',
    rules: [
      'Non-marking badminton shoes compulsory',
      'Yonex AS-20 feather shuttles provided',
      'Rotating pairs every 21-point game'
    ],
    roster: [
      { id: 'usr_9', name: 'Tanya Sengupta (Host)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Host' },
      { id: 'usr_me', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Confirmed' },
      { id: 'usr_10', name: 'Deepak Patel', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Confirmed' },
      { id: 'usr_11', name: 'Zoya Khan', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Confirmed' }
    ]
  },
  {
    id: 'match_4',
    title: 'Sunset Pickleball Doubles Social',
    sport: 'Pickleball',
    coverImage: 'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_12',
      name: 'Sameer Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.7,
      verified: true
    },
    date: 'Wed, 30 Oct',
    time: '5:30 PM - 7:00 PM',
    duration: '1.5 hrs',
    venue: 'Smash & Rally Court, Whitefield',
    venueId: 'ground_5',
    distance: '6.1 km away',
    city: 'Bangalore',
    playersJoined: 5,
    totalSpots: 8,
    pricePerPerson: 150,
    totalCost: 1200,
    skillLevel: 'Beginner',
    status: 'Spots Available',
    isPublic: true,
    description: 'Beginner friendly social pickleball session. Paddles and balls provided, coaching hints available for new players!',
    rules: [
      'Paddles and Franklin X-40 balls available',
      'Flat sole tennis shoes required',
      'Rotational King-of-the-court format'
    ],
    roster: [
      { id: 'usr_12', name: 'Sameer Kulkarni (Host)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'Host', status: 'Host' }
    ]
  },
  {
    id: 'match_5',
    title: 'Late Night 3v3 Basketball Showdown',
    sport: 'Basketball',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_13',
      name: 'David Chhetri',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      verified: true
    },
    date: 'Thu, 31 Oct',
    time: '9:00 PM - 10:30 PM',
    duration: '1.5 hrs',
    venue: 'Hoops Urban Court, Domlur',
    venueId: 'ground_4',
    distance: '2.5 km away',
    city: 'Bangalore',
    playersJoined: 6,
    totalSpots: 9,
    pricePerPerson: 140,
    totalCost: 1260,
    skillLevel: 'Intermediate',
    status: 'Almost Full',
    isPublic: true,
    description: 'Under the floodlights FIBA 3v3 rules half-court matches. Winner stays on format.',
    rules: [
      'Standard size 7 composite ball provided',
      'Outdoor basketball shoes required',
      'Call your own fouls with sportsmanship'
    ],
    roster: [
      { id: 'usr_13', name: 'David Chhetri (Host)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Point Guard', status: 'Host' }
    ]
  },
  {
    id: 'match_6',
    title: 'Clay Court Tennis Singles Sparring',
    sport: 'Tennis',
    coverImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_14',
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Fri, 01 Nov',
    time: '6:00 AM - 7:30 AM',
    duration: '1.5 hrs',
    venue: 'Clay Masters Tennis Arena, Bellandur',
    venueId: 'ground_6',
    distance: '5.4 km away',
    city: 'Bangalore',
    playersJoined: 1,
    totalSpots: 2,
    pricePerPerson: 350,
    totalCost: 700,
    skillLevel: 'Advanced',
    status: 'Spots Available',
    isPublic: true,
    description: 'Looking for an advanced NTRP 4.0+ player for 3 sets of clay court sparring early morning. Bring fresh Dunlop balls.',
    rules: [
      'Clay court tennis shoes required',
      'Best of 3 full sets match'
    ],
    roster: [
      { id: 'usr_14', name: 'Ananya Deshmukh (Host)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Host' }
    ]
  },
  {
    id: 'match_indore_1',
    title: 'Indore Super League 7v7 Football',
    sport: 'Football',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_ind_1',
      name: 'Kabir Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Tomorrow, 29 Oct',
    time: '7:30 PM - 9:00 PM',
    duration: '1.5 hrs',
    venue: 'Holkar Sports Arena & Football Turf, Vijay Nagar',
    venueId: 'ground_indore_1',
    distance: '2.4 km away',
    city: 'Indore',
    playersJoined: 10,
    totalSpots: 14,
    pricePerPerson: 185,
    totalCost: 2600,
    skillLevel: 'Intermediate',
    status: 'Spots Available',
    isPublic: true,
    description: 'Competitive 7v7 under floodlights in Vijay Nagar. Warm-up 15 mins prior, bibs & size 5 match balls included.',
    rules: [
      'Turf cleats only (no metal studs)',
      'Bibs and refreshments provided',
      'Arrive 15 mins early'
    ],
    roster: [
      { id: 'usr_ind_1', name: 'Kabir Verma (Host)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'Midfielder', status: 'Host' }
    ]
  },
  {
    id: 'match_indore_2',
    title: 'Indore Holkar Box Cricket Cup',
    sport: 'Cricket',
    coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_ind_2',
      name: 'Rahul Malviya',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      verified: true
    },
    date: 'Wed, 30 Oct',
    time: '6:30 AM - 8:30 AM',
    duration: '2.0 hrs',
    venue: 'Malwa Box Cricket Arena, New Palasia',
    venueId: 'ground_indore_2',
    distance: '3.1 km away',
    city: 'Indore',
    playersJoined: 11,
    totalSpots: 16,
    pricePerPerson: 150,
    totalCost: 2400,
    skillLevel: 'All Levels',
    status: 'Spots Available',
    isPublic: true,
    description: 'Early morning box cricket thrill with tennis hard balls. Round-robin matches with trophy for MVP.',
    rules: [
      'Net boundary rules apply',
      'Bats provided at venue',
      'Fair play strictly observed'
    ],
    roster: [
      { id: 'usr_ind_2', name: 'Rahul Malviya (Host)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', role: 'All-Rounder', status: 'Host' }
    ]
  },
  {
    id: 'match_indore_3',
    title: 'Bhawarkua Badminton Doubles Rally',
    sport: 'Badminton',
    coverImage: 'https://images.unsplash.com/photo-1613918431703-aa50393693f1?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_ind_3',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Thu, 31 Oct',
    time: '7:00 PM - 8:30 PM',
    duration: '1.5 hrs',
    venue: 'Shuttle Point Indoor Badminton Club, Bhawarkua',
    venueId: 'ground_indore_3',
    distance: '4.0 km away',
    city: 'Indore',
    playersJoined: 3,
    totalSpots: 4,
    pricePerPerson: 150,
    totalCost: 600,
    skillLevel: 'Intermediate',
    status: 'Spots Available',
    isPublic: true,
    description: 'Friendly competitive doubles on premium wooden courts. Mavis 350 nylon shuttles provided.',
    rules: [
      'Non-marking shoes only',
      'Best of 3 games format',
      'Filtered drinking water provided'
    ],
    roster: [
      { id: 'usr_ind_3', name: 'Priya Sharma (Host)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Host' }
    ]
  }
];

export const INITIAL_GROUNDS = [
  {
    id: 'ground_1',
    name: 'Kickoff Arena Turf',
    tagline: 'FIFA Pro Quality Artificial Grass Turf',
    category: 'Turf & Multi-sport',
    supportedSports: ['Football', 'Cricket'],
    location: '12th Main, HAL 2nd Stage, Indiranagar',
    city: 'Bangalore',
    distance: '1.8 km',
    coordinates: { lat: 12.9716, lng: 77.6412 },
    rating: 4.8,
    reviewsCount: 142,
    hourlyPrice: 1200,
    heroImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'Floodlights', icon: 'Sun' },
      { name: 'Turf Shoes on Rent', icon: 'ShoppingBag' },
      { name: 'Changing Rooms & Showers', icon: 'Home' },
      { name: 'Free Parking', icon: 'Truck' },
      { name: 'Chilled RO Water', icon: 'Coffee' },
      { name: 'Viewing Dugout', icon: 'Users' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:00 AM', status: 'Available', price: 900 },
      { id: 's2', time: '07:00 AM - 08:00 AM', status: 'Booked', price: 900 },
      { id: 's3', time: '05:00 PM - 06:00 PM', status: 'Available', price: 1200 },
      { id: 's4', time: '06:00 PM - 07:00 PM', status: 'Fast Filling', price: 1400 },
      { id: 's5', time: '07:00 PM - 08:00 PM', status: 'Booked', price: 1400 },
      { id: 's6', time: '08:00 PM - 09:30 PM', status: 'Available', price: 1600 },
      { id: 's7', time: '09:30 PM - 11:00 PM', status: 'Available', price: 1400 }
    ],
    owner: {
      name: 'Sunil Rao',
      phone: '+91 99887 76655',
      verified: true
    },
    reviews: [
      {
        id: 'rev_1',
        userName: 'Vikram Joshi',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 days ago',
        comment: 'Amazing rubber pellet cushion turf! Did not feel joint pain at all. Good floodlights for night games.'
      },
      {
        id: 'rev_2',
        userName: 'Priya Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        rating: 4.5,
        date: '1 week ago',
        comment: 'Very clean changing rooms and plenty of parking space. Staff is polite.'
      }
    ]
  },
  {
    id: 'ground_2',
    name: 'SkyTurf Sports Club',
    tagline: 'Rooftop Multi-sport Box Arena',
    category: 'Box Cricket & Football',
    supportedSports: ['Cricket', 'Football'],
    location: '80 Feet Road, 4th Block, Koramangala',
    city: 'Bangalore',
    distance: '3.2 km',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    rating: 4.9,
    reviewsCount: 218,
    hourlyPrice: 1100,
    heroImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'Overhead Netting (No ball lost)', icon: 'Shield' },
      { name: 'Scoreboard & Sound System', icon: 'Volume2' },
      { name: 'Equipment Included', icon: 'Package' },
      { name: 'Cafe & Refreshments', icon: 'Coffee' },
      { name: 'Parking Available', icon: 'Truck' }
    ],
    slots: [
      { id: 's1', time: '07:00 AM - 08:30 AM', status: 'Available', price: 1000 },
      { id: 's2', time: '08:30 AM - 10:00 AM', status: 'Booked', price: 1100 },
      { id: 's3', time: '04:00 PM - 05:30 PM', status: 'Available', price: 1100 },
      { id: 's4', time: '07:00 PM - 09:00 PM', status: 'Fast Filling', price: 1400 }
    ],
    owner: {
      name: 'Karan Mehra',
      phone: '+91 98451 11223',
      verified: true
    },
    reviews: [
      {
        id: 'rev_3',
        userName: 'Aditya Nair',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '3 days ago',
        comment: 'Best rooftop cricket arena in Koramangala. The breeze in the evening makes it unbeatable!'
      }
    ]
  },
  {
    id: 'ground_3',
    name: 'Velocity Badminton Hub',
    tagline: 'BWF Certified 6 Synthetic Wooden Courts',
    category: 'Badminton Courts',
    supportedSports: ['Badminton'],
    location: '27th Main, Sector 1, HSR Layout',
    city: 'Bangalore',
    distance: '4.5 km',
    coordinates: { lat: 12.9121, lng: 77.6446 },
    rating: 4.7,
    reviewsCount: 96,
    hourlyPrice: 400,
    heroImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1613918431703-aa50393693f1?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'Anti-Glare High Bay LED', icon: 'Sun' },
      { name: 'Non-Marking Shoes on Rent', icon: 'ShoppingBag' },
      { name: 'Locker Facility', icon: 'Lock' },
      { name: 'Stringing Service', icon: 'Wrench' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:00 AM', status: 'Available', price: 350 },
      { id: 's2', time: '07:00 AM - 08:00 AM', status: 'Booked', price: 400 },
      { id: 's3', time: '06:00 PM - 07:00 PM', status: 'Available', price: 450 },
      { id: 's4', time: '07:00 PM - 08:00 PM', status: 'Fast Filling', price: 450 }
    ],
    owner: {
      name: 'Ramesh Babu',
      phone: '+91 97410 44556',
      verified: true
    },
    reviews: [
      {
        id: 'rev_4',
        userName: 'Tanya Sengupta',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '5 days ago',
        comment: 'Superb grip on the mats, zero glare on high smashes. My go-to court.'
      }
    ]
  },
  {
    id: 'ground_4',
    name: 'Hoops Urban Basketball Arena',
    tagline: 'Standard Hardwood & Outdoor Streetball Courts',
    category: 'Basketball Court',
    supportedSports: ['Basketball'],
    location: 'Old Airport Road, Domlur',
    city: 'Bangalore',
    distance: '2.5 km',
    coordinates: { lat: 12.9609, lng: 77.6387 },
    rating: 4.6,
    reviewsCount: 88,
    hourlyPrice: 850,
    heroImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'Breakaway Spring Rims', icon: 'Target' },
      { name: 'Night Floodlights', icon: 'Sun' },
      { name: 'Water Refill Station', icon: 'Coffee' },
      { name: 'Locker Storage', icon: 'Lock' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 700 },
      { id: 's2', time: '05:30 PM - 07:00 PM', status: 'Available', price: 850 },
      { id: 's3', time: '07:30 PM - 09:00 PM', status: 'Booked', price: 900 }
    ],
    owner: {
      name: 'Nitin Paul',
      phone: '+91 98200 99887',
      verified: true
    },
    reviews: []
  },
  {
    id: 'ground_5',
    name: 'Smash & Rally Pickleball Hub',
    tagline: '4 Regulation Pickleball Courts with Pro Surface',
    category: 'Pickleball',
    supportedSports: ['Pickleball'],
    location: 'ECC Road, Whitefield',
    city: 'Bangalore',
    distance: '6.1 km',
    coordinates: { lat: 12.9719, lng: 77.7500 },
    rating: 4.9,
    reviewsCount: 64,
    hourlyPrice: 600,
    heroImage: 'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'Selkirk Paddles on Rent', icon: 'ShoppingBag' },
      { name: 'Tournament Grade Nets', icon: 'Check' },
      { name: 'Lounge Cafe', icon: 'Coffee' }
    ],
    slots: [
      { id: 's1', time: '07:00 AM - 08:30 AM', status: 'Available', price: 500 },
      { id: 's2', time: '05:00 PM - 06:30 PM', status: 'Available', price: 600 },
      { id: 's3', time: '06:30 PM - 08:00 PM', status: 'Available', price: 650 }
    ],
    owner: {
      name: 'Tara Dsouza',
      phone: '+91 99160 33221',
      verified: true
    },
    reviews: []
  },
  {
    id: 'ground_6',
    name: 'Clay Masters Tennis Arena',
    tagline: 'Authentic French Red Clay Tennis Courts',
    category: 'Tennis Court',
    supportedSports: ['Tennis'],
    location: 'Outer Ring Road, Bellandur',
    city: 'Bangalore',
    distance: '5.4 km',
    coordinates: { lat: 12.9279, lng: 77.6744 },
    rating: 4.8,
    reviewsCount: 110,
    hourlyPrice: 700,
    heroImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'Red Clay Surface', icon: 'Star' },
      { name: 'Ball Boys Available', icon: 'Users' },
      { name: 'Racquet Stringing', icon: 'Wrench' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 700 },
      { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Booked', price: 700 },
      { id: 's3', time: '04:30 PM - 06:00 PM', status: 'Available', price: 800 }
    ],
    owner: {
      name: 'Alok Khemka',
      phone: '+91 98860 12345',
      verified: true
    },
    reviews: []
  },
  {
    id: 'ground_indore_1',
    name: 'Holkar Sports Arena & Football Turf',
    tagline: 'Premier FIFA-Approved 7v7 Astro Turf under Floodlights',
    category: 'Multi-sport Turf',
    supportedSports: ['Football', 'Cricket'],
    location: 'Scheme No. 54, Vijay Nagar',
    city: 'Indore',
    distance: '2.4 km',
    coordinates: { lat: 22.7533, lng: 75.8937 },
    rating: 4.9,
    reviewsCount: 88,
    hourlyPrice: 1300,
    heroImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80'
    ],
    amenities: [
      { name: 'FIFA Grade Turf', icon: 'Award' },
      { name: 'Floodlights', icon: 'Sun' },
      { name: 'Changing Rooms', icon: 'Home' },
      { name: 'Free Parking', icon: 'Truck' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1100 },
      { id: 's2', time: '06:00 PM - 07:30 PM', status: 'Available', price: 1300 },
      { id: 's3', time: '07:30 PM - 09:00 PM', status: 'Fast Filling', price: 1400 }
    ],
    owner: {
      name: 'Manish Patidar',
      phone: '+91 98930 22110',
      verified: true
    },
    reviews: []
  },
  {
    id: 'ground_indore_2',
    name: 'Malwa Box Cricket Arena',
    tagline: 'High-Impact Box Cricket Pitch with Automatic Bowling Machine',
    category: 'Box Cricket',
    supportedSports: ['Cricket'],
    location: 'AB Road, Near Industry House, New Palasia',
    city: 'Indore',
    distance: '3.1 km',
    coordinates: { lat: 22.7244, lng: 75.8839 },
    rating: 4.8,
    reviewsCount: 112,
    hourlyPrice: 1100,
    heroImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80'
    ],
    amenities: [
      { name: 'Bowling Machine', icon: 'Zap' },
      { name: 'Overhead Netting', icon: 'Shield' },
      { name: 'Bats Provided', icon: 'Package' }
    ],
    slots: [
      { id: 's1', time: '06:30 AM - 08:30 AM', status: 'Available', price: 1000 },
      { id: 's2', time: '05:00 PM - 07:00 PM', status: 'Available', price: 1100 }
    ],
    owner: {
      name: 'Virendra Sharma',
      phone: '+91 98260 44556',
      verified: true
    },
    reviews: []
  },
  {
    id: 'ground_indore_3',
    name: 'Shuttle Point Indoor Badminton Club',
    tagline: 'Air-conditioned Wooden Flooring Badminton Courts',
    category: 'Badminton Courts',
    supportedSports: ['Badminton'],
    location: 'Bhawarkua Main Road, Transport Nagar',
    city: 'Indore',
    distance: '4.0 km',
    coordinates: { lat: 22.6916, lng: 75.8667 },
    rating: 4.7,
    reviewsCount: 64,
    hourlyPrice: 400,
    heroImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1613918431703-aa50393693f1?auto=format&fit=crop&w=900&q=80'
    ],
    amenities: [
      { name: 'Wooden Cushioned Courts', icon: 'Award' },
      { name: 'High Bay LED', icon: 'Sun' },
      { name: 'Racquet Stringing', icon: 'Wrench' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:00 AM', status: 'Available', price: 350 },
      { id: 's2', time: '07:00 PM - 08:30 PM', status: 'Available', price: 400 }
    ],
    owner: {
      name: 'Sanjay Chaurasia',
      phone: '+91 97550 77889',
      verified: true
    },
    reviews: []
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'bk_101',
    groundId: 'ground_1',
    groundName: 'Kickoff Arena Turf',
    sport: 'Football',
    date: 'Today, 28 Oct',
    timeSlot: '08:00 PM - 09:30 PM',
    duration: '1.5 hrs',
    court: 'Turf A - FIFA Pro',
    totalAmount: 1800,
    splitShare: 220,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    bookingRef: 'PM-KOF-8821',
    participantsCount: 11,
    type: 'match_linked',
    matchId: 'match_1'
  },
  {
    id: 'bk_102',
    groundId: 'ground_3',
    groundName: 'Velocity Badminton Hub',
    sport: 'Badminton',
    date: 'Tomorrow, 29 Oct',
    timeSlot: '06:30 PM - 08:00 PM',
    duration: '1.5 hrs',
    court: 'Court 3 (Synthetic Wooden)',
    totalAmount: 640,
    splitShare: 160,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    bookingRef: 'PM-VEL-4402',
    participantsCount: 4,
    type: 'match_linked',
    matchId: 'match_3'
  },
  {
    id: 'bk_103',
    groundId: 'ground_2',
    groundName: 'SkyTurf Sports Club',
    sport: 'Cricket',
    date: 'Sat, 04 Nov',
    timeSlot: '07:00 PM - 09:00 PM',
    duration: '2.0 hrs',
    court: 'Rooftop Arena 1',
    totalAmount: 2200,
    splitShare: 2200,
    status: 'Pending',
    paymentStatus: 'Awaiting Turf Confirmation',
    bookingRef: 'PM-SKY-9913',
    participantsCount: 1,
    type: 'direct_booking'
  },
  {
    id: 'bk_104',
    groundId: 'ground_4',
    groundName: 'Hoops Urban Basketball Arena',
    sport: 'Basketball',
    date: '22 Oct (Last Week)',
    timeSlot: '07:30 PM - 09:00 PM',
    duration: '1.5 hrs',
    court: 'Full Court 1',
    totalAmount: 900,
    splitShare: 150,
    status: 'Completed',
    paymentStatus: 'Settled',
    bookingRef: 'PM-HUP-1200',
    participantsCount: 6,
    type: 'match_linked'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'join_request',
    title: 'New player joined your match!',
    message: 'Vikram Joshi joined your Saturday Night 7v7 Football Clash.',
    time: '15 mins ago',
    unread: true,
    actionLink: '/player/matches/match_1'
  },
  {
    id: 'notif_2',
    type: 'booking_confirm',
    title: 'Turf Booking Confirmed 🎉',
    message: 'Kickoff Arena Turf has confirmed your slot for today 8:00 PM.',
    time: '1 hour ago',
    unread: true,
    actionLink: '/player/my-activity'
  },
  {
    id: 'notif_3',
    type: 'match_reminder',
    title: 'Match starting in 4 hours',
    message: 'Don’t forget: Advanced Badminton Doubles at Velocity Hub is at 6:30 PM tomorrow.',
    time: '3 hours ago',
    unread: false,
    actionLink: '/player/matches/match_3'
  },
  {
    id: 'notif_4',
    type: 'invite',
    title: 'Match Invitation from Rohan',
    message: 'You have been invited to a Sunday Box Cricket match in Koramangala.',
    time: 'Yesterday',
    unread: false,
    actionLink: '/player/matches/match_2'
  }
];

export const INITIAL_CHATS = [
  {
    id: 'chat_match_1',
    matchId: 'match_1',
    title: 'Saturday Night 7v7 Football ⚽',
    subtitle: '11 players active',
    avatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=80',
    messages: [
      {
        id: 'msg_1',
        senderId: 'usr_1',
        senderName: 'Rohan Sharma (Host)',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        text: 'Hey squad! Turf is booked for 8:00 PM tonight. I’ll carry the blue and orange bibs.',
        time: '4:15 PM',
        isMe: false
      },
      {
        id: 'msg_2',
        senderId: 'usr_3',
        senderName: 'Sneha Rao',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        text: 'Awesome! Bringing my keeper gloves. Are turf flats allowed or studs?',
        time: '4:20 PM',
        isMe: false
      },
      {
        id: 'msg_3',
        senderId: 'usr_1',
        senderName: 'Rohan Sharma (Host)',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        text: 'Rubber studs and turf shoes are both fine! No metal spikes.',
        time: '4:22 PM',
        isMe: false
      },
      {
        id: 'msg_4',
        senderId: 'usr_me',
        senderName: 'Alex Morgan',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        text: 'Perfect! I’ll arrive 15 minutes early for warm-ups. See everyone there!',
        time: '4:30 PM',
        isMe: true
      }
    ]
  },
  {
    id: 'chat_match_3',
    matchId: 'match_3',
    title: 'Advanced Badminton Sparring 🏸',
    subtitle: '4 players active',
    avatar: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=200&q=80',
    messages: [
      {
        id: 'msg_b1',
        senderId: 'usr_9',
        senderName: 'Tanya Sengupta',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        text: 'Welcome all! Bringing a fresh box of Yonex AS-20 shuttles for tomorrow.',
        time: 'Yesterday',
        isMe: false
      },
      {
        id: 'msg_b2',
        senderId: 'usr_me',
        senderName: 'Alex Morgan',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        text: 'Sounds great Tanya, looking forward to high intensity rallies!',
        time: 'Yesterday',
        isMe: true
      }
    ]
  }
];

export const TURF_OWNER_STATS = {
  venueName: 'Kickoff Arena Turf',
  totalBookingsMonth: 148,
  revenueMonth: '₹1,84,600',
  activeTurfsCount: 3,
  occupancyRate: '86%',
  pendingRequestsCount: 4,
  recentBookings: [
    { id: 'tb_1', customer: 'Rohan Sharma', sport: 'Football', slot: 'Today, 8:00 PM - 9:30 PM', court: 'Turf A', amount: '₹1,800', status: 'Confirmed' },
    { id: 'tb_2', customer: 'Kunal Kapoor', sport: 'Cricket', slot: 'Tomorrow, 7:00 AM - 9:00 AM', court: 'Turf B', amount: '₹2,200', status: 'Pending' },
    { id: 'tb_3', customer: 'Pooja Reddy', sport: 'Football', slot: 'Tomorrow, 6:00 PM - 7:30 PM', court: 'Turf A', amount: '₹1,800', status: 'Pending' },
    { id: 'tb_4', customer: 'Amitabh Sen', sport: 'Box Cricket', slot: 'Friday, 8:00 PM - 10:00 PM', court: 'Turf C', amount: '₹2,400', status: 'Confirmed' }
  ],
  revenueWeekly: [
    { day: 'Mon', amount: 18400 },
    { day: 'Tue', amount: 22100 },
    { day: 'Wed', amount: 19800 },
    { day: 'Thu', amount: 25600 },
    { day: 'Fri', amount: 34200 },
    { day: 'Sat', amount: 48900 },
    { day: 'Sun', amount: 52400 }
  ]
};

export const ADMIN_STATS = {
  totalPlayers: '14,820',
  totalVenues: '142',
  activeMatchesToday: '84',
  platformVolume: '₹14.2 Lakhs',
  pendingVerifications: 3,
  pendingDisputes: 1,
  usersList: [
    { id: 'u1', name: 'Alex Morgan', role: 'Player', email: 'alex.morgan@playmate.sports', matches: 42, status: 'Active', verified: true },
    { id: 'u2', name: 'Sunil Rao', role: 'Turf Owner', email: 'kickoff.turf@blrarena.com', venues: 2, status: 'Active', verified: true },
    { id: 'u3', name: 'Rohan Sharma', role: 'Host / Player', email: 'rohan.s@playmate.sports', matches: 28, status: 'Active', verified: true },
    { id: 'u4', name: 'Vikram Joshi', role: 'Player', email: 'v.joshi@techpulse.io', matches: 16, status: 'Active', verified: true },
    { id: 'u5', name: 'Karan Mehra', role: 'Turf Owner', email: 'skyturf@bangalore.sports', venues: 1, status: 'Active', verified: true }
  ],
  venueModeration: [
    { id: 'vm_1', name: 'Champions Arena North', owner: 'Mahesh Gowda', city: 'Bangalore, Yelahanka', sports: ['Football', 'Cricket'], status: 'Pending Review', submittedDate: 'Yesterday' },
    { id: 'vm_2', name: 'Ace Padel & Pickleball', owner: 'Sonalika Sen', city: 'Bangalore, Sarjapur', sports: ['Pickleball', 'Tennis'], status: 'Pending Review', submittedDate: '2 days ago' }
  ],
  disputes: [
    { id: 'dsp_1', match: 'Saturday 7v7 Football', issue: 'Turf lighting malfunction during 2nd half', requestedBy: 'Player Alex Morgan', refundRequested: '₹400 per team', status: 'Under Review' }
  ]
};
