// Comprehensive Grandmaster & Competitive Chess Leaderboard Dataset
// 76 Grandmasters & Competitors across 10 Countries (at least 7 per country)

export const COUNTRY_NAMES = {
  world: 'Worldwide',
  IN: 'India',
  US: 'United States',
  NO: 'Norway',
  ES: 'Spain',
  DE: 'Germany',
  FR: 'France',
  GB: 'United Kingdom',
  JP: 'Japan',
  BR: 'Brazil',
  CA: 'Canada'
};

export const COUNTRY_FLAGS = {
  world: '🌐',
  IN: '🇮🇳',
  US: '🇺🇸',
  NO: '🇳🇴',
  ES: '🇪🇸',
  DE: '🇩🇪',
  FR: '🇫🇷',
  GB: '🇬🇧',
  JP: '🇯🇵',
  BR: '🇧🇷',
  CA: '🇨🇦',
  UN: '🌐'
};

export const RAW_LEADERBOARD_PLAYERS = [
  // --- NORWAY (NO) ---
  {
    id: 'p_no_1',
    username: 'VikingKing',
    title: 'GM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2890, blitz: 2885, rapid: 2840, classical: 2865 },
    stats: { won: 295, lost: 55, played: 350 },
    puzzles: 215,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_no_2',
    username: 'AryanTari',
    title: 'GM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2680, blitz: 2675, rapid: 2640, classical: 2655 },
    stats: { won: 195, lost: 65, played: 260 },
    puzzles: 170,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'Elite',
    isOnline: false
  },
  {
    id: 'p_no_3',
    username: 'NordicShield',
    title: 'GM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2620, blitz: 2610, rapid: 2595, classical: 2605 },
    stats: { won: 180, lost: 70, played: 250 },
    puzzles: 155,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Christiansen',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_no_4',
    username: 'FrodeUrk',
    title: 'GM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2560, blitz: 2555, rapid: 2540, classical: 2550 },
    stats: { won: 165, lost: 75, played: 240 },
    puzzles: 140,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FrodeUrk',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_no_5',
    username: 'HammerTactics',
    title: 'GM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2650, blitz: 2640, rapid: 2630, classical: 2635 },
    stats: { won: 210, lost: 85, played: 295 },
    puzzles: 180,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_no_6',
    username: 'OsloBishop',
    title: 'IM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2490, blitz: 2480, rapid: 2470, classical: 2475 },
    stats: { won: 150, lost: 80, played: 230 },
    puzzles: 130,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=OsloBishop',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_no_7',
    username: 'FjordGambit',
    title: 'IM',
    country: 'NO',
    countryName: 'Norway',
    ratings: { bullet: 2430, blitz: 2420, rapid: 2415, classical: 2425 },
    stats: { won: 140, lost: 90, played: 230 },
    puzzles: 125,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FjordGambit',
    tier: 'Master',
    isOnline: true
  },

  // --- INDIA (IN) ---
  {
    id: 'p_in_1',
    username: 'YouthMaster',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2790, blitz: 2800, rapid: 2810, classical: 2835 },
    stats: { won: 270, lost: 50, played: 320 },
    puzzles: 210,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_in_2',
    username: 'PraggThunder',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2780, blitz: 2795, rapid: 2805, classical: 2810 },
    stats: { won: 260, lost: 55, played: 315 },
    puzzles: 205,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Pragg',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_in_3',
    username: 'ArjunStrike',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2800, blitz: 2810, rapid: 2795, classical: 2805 },
    stats: { won: 280, lost: 60, played: 340 },
    puzzles: 195,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Arjun',
    tier: 'Elite',
    isOnline: false
  },
  {
    id: 'p_in_4',
    username: 'MadrasTiger',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2740, blitz: 2755, rapid: 2760, classical: 2775 },
    stats: { won: 380, lost: 90, played: 470 },
    puzzles: 250,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    tier: 'Elite',
    isOnline: false
  },
  {
    id: 'p_in_5',
    username: 'ViditGujrathi',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2720, blitz: 2730, rapid: 2740, classical: 2745 },
    stats: { won: 230, lost: 75, played: 305 },
    puzzles: 185,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vidit',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_in_6',
    username: 'NihalLightning',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2850, blitz: 2820, rapid: 2715, classical: 2690 },
    stats: { won: 290, lost: 80, played: 370 },
    puzzles: 190,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nihal',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_in_7',
    username: 'HumpyQueen',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2560, blitz: 2580, rapid: 2590, classical: 2600 },
    stats: { won: 200, lost: 70, played: 270 },
    puzzles: 160,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_in_8',
    username: 'HarikrishnaP',
    title: 'GM',
    country: 'IN',
    countryName: 'India',
    ratings: { bullet: 2690, blitz: 2700, rapid: 2710, classical: 2715 },
    stats: { won: 220, lost: 80, played: 300 },
    puzzles: 175,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Harikrishna',
    tier: 'Master',
    isOnline: true
  },

  // --- UNITED STATES (US) ---
  {
    id: 'p_us_1',
    username: 'DeepCalculator',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2820, blitz: 2835, rapid: 2810, classical: 2840 },
    stats: { won: 310, lost: 65, played: 375 },
    puzzles: 220,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_us_2',
    username: 'SpeedDemon',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2950, blitz: 2890, rapid: 2790, classical: 2800 },
    stats: { won: 420, lost: 95, played: 515 },
    puzzles: 260,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_us_3',
    username: 'WesleySolid',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2790, blitz: 2810, rapid: 2780, classical: 2795 },
    stats: { won: 260, lost: 50, played: 310 },
    puzzles: 195,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Wesley',
    tier: 'Elite',
    isOnline: false
  },
  {
    id: 'p_us_4',
    username: 'LevonMagic',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2770, blitz: 2780, rapid: 2765, classical: 2770 },
    stats: { won: 280, lost: 85, played: 365 },
    puzzles: 200,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Levon',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_us_5',
    username: 'HansSpeaks',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2740, blitz: 2750, rapid: 2735, classical: 2745 },
    stats: { won: 240, lost: 85, played: 325 },
    puzzles: 180,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hans',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_us_6',
    username: 'LeinierTactics',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2710, blitz: 2725, rapid: 2730, classical: 2740 },
    stats: { won: 215, lost: 65, played: 280 },
    puzzles: 170,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leinier',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_us_7',
    username: 'SamSevian',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2690, blitz: 2700, rapid: 2695, classical: 2705 },
    stats: { won: 200, lost: 75, played: 275 },
    puzzles: 165,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sevian',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_us_8',
    username: 'RayRobson',
    title: 'GM',
    country: 'US',
    countryName: 'United States',
    ratings: { bullet: 2730, blitz: 2715, rapid: 2685, classical: 2700 },
    stats: { won: 210, lost: 80, played: 290 },
    puzzles: 175,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Robson',
    tier: 'Master',
    isOnline: true
  },

  // --- SPAIN (ES) ---
  {
    id: 'p_es_1',
    username: 'MatadorVallejo',
    title: 'GM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2690, blitz: 2705, rapid: 2710, classical: 2715 },
    stats: { won: 230, lost: 80, played: 310 },
    puzzles: 175,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vallejo',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_es_2',
    username: 'FireOnBoard',
    title: 'GM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2720, blitz: 2710, rapid: 2695, classical: 2680 },
    stats: { won: 270, lost: 105, played: 375 },
    puzzles: 210,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shirov',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_es_3',
    username: 'DavidGuijarro',
    title: 'GM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2670, blitz: 2680, rapid: 2675, classical: 2685 },
    stats: { won: 195, lost: 75, played: 270 },
    puzzles: 160,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guijarro',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_es_4',
    username: 'JaimeSantos',
    title: 'GM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2650, blitz: 2660, rapid: 2655, classical: 2665 },
    stats: { won: 185, lost: 70, played: 255 },
    puzzles: 150,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Santos',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_es_5',
    username: 'DaniilYuffa',
    title: 'GM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2660, blitz: 2650, rapid: 2640, classical: 2635 },
    stats: { won: 175, lost: 75, played: 250 },
    puzzles: 145,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yuffa',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_es_6',
    username: 'IbarraChess',
    title: 'GM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2580, blitz: 2590, rapid: 2585, classical: 2595 },
    stats: { won: 160, lost: 70, played: 230 },
    puzzles: 135,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ibarra',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_es_7',
    username: 'MadridRook',
    title: 'IM',
    country: 'ES',
    countryName: 'Spain',
    ratings: { bullet: 2490, blitz: 2500, rapid: 2495, classical: 2510 },
    stats: { won: 145, lost: 80, played: 225 },
    puzzles: 125,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MadridRook',
    tier: 'Master',
    isOnline: true
  },

  // --- GERMANY (DE) ---
  {
    id: 'p_de_1',
    username: 'VincentKeymer',
    title: 'GM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2730, blitz: 2745, rapid: 2755, classical: 2760 },
    stats: { won: 240, lost: 65, played: 305 },
    puzzles: 195,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Keymer',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_de_2',
    username: 'MatthiasBlue',
    title: 'GM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2680, blitz: 2690, rapid: 2695, classical: 2700 },
    stats: { won: 210, lost: 70, played: 280 },
    puzzles: 170,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bluebaum',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_de_3',
    username: 'DonchenkoBlitz',
    title: 'GM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2710, blitz: 2700, rapid: 2675, classical: 2680 },
    stats: { won: 220, lost: 85, played: 305 },
    puzzles: 180,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Donchenko',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_de_4',
    username: 'KollarsKnight',
    title: 'GM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2640, blitz: 2650, rapid: 2655, classical: 2660 },
    stats: { won: 185, lost: 70, played: 255 },
    puzzles: 155,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kollars',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_de_5',
    username: 'RasmusSvane',
    title: 'GM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2630, blitz: 2635, rapid: 2640, classical: 2645 },
    stats: { won: 175, lost: 65, played: 240 },
    puzzles: 150,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rasmus',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_de_6',
    username: 'NisipeanuKing',
    title: 'GM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2610, blitz: 2615, rapid: 2620, classical: 2630 },
    stats: { won: 230, lost: 95, played: 325 },
    puzzles: 165,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nisipeanu',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_de_7',
    username: 'BerlinDefense',
    title: 'IM',
    country: 'DE',
    countryName: 'Germany',
    ratings: { bullet: 2510, blitz: 2520, rapid: 2530, classical: 2540 },
    stats: { won: 155, lost: 75, played: 230 },
    puzzles: 135,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=BerlinDefense',
    tier: 'Master',
    isOnline: true
  },

  // --- FRANCE (FR) ---
  {
    id: 'p_fr_1',
    username: 'AlirezaSpeed',
    title: 'GM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2910, blitz: 2880, rapid: 2825, classical: 2815 },
    stats: { won: 340, lost: 75, played: 415 },
    puzzles: 240,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Firouzja',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_fr_2',
    username: 'MVL_Najdorf',
    title: 'GM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2840, blitz: 2830, rapid: 2795, classical: 2785 },
    stats: { won: 360, lost: 90, played: 450 },
    puzzles: 225,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_fr_3',
    username: 'EtienneBacrot',
    title: 'GM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2680, blitz: 2685, rapid: 2690, classical: 2700 },
    stats: { won: 250, lost: 85, played: 335 },
    puzzles: 175,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bacrot',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_fr_4',
    username: 'FressinetCoach',
    title: 'GM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2650, blitz: 2660, rapid: 2665, classical: 2670 },
    stats: { won: 210, lost: 80, played: 290 },
    puzzles: 165,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fressinet',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_fr_5',
    username: 'MarcMaurizzi',
    title: 'GM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2640, blitz: 2635, rapid: 2625, classical: 2630 },
    stats: { won: 170, lost: 65, played: 235 },
    puzzles: 145,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maurizzi',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_fr_6',
    username: 'ChristianBauer',
    title: 'GM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2600, blitz: 2605, rapid: 2610, classical: 2615 },
    stats: { won: 190, lost: 85, played: 275 },
    puzzles: 150,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bauer',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_fr_7',
    username: 'ParisianPawn',
    title: 'IM',
    country: 'FR',
    countryName: 'France',
    ratings: { bullet: 2520, blitz: 2515, rapid: 2505, classical: 2515 },
    stats: { won: 150, lost: 75, played: 225 },
    puzzles: 130,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ParisianPawn',
    tier: 'Master',
    isOnline: false
  },

  // --- UNITED KINGDOM (GB) ---
  {
    id: 'p_gb_1',
    username: 'MickeyAdams',
    title: 'GM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2690, blitz: 2705, rapid: 2715, classical: 2725 },
    stats: { won: 320, lost: 90, played: 410 },
    puzzles: 200,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MickeyAdams',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_gb_2',
    username: 'DavidHowell',
    title: 'GM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2710, blitz: 2700, rapid: 2690, classical: 2695 },
    stats: { won: 230, lost: 75, played: 305 },
    puzzles: 180,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Howell',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_gb_3',
    username: 'GawainJones',
    title: 'GM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2660, blitz: 2670, rapid: 2675, classical: 2680 },
    stats: { won: 220, lost: 80, played: 300 },
    puzzles: 170,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gawain',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_gb_4',
    username: 'LukeMcShane',
    title: 'GM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2680, blitz: 2675, rapid: 2665, classical: 2670 },
    stats: { won: 205, lost: 70, played: 275 },
    puzzles: 165,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=McShane',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_gb_5',
    username: 'MatthewSadler',
    title: 'GM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2640, blitz: 2650, rapid: 2655, classical: 2660 },
    stats: { won: 240, lost: 75, played: 315 },
    puzzles: 185,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sadler',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_gb_6',
    username: 'LondonTactics',
    title: 'IM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2540, blitz: 2550, rapid: 2545, classical: 2555 },
    stats: { won: 165, lost: 80, played: 245 },
    puzzles: 140,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LondonTactics',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_gb_7',
    username: 'CrownGambit',
    title: 'IM',
    country: 'GB',
    countryName: 'United Kingdom',
    ratings: { bullet: 2480, blitz: 2490, rapid: 2485, classical: 2495 },
    stats: { won: 140, lost: 75, played: 215 },
    puzzles: 125,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CrownGambit',
    tier: 'Master',
    isOnline: true
  },

  // --- JAPAN (JP) ---
  {
    id: 'p_jp_1',
    username: 'ShinyaKojima',
    title: 'IM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2540, blitz: 2550, rapid: 2560, classical: 2565 },
    stats: { won: 190, lost: 70, played: 260 },
    puzzles: 155,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kojima',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_jp_2',
    username: 'ShogiMasterMirai',
    title: 'IM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2570, blitz: 2560, rapid: 2545, classical: 2550 },
    stats: { won: 180, lost: 65, played: 245 },
    puzzles: 160,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mirai',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_jp_3',
    username: 'TokyoRook',
    title: 'FM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2480, blitz: 2490, rapid: 2495, classical: 2500 },
    stats: { won: 160, lost: 75, played: 235 },
    puzzles: 140,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TokyoRook',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_jp_4',
    username: 'RyosukeNanjo',
    title: 'FM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2460, blitz: 2470, rapid: 2465, classical: 2475 },
    stats: { won: 150, lost: 70, played: 220 },
    puzzles: 135,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nanjo',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_jp_5',
    username: 'SamuraiBlade',
    title: 'FM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2430, blitz: 2440, rapid: 2450, classical: 2455 },
    stats: { won: 145, lost: 80, played: 225 },
    puzzles: 130,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samurai',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_jp_6',
    username: 'KyotoKnight',
    title: 'CM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2390, blitz: 2400, rapid: 2410, classical: 2420 },
    stats: { won: 135, lost: 75, played: 210 },
    puzzles: 120,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KyotoKnight',
    tier: 'Skilled',
    isOnline: false
  },
  {
    id: 'p_jp_7',
    username: 'FujiDragon',
    title: 'CM',
    country: 'JP',
    countryName: 'Japan',
    ratings: { bullet: 2360, blitz: 2370, rapid: 2380, classical: 2390 },
    stats: { won: 125, lost: 80, played: 205 },
    puzzles: 115,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FujiDragon',
    tier: 'Skilled',
    isOnline: true
  },

  // --- BRAZIL (BR) ---
  {
    id: 'p_br_1',
    username: 'SupiTactics',
    title: 'GM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2740, blitz: 2725, rapid: 2690, classical: 2685 },
    stats: { won: 240, lost: 80, played: 320 },
    puzzles: 190,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Supi',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_br_2',
    username: 'AlexandrFier',
    title: 'GM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2710, blitz: 2695, rapid: 2675, classical: 2665 },
    stats: { won: 250, lost: 90, played: 340 },
    puzzles: 185,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fier',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_br_3',
    username: 'MeckingLegend',
    title: 'GM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2620, blitz: 2635, rapid: 2650, classical: 2660 },
    stats: { won: 300, lost: 95, played: 395 },
    puzzles: 200,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mecking',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_br_4',
    username: 'RafaelLeitao',
    title: 'GM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2640, blitz: 2635, rapid: 2640, classical: 2645 },
    stats: { won: 210, lost: 75, played: 285 },
    puzzles: 170,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leitao',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_br_5',
    username: 'GilbertoMilos',
    title: 'GM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2590, blitz: 2600, rapid: 2610, classical: 2615 },
    stats: { won: 195, lost: 85, played: 280 },
    puzzles: 160,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milos',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_br_6',
    username: 'SambaCheckmate',
    title: 'IM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2510, blitz: 2520, rapid: 2525, classical: 2530 },
    stats: { won: 160, lost: 70, played: 230 },
    puzzles: 140,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samba',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_br_7',
    username: 'RioBishop',
    title: 'IM',
    country: 'BR',
    countryName: 'Brazil',
    ratings: { bullet: 2470, blitz: 2480, rapid: 2485, classical: 2490 },
    stats: { won: 145, lost: 75, played: 220 },
    puzzles: 130,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RioBishop',
    tier: 'Master',
    isOnline: false
  },

  // --- CANADA (CA) ---
  {
    id: 'p_ca_1',
    username: 'ChessQueenAnna',
    title: 'WGM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2380, blitz: 2360, rapid: 2350, classical: 2340 },
    stats: { won: 190, lost: 65, played: 255 },
    puzzles: 175,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_ca_2',
    username: 'ChessBrahEric',
    title: 'GM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2790, blitz: 2750, rapid: 2710, classical: 2690 },
    stats: { won: 350, lost: 95, played: 445 },
    puzzles: 215,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=EricHansen',
    tier: 'Elite',
    isOnline: true
  },
  {
    id: 'p_ca_3',
    username: 'AmanHambleton',
    title: 'GM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2660, blitz: 2640, rapid: 2625, classical: 2630 },
    stats: { won: 220, lost: 85, played: 305 },
    puzzles: 170,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hambleton',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_ca_4',
    username: 'NikolayNoritsyn',
    title: 'IM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2590, blitz: 2600, rapid: 2605, classical: 2610 },
    stats: { won: 185, lost: 70, played: 255 },
    puzzles: 155,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noritsyn',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_ca_5',
    username: 'BatorSambuev',
    title: 'GM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2580, blitz: 2570, rapid: 2575, classical: 2580 },
    stats: { won: 195, lost: 80, played: 275 },
    puzzles: 160,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sambuev',
    tier: 'Master',
    isOnline: false
  },
  {
    id: 'p_ca_6',
    username: 'MapleKnight',
    title: 'FM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2490, blitz: 2500, rapid: 2510, classical: 2515 },
    stats: { won: 150, lost: 75, played: 225 },
    puzzles: 135,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MapleKnight',
    tier: 'Master',
    isOnline: true
  },
  {
    id: 'p_ca_7',
    username: 'TorontoRook',
    title: 'FM',
    country: 'CA',
    countryName: 'Canada',
    ratings: { bullet: 2440, blitz: 2450, rapid: 2460, classical: 2470 },
    stats: { won: 140, lost: 70, played: 210 },
    puzzles: 125,
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TorontoRook',
    tier: 'Master',
    isOnline: false
  }
];

