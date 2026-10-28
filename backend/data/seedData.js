export const SEED_TURFS = [
  // Bangalore
  {
    id: 'ground_1',
    name: 'Kickoff Arena Turf',
    tagline: 'FIFA Grade 7v7 & 5v5 Football Turf',
    category: 'Football Turf',
    supportedSports: ['Football'],
    location: '100 Feet Road, HAL 2nd Stage, Indiranagar',
    city: 'Bangalore',
    distance: '1.8 km',
    coordinates: { lat: 12.9716, lng: 77.6412 },
    rating: 4.8,
    reviewsCount: 142,
    hourlyPrice: 1400,
    heroImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: [
      { name: 'FIFA Approved Artificial Grass', icon: 'CheckCircle' },
      { name: 'High-Power LED Floodlights', icon: 'Sun' },
      { name: 'Changing Rooms & Showers', icon: 'Home' },
      { name: 'Filtered Drinking Water', icon: 'Droplet' },
      { name: 'First Aid & Refreshment Kiosk', icon: 'Coffee' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:00 AM', status: 'Available', price: 1000 },
      { id: 's2', time: '07:00 AM - 08:30 AM', status: 'Available', price: 1200 },
      { id: 's3', time: '05:00 PM - 06:00 PM', status: 'Available', price: 1200 },
      { id: 's4', time: '06:00 PM - 07:00 PM', status: 'Fast Filling', price: 1400 },
      { id: 's5', time: '07:00 PM - 08:00 PM', status: 'Booked', price: 1400 },
      { id: 's6', time: '08:00 PM - 09:30 PM', status: 'Available', price: 1600 },
      { id: 's7', time: '09:30 PM - 11:00 PM', status: 'Available', price: 1400 }
    ],
    owner: { name: 'Sunil Rao', phone: '+91 99887 76655', verified: true },
    reviews: []
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
    gallery: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'Overhead Netting (No ball lost)', icon: 'Shield' },
      { name: 'Scoreboard & Sound System', icon: 'Volume2' },
      { name: 'Free Parking', icon: 'Truck' }
    ],
    slots: [
      { id: 's1', time: '07:00 AM - 08:30 AM', status: 'Available', price: 1000 },
      { id: 's2', time: '04:00 PM - 05:30 PM', status: 'Available', price: 1100 }
    ],
    owner: { name: 'Karan Mehra', phone: '+91 98451 11223', verified: true },
    reviews: []
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
    gallery: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'Anti-Glare High Bay LED', icon: 'Sun' },
      { name: 'Locker Facility', icon: 'Lock' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:00 AM', status: 'Available', price: 400 },
      { id: 's2', time: '06:00 PM - 07:00 PM', status: 'Available', price: 450 }
    ],
    owner: { name: 'Deepa Hegde', phone: '+91 97400 33445', verified: true },
    reviews: []
  },

  // Mumbai
  {
    id: 'ground_mumbai_1',
    name: 'Bandra Urban Sports Arena',
    tagline: 'Floodlit Rooftop 5v5 Turf & Box Cricket',
    category: 'Multi-sport Arena',
    supportedSports: ['Football', 'Cricket'],
    location: 'Pali Hill, Near Carter Road, Bandra West',
    city: 'Mumbai',
    distance: '2.1 km',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    rating: 4.9,
    reviewsCount: 184,
    hourlyPrice: 1600,
    heroImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'Sea-breeze Rooftop View', icon: 'Wind' },
      { name: 'High-Lumen Floodlights', icon: 'Sun' },
      { name: 'Valet Parking', icon: 'Truck' },
      { name: 'Sports Cafe', icon: 'Coffee' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1400 },
      { id: 's2', time: '06:00 PM - 07:30 PM', status: 'Available', price: 1800 },
      { id: 's3', time: '08:00 PM - 09:30 PM', status: 'Available', price: 2000 }
    ],
    owner: { name: 'Farhan Contractor', phone: '+91 98201 55443', verified: true },
    reviews: []
  },
  {
    id: 'ground_mumbai_2',
    name: 'Andheri Kickbox & Padel Club',
    tagline: 'Modern Synthetic Courts & Box Arena',
    category: 'Box Cricket & Pickleball',
    supportedSports: ['Cricket', 'Pickleball', 'Football'],
    location: 'Link Road, Near Infinity Mall, Andheri West',
    city: 'Mumbai',
    distance: '3.6 km',
    coordinates: { lat: 19.1363, lng: 72.8277 },
    rating: 4.7,
    reviewsCount: 130,
    hourlyPrice: 1300,
    heroImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'Pro-Bounce Synthetic Surface', icon: 'CheckCircle' },
      { name: 'Equipment Provided', icon: 'Package' },
      { name: 'Locker Rooms', icon: 'Lock' }
    ],
    slots: [
      { id: 's1', time: '07:00 AM - 08:30 AM', status: 'Available', price: 1100 },
      { id: 's2', time: '07:30 PM - 09:00 PM', status: 'Available', price: 1400 }
    ],
    owner: { name: 'Sameer Merchant', phone: '+91 98192 33441', verified: true },
    reviews: []
  },

  // Delhi NCR
  {
    id: 'ground_delhi_1',
    name: 'CyberTurf Sports Park',
    tagline: 'Premium 7v7 Football & Cricket Arena',
    category: 'Multi-sport Turf',
    supportedSports: ['Football', 'Cricket'],
    location: 'Cyber City, Sector 24, Gurugram, Delhi NCR',
    city: 'Delhi NCR',
    distance: '2.5 km',
    coordinates: { lat: 28.4949, lng: 77.0895 },
    rating: 4.8,
    reviewsCount: 165,
    hourlyPrice: 1500,
    heroImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'European Monofilament Turf', icon: 'CheckCircle' },
      { name: 'Corporate Tournament Ready', icon: 'Trophy' },
      { name: 'Ample Basement Parking', icon: 'Truck' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1200 },
      { id: 's2', time: '07:00 PM - 08:30 PM', status: 'Available', price: 1600 }
    ],
    owner: { name: 'Devendra Bhatia', phone: '+91 98110 99887', verified: true },
    reviews: []
  },
  {
    id: 'ground_delhi_2',
    name: 'Siri Fort Badminton & Pickleball Arena',
    tagline: 'Indoor Wooden Courts with Pro Lighting',
    category: 'Badminton & Pickleball',
    supportedSports: ['Badminton', 'Pickleball', 'Tennis'],
    location: 'August Kranti Marg, Siri Fort, New Delhi, Delhi NCR',
    city: 'Delhi NCR',
    distance: '4.0 km',
    coordinates: { lat: 28.5521, lng: 77.2185 },
    rating: 4.9,
    reviewsCount: 210,
    hourlyPrice: 600,
    heroImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'Air-Conditioned Indoor Hall', icon: 'Wind' },
      { name: 'Yonex Pro Mats', icon: 'CheckCircle' },
      { name: 'Showers & Steam', icon: 'Droplet' }
    ],
    slots: [
      { id: 's1', time: '07:00 AM - 08:00 AM', status: 'Available', price: 600 },
      { id: 's2', time: '06:00 PM - 07:00 PM', status: 'Available', price: 700 }
    ],
    owner: { name: 'Anil Kapoor', phone: '+91 98101 22334', verified: true },
    reviews: []
  },

  // Pune
  {
    id: 'ground_pune_1',
    name: 'Deccan Sports Turf & Box Club',
    tagline: 'Central Pune Premier Football & Cricket Turf',
    category: 'Multi-sport Arena',
    supportedSports: ['Football', 'Cricket'],
    location: 'FC Road, Deccan Gymkhana, Pune',
    city: 'Pune',
    distance: '1.5 km',
    coordinates: { lat: 18.5196, lng: 73.8415 },
    rating: 4.8,
    reviewsCount: 140,
    hourlyPrice: 1200,
    heroImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'Shock-Absorbing Turf Cushion', icon: 'CheckCircle' },
      { name: 'LED Floodlights', icon: 'Sun' },
      { name: 'Dedicated Parking Lot', icon: 'Truck' },
      { name: 'Juice & Snacks Bar', icon: 'Coffee' }
    ],
    slots: [
      { id: 's1', time: '06:30 AM - 08:00 AM', status: 'Available', price: 1000 },
      { id: 's2', time: '06:00 PM - 07:30 PM', status: 'Available', price: 1300 },
      { id: 's3', time: '08:00 PM - 09:30 PM', status: 'Available', price: 1400 }
    ],
    owner: { name: 'Mandar Deshmukh', phone: '+91 98220 44556', verified: true },
    reviews: []
  },
  {
    id: 'ground_pune_2',
    name: 'Koregaon Park Smash Arena',
    tagline: 'Boutique Pickleball & Badminton Arena',
    category: 'Pickleball & Badminton',
    supportedSports: ['Pickleball', 'Badminton', 'Tennis'],
    location: 'Lane 7, Koregaon Park, Pune',
    city: 'Pune',
    distance: '3.1 km',
    coordinates: { lat: 18.5362, lng: 73.8941 },
    rating: 4.9,
    reviewsCount: 95,
    hourlyPrice: 550,
    heroImage: 'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'USAPA Certified Courts', icon: 'CheckCircle' },
      { name: 'Carbon Paddles & Balls Included', icon: 'Package' },
      { name: 'Cafe with Outdoor Seating', icon: 'Coffee' }
    ],
    slots: [
      { id: 's1', time: '07:00 AM - 08:30 AM', status: 'Available', price: 500 },
      { id: 's2', time: '05:30 PM - 07:00 PM', status: 'Available', price: 650 }
    ],
    owner: { name: 'Tanvi Shinde', phone: '+91 98229 11223', verified: true },
    reviews: []
  },

  // Hyderabad
  {
    id: 'ground_hyd_1',
    name: 'HITEC City Sports Club',
    tagline: 'Floodlit 7v7 Football & Cricket Arena',
    category: 'Multi-sport Turf',
    supportedSports: ['Football', 'Cricket'],
    location: 'Mindspace Road, Madhapur, Hyderabad',
    city: 'Hyderabad',
    distance: '2.0 km',
    coordinates: { lat: 17.4435, lng: 78.3772 },
    rating: 4.8,
    reviewsCount: 175,
    hourlyPrice: 1350,
    heroImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80',
    gallery: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80'],
    amenities: [
      { name: 'High-Density Monofilament Grass', icon: 'CheckCircle' },
      { name: 'Scoreboard & Sound', icon: 'Volume2' },
      { name: 'Spacious Parking', icon: 'Truck' }
    ],
    slots: [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1100 },
      { id: 's2', time: '07:00 PM - 08:30 PM', status: 'Available', price: 1400 }
    ],
    owner: { name: 'Venkatesh Reddy', phone: '+91 98480 66778', verified: true },
    reviews: []
  }
];