// Helper: Get filtered and properly ranked list
// If region is 'world', returns top 50 players worldwide
// If region is country code (e.g. 'IN', 'US', etc.), returns all players from that country (at least 7)
export function getLeaderboard(region = 'world', format = 'rapid') {
  const safeFormat = ['bullet', 'blitz', 'rapid', 'classical'].includes(format) ? format : 'rapid';

  let list = [...RAW_LEADERBOARD_PLAYERS];

  if (region !== 'world' && region !== 'all') {
    list = list.filter(p => p.country.toUpperCase() === region.toUpperCase());
  }

  // Sort by rating in selected format descending
  list.sort((a, b) => {
    const rateA = a.ratings?.[safeFormat] || a.rating || 1200;
    const rateB = b.ratings?.[safeFormat] || b.rating || 1200;
    return rateB - rateA;
  });

  // If worldwide, slice to top 50 players
  if (region === 'world' || region === 'all') {
    list = list.slice(0, 50);
  }

  // Assign 1-indexed rank
  return list.map((p, idx) => ({
    ...p,
    rank: idx + 1,
    rating: p.ratings?.[safeFormat] || 1200,
    wins: p.stats?.won || Math.floor((idx + 1) * 3 + 15),
    puzzles: p.puzzles || Math.floor((idx + 1) * 12 + 45)
  }));
}

// Exact Mathematical Calculation for User Ranking and Percentile
// Guarantees rank and percentile are 100% consistent with each other and ELO
export function calculateUserRanking(elo = 1200, totalPlayers = 1042040, countryCode = 'IN') {
  const numericElo = Number(elo) || 1200;

  // Calibrated Gaussian CDF model for online chess rating distribution
  // Mean mu = 920, Standard deviation sigma = 260
  const z = (numericElo - 920) / 260;
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2.0);
  let p = 1.0 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z < 0) p = 1.0 - p;

  // Clamp percentile safely
  const clampedP = Math.max(0.0001, Math.min(0.9999, p));
  const percentile = (clampedP * 100).toFixed(1);

  // Exact mathematical relation: userRank = round(totalPlayers * (1 - p))
  const rank = Math.max(1, Math.round(totalPlayers * (1 - clampedP)));

  // Country factor based on country population/chess community
  const countryFactors = {
    IN: 0.052,
    US: 0.088,
    RU: 0.065,
    DE: 0.035,
    FR: 0.032,
    ES: 0.030,
    GB: 0.028,
    CA: 0.022,
    BR: 0.025,
    JP: 0.015,
    NO: 0.008
  };
  const factor = countryFactors[countryCode?.toUpperCase()] || 0.035;
  const countryRank = Math.max(1, Math.round(rank * factor));

  return {
    rank,
    totalPlayers,
    percentile,
    countryRank
  };
}