export const SEED_MATCHES = [
  // Bangalore
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
    description: 'Competitive yet friendly 7v7 football under floodlights. High tempo game with bibs and match ball provided.',
    rules: ['Turf shoes or flat studs only', 'Reach 15 mins before kick-off'],
    roster: [
      { id: 'usr_me', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Midfielder', status: 'Confirmed' },
      { id: 'usr_1', name: 'Rohan Sharma (Host)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', role: 'Defender', status: 'Host' }
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
    description: 'Weekend morning box cricket! Leather bounce tennis balls, quality bats provided.',
    rules: ['Over the roof boundary is out', 'Arrive by 6:50 AM'],
    roster: [
      { id: 'usr_6', name: 'Aditya Nair (Host)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', role: 'All-Rounder', status: 'Host' }
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
    description: 'High intensity Yonex feather shuttle sparring for tournament level badminton.',
    rules: ['Non-marking shoes compulsory', 'Yonex feather shuttles provided'],
    roster: [
      { id: 'usr_9', name: 'Tanya Sengupta (Host)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', role: 'Player', status: 'Host' }
    ]
  },

  // Mumbai
  {
    id: 'match_mumbai_1',
    title: 'Bandra Sunset 5v5 Football League',
    sport: 'Football',
    coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_mb_1',
      name: 'Aryan Dsouza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      verified: true
    },
    date: 'Today, 28 Oct',
    time: '6:30 PM - 8:00 PM',
    duration: '1.5 hrs',
    venue: 'Bandra Urban Sports Arena',
    venueId: 'ground_mumbai_1',
    distance: '2.1 km away',
    city: 'Mumbai',
    playersJoined: 8,
    totalSpots: 10,
    pricePerPerson: 250,
    totalCost: 2500,
    skillLevel: 'Intermediate',
    status: 'Spots Available',
    isPublic: true,
    description: 'Fast paced 5v5 rooftop game near Carter Road. Cool coastal breeze, high tempo ball play.',
    rules: ['Turf flat soles only', 'Bibs provided'],
    roster: [
      { id: 'usr_mb_1', name: 'Aryan Dsouza (Host)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'Host', status: 'Host' }
    ]
  },
  {
    id: 'match_mumbai_2',
    title: 'Andheri Saturday Night Box Cricket',
    sport: 'Cricket',
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_mb_2',
      name: 'Nikhil Kothari',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Tomorrow, 29 Oct',
    time: '8:00 PM - 10:00 PM',
    duration: '2.0 hrs',
    venue: 'Andheri Kickbox & Padel Club',
    venueId: 'ground_mumbai_2',
    distance: '3.6 km away',
    city: 'Mumbai',
    playersJoined: 10,
    totalSpots: 14,
    pricePerPerson: 200,
    totalCost: 2800,
    skillLevel: 'All Levels',
    status: 'Spots Available',
    isPublic: true,
    description: 'Competitive box cricket with heavy tennis balls. Powerplay overs and boundary net rules.',
    rules: ['Direct roof hit is out', '1 drop 1 hand catch valid'],
    roster: [
      { id: 'usr_mb_2', name: 'Nikhil Kothari (Host)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', role: 'Captain', status: 'Host' }
    ]
  },

  // Delhi NCR
  {
    id: 'match_delhi_1',
    title: 'Gurugram Floodlit 7v7 Corporate Derby',
    sport: 'Football',
    coverImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_dl_1',
      name: 'Kunal Grover',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      rating: 4.7,
      verified: true
    },
    date: 'Today, 28 Oct',
    time: '7:30 PM - 9:00 PM',
    duration: '1.5 hrs',
    venue: 'CyberTurf Sports Park, Gurugram',
    venueId: 'ground_delhi_1',
    distance: '2.5 km away',
    city: 'Delhi NCR',
    playersJoined: 12,
    totalSpots: 14,
    pricePerPerson: 240,
    totalCost: 3360,
    skillLevel: 'Intermediate',
    status: 'Almost Full',
    isPublic: true,
    description: 'High energy 7v7 football under Cyber City floodlights. Quality match ball and bibs provided.',
    rules: ['Rubber studs only', 'Fair play strictly observed'],
    roster: [
      { id: 'usr_dl_1', name: 'Kunal Grover (Host)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', role: 'Host', status: 'Host' }
    ]
  },

  // Pune
  {
    id: 'match_pune_1',
    title: 'FC Road Deccan 6v6 Football Showdown',
    sport: 'Football',
    coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_pn_1',
      name: 'Pranav Joshi',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      verified: true
    },
    date: 'Today, 28 Oct',
    time: '7:00 PM - 8:30 PM',
    duration: '1.5 hrs',
    venue: 'Deccan Sports Turf & Box Club',
    venueId: 'ground_pune_1',
    distance: '1.5 km away',
    city: 'Pune',
    playersJoined: 10,
    totalSpots: 12,
    pricePerPerson: 190,
    totalCost: 2280,
    skillLevel: 'Intermediate',
    status: 'Spots Available',
    isPublic: true,
    description: 'Fast 6v6 evening game right on FC Road! All skill levels welcome, good vibe and chilled water provided.',
    rules: ['Turf flat soles only', 'Please reach on time'],
    roster: [
      { id: 'usr_pn_1', name: 'Pranav Joshi (Host)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', role: 'Host', status: 'Host' }
    ]
  },
  {
    id: 'match_pune_2',
    title: 'Koregaon Park Pickleball Doubles Rally',
    sport: 'Pickleball',
    coverImage: 'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_pn_2',
      name: 'Ria Sawant',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Tomorrow, 29 Oct',
    time: '6:00 PM - 7:30 PM',
    duration: '1.5 hrs',
    venue: 'Koregaon Park Smash Arena',
    venueId: 'ground_pune_2',
    distance: '3.1 km away',
    city: 'Pune',
    playersJoined: 4,
    totalSpots: 4,
    pricePerPerson: 150,
    totalCost: 600,
    skillLevel: 'All Levels',
    status: 'Full',
    isPublic: true,
    description: 'Friendly social pickleball doubles rally. Paddles and outdoor balls provided at the court.',
    rules: ['Non-marking shoes', 'Kitchen rule strictly followed'],
    roster: [
      { id: 'usr_pn_2', name: 'Ria Sawant (Host)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Host', status: 'Host' }
    ]
  },

  // Hyderabad
  {
    id: 'match_hyd_1',
    title: 'Madhapur Midnight Box Cricket Tournament',
    sport: 'Cricket',
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    host: {
      id: 'usr_hyd_1',
      name: 'Sravan Teja',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      verified: true
    },
    date: 'Today, 28 Oct',
    time: '9:00 PM - 11:00 PM',
    duration: '2.0 hrs',
    venue: 'HITEC City Sports Club',
    venueId: 'ground_hyd_1',
    distance: '2.0 km away',
    city: 'Hyderabad',
    playersJoined: 11,
    totalSpots: 16,
    pricePerPerson: 180,
    totalCost: 2880,
    skillLevel: 'All Levels',
    status: 'Spots Available',
    isPublic: true,
    description: 'Weekend floodlight box cricket in Madhapur. Chilled energy drinks and floodlit boundary thrill!',
    rules: ['Box cricket rules apply', 'Reach 10 mins early'],
    roster: [
      { id: 'usr_hyd_1', name: 'Sravan Teja (Host)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', role: 'Host', status: 'Host' }
    ]
  }
];

export const SEED_USERS = [
  {
    id: 'usr_me',
    name: 'Alex Morgan',
    email: 'alex.morgan@playmate.io',
    role: 'player',
    city: 'Bangalore',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Midfielder on the pitch, aggressive badminton smasher on weekends.',
    rating: 4.9,
    matchesPlayed: 42,
    hostedCount: 12,
    onTimeRate: '98%',
    fairPlayScore: '5.0 / 5'
  },
  {
    id: 'usr_owner_1',
    name: 'Sunil Rao',
    email: 'sunil@kickoffarena.com',
    role: 'owner',
    city: 'Bangalore',
    phone: '+91 99887 76655',
    venueId: 'ground_1',
    venueName: 'Kickoff Arena Turf'
  },
  {
    id: 'usr_owner_pune',
    name: 'Vikram Patil',
    email: 'vikram@puneturf.com',
    role: 'owner',
    city: 'Pune',
    phone: '+91 98230 11223',
    venueId: 'ground_1793188984294',
    venueName: 'Shivajinagar Pro Turf Arena'
  }
];

export const SEED_BOOKINGS = [
  {
    id: 'bk_101',
    bookingRef: 'PM-FBL-8821',
    userId: 'usr_me',
    userName: 'Alex Morgan',
    userRole: 'player',
    groundId: 'ground_1',
    groundName: 'Kickoff Arena Turf',
    city: 'Bangalore',
    sport: 'Football',
    date: 'Today, 28 Oct',
    timeSlot: '07:00 PM - 08:00 PM',
    slotId: 's5',
    duration: '1.0 hr',
    court: 'Turf A - FIFA Pro',
    totalAmount: 1400,
    splitShare: 200,
    status: 'confirmed',
    paymentStatus: 'Paid (Demo - Sandbox)',
    refundStatus: 'none',
    type: 'match_linked',
    matchId: 'match_1',
    createdAt: '2026-10-28T09:00:00.000Z'
  },
  {
    id: 'bk_102',
    bookingRef: 'PM-BAD-4402',
    userId: 'usr_me',
    userName: 'Alex Morgan',
    userRole: 'player',
    groundId: 'ground_3',
    groundName: 'Velocity Badminton Hub',
    city: 'Bangalore',
    sport: 'Badminton',
    date: 'Tomorrow, 29 Oct',
    timeSlot: '06:00 PM - 07:00 PM',
    slotId: 's2',
    duration: '1.0 hr',
    court: 'Court 3 (Synthetic Wooden)',
    totalAmount: 450,
    splitShare: 450,
    status: 'confirmed',
    paymentStatus: 'Paid (Demo - Sandbox)',
    refundStatus: 'none',
    type: 'direct_booking',
    createdAt: '2026-10-28T10:00:00.000Z'
  },
  {
    id: 'bk_103',
    bookingRef: 'PM-CRK-9913',
    userId: 'usr_me',
    userName: 'Alex Morgan',
    userRole: 'player',
    groundId: 'ground_2',
    groundName: 'SkyTurf Sports Club',
    city: 'Bangalore',
    sport: 'Cricket',
    date: 'Wed, 30 Oct',
    timeSlot: '04:00 PM - 05:30 PM',
    slotId: 's2',
    duration: '1.5 hrs',
    court: 'Rooftop Arena 1',
    totalAmount: 1100,
    splitShare: 1100,
    status: 'pending',
    paymentStatus: 'Awaiting Turf Confirmation (Demo)',
    refundStatus: 'none',
    type: 'direct_booking',
    createdAt: '2026-10-28T11:00:00.000Z'
  },
  {
    id: 'bk_104',
    bookingRef: 'PM-FBL-1200',
    userId: 'usr_me',
    userName: 'Alex Morgan',
    userRole: 'player',
    groundId: 'ground_1',
    groundName: 'Kickoff Arena Turf',
    city: 'Bangalore',
    sport: 'Football',
    date: 'Yesterday, 27 Oct',
    timeSlot: '06:00 AM - 07:00 AM',
    slotId: 's1',
    duration: '1.0 hr',
    court: 'Main Turf',
    totalAmount: 1000,
    splitShare: 1000,
    status: 'cancelled',
    paymentStatus: 'Refund Pending (Demo - Verification required)',
    refundStatus: 'refund_pending',
    cancelledAt: '2026-10-27T16:00:00.000Z',
    type: 'direct_booking',
    createdAt: '2026-10-27T12:00:00.000Z'
  }
];

