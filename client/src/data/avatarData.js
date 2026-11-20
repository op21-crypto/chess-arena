/**
 * Famous Avatars Dataset across Popular Categories
 * High quality SVG vector avatars powered by DiceBear API styles (adventurer, bottts, lorelei, fun-emoji)
 */

export const AVATAR_CATEGORIES = [
  { id: 'all', label: 'All Avatars', icon: '✨' },
  { id: 'anime', label: 'Anime Legends', icon: '⚡' },
  { id: 'heroes', label: 'Superheroes', icon: '🦸' },
  { id: 'gaming', label: 'Gaming Icons', icon: '🎮' },
  { id: 'chess', label: 'Chess Royalty', icon: '👑' },
  { id: 'myth', label: 'Myth & Warriors', icon: '⚔️' },
  { id: 'mascots', label: 'Chibi & Mascots', icon: '🐾' }
];

export const FAMOUS_AVATARS = [
  // ================= 1. ANIME LEGENDS (32) =================
  { name: 'Luffy', series: 'One Piece', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LuffyGear5&radius=50' },
  { name: 'Zoro', series: 'One Piece', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ZoroSwordsman&radius=50' },
  { name: 'Sanji', series: 'One Piece', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SanjiCook&radius=50' },
  { name: 'Naruto', series: 'Naruto', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NarutoSage&radius=50' },
  { name: 'Sasuke', series: 'Naruto', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SasukeUchiha&radius=50' },
  { name: 'Kakashi', series: 'Naruto', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KakashiHatake&radius=50' },
  { name: 'Itachi', series: 'Naruto', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ItachiCrow&radius=50' },
  { name: 'Gojo', series: 'Jujutsu Kaisen', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GojoSatoru&radius=50' },
  { name: 'Sukuna', series: 'Jujutsu Kaisen', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RyomenSukuna&radius=50' },
  { name: 'Megumi', series: 'Jujutsu Kaisen', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MegumiFushiguro&radius=50' },
  { name: 'Levi', series: 'Attack on Titan', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LeviAckerman&radius=50' },
  { name: 'Eren', series: 'Attack on Titan', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ErenJaeger&radius=50' },
  { name: 'Mikasa', series: 'Attack on Titan', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MikasaAckerman&radius=50' },
  { name: 'Tanjiro', series: 'Demon Slayer', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TanjiroKamado&radius=50' },
  { name: 'Nezuko', series: 'Demon Slayer', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NezukoDemon&radius=50' },
  { name: 'Zenitsu', series: 'Demon Slayer', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ZenitsuThunder&radius=50' },
  { name: 'Inosuke', series: 'Demon Slayer', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=InosukeBeast&radius=50' },
  { name: 'Rengoku', series: 'Demon Slayer', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KyojuroRengoku&radius=50' },
  { name: 'Killua', series: 'Hunter x Hunter', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KilluaZoldyck&radius=50' },
  { name: 'Gon', series: 'Hunter x Hunter', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GonFreecss&radius=50' },
  { name: 'Kurapika', series: 'Hunter x Hunter', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KurapikaChains&radius=50' },
  { name: 'Saitama', series: 'One Punch Man', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SaitamaHero&radius=50' },
  { name: 'Genos', series: 'One Punch Man', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GenosCyborg&radius=50' },
  { name: 'Deku', series: 'My Hero Academia', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=IzukuMidoriya&radius=50' },
  { name: 'Todoroki', series: 'My Hero Academia', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShotoTodoroki&radius=50' },
  { name: 'Bakugo', series: 'My Hero Academia', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KatsukiBakugo&radius=50' },
  { name: 'Edward', series: 'Fullmetal Alchemist', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=EdwardElric&radius=50' },
  { name: 'Spike', series: 'Cowboy Bebop', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SpikeSpiegel&radius=50' },
  { name: 'Kaneki', series: 'Tokyo Ghoul', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KenKaneki&radius=50' },
  { name: 'Mob', series: 'Mob Psycho 100', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShigeoKageyama&radius=50' },
  { name: 'Frieren', series: 'Frieren', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FrierenMage&radius=50' },
  { name: 'Sung Jin-woo', series: 'Solo Leveling', category: 'anime', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShadowMonarch&radius=50' },

  // ================= 2. SUPERHEROES & COMICS (12) =================
  { name: 'Spider-Hero', series: 'Spider-Verse', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SpiderHeroWeb&radius=50' },
  { name: 'Dark Knight', series: 'Gotham', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DarkKnightBat&radius=50' },
  { name: 'Iron Sentinel', series: 'Avengers', category: 'heroes', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=IronSentinelStark&radius=50' },
  { name: 'Merc With Mouth', series: 'Anti-Hero', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DeadpoolRed&radius=50' },
  { name: 'Thunder God', series: 'Asgard', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ThorLightningHammer&radius=50' },
  { name: 'Adamantium Claw', series: 'Mutants', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=WolverineSlash&radius=50' },
  { name: 'Chaos Jester', series: 'Gotham', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=JokerChaosGreen&radius=50' },
  { name: 'Mystic Sorcerer', series: 'Multiverse', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DoctorStrangeCloak&radius=50' },
  { name: 'Symbiote Venom', series: 'Alien', category: 'heroes', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SymbioteShadow&radius=50' },
  { name: 'Cyber Phoenix', series: 'Cosmic', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=JeanGreyPhoenix&radius=50' },
  { name: 'Captain Patriot', series: 'Shield', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CaptainPatriotShield&radius=50' },
  { name: 'Speed Demon', series: 'Speed Force', category: 'heroes', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FlashLightningRed&radius=50' },

  // ================= 3. GAMING & CYBER ICONS (12) =================
  { name: 'Ghost of Sparta', series: 'God of War', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KratosSpartanWar&radius=50' },
  { name: 'Master Spartan', series: 'Halo', category: 'gaming', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MasterChiefSpartan&radius=50' },
  { name: 'White Wolf', series: 'The Witcher', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GeraltRiviaWitcher&radius=50' },
  { name: 'Cyber Samurai', series: 'Cyberpunk', category: 'gaming', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai2077&radius=50' },
  { name: 'Pixel Paladin', series: 'RPG Legends', category: 'gaming', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelPaladinArmor&radius=50' },
  { name: 'Neon Valkyrie', series: 'Overwatch', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NeonValkyrieMercy&radius=50' },
  { name: 'Mecha Warlord', series: 'Titanfall', category: 'gaming', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechaTitanWarlord&radius=50' },
  { name: 'Shadow Shinobi', series: 'Sekiro', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=WolfSekiroShinobi&radius=50' },
  { name: 'Elden Champion', series: 'Soulsborne', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TarnishedLord&radius=50' },
  { name: 'Buster Swordsman', series: 'Final Fantasy', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CloudStrifeSoldier&radius=50' },
  { name: 'Hero of Time', series: 'Hyrule', category: 'gaming', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LinkCourageSword&radius=50' },
  { name: 'Apex Hunter', series: 'Battle Royale', category: 'gaming', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexPredatorWraith&radius=50' },

  // ================= 4. CHESS ROYALTY & GRANDMASTERS (10) =================
  { name: 'Viking Magnus', series: 'World Champion', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MagnusCarlsenViking&radius=50' },
  { name: 'Blitz Hikaru', series: 'Speed King', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HikaruNakamuraSpeed&radius=50' },
  { name: 'Madras Tiger', series: 'Tactics Legend', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=VishyAnandTiger&radius=50' },
  { name: 'Riga Magician', series: 'Sacrifice Master', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MikhailTalMagician&radius=50' },
  { name: 'Golden King', series: 'Chess Elite', category: 'chess', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GrandmasterGoldKing&radius=50' },
  { name: 'Obsidian Queen', series: 'Chess Elite', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ObsidianEmpressQueen&radius=50' },
  { name: 'Iron Bastion Rook', series: 'Chess Castle', category: 'chess', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FortressRookArmor&radius=50' },
  { name: 'Fianchetto Bishop', series: 'Diagonals', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MysticBishopFianchetto&radius=50' },
  { name: 'Forking Knight', series: 'Steed Master', category: 'chess', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=RoyalKnightFork&radius=50' },
  { name: 'Passed Pawn ♛', series: 'Promotion', category: 'chess', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=PawnToQueenAscent&radius=50' },

  // ================= 5. MYTHOLOGY & ANCIENT WARRIORS (10) =================
  { name: 'Olympus Zeus', series: 'Greek Myth', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ZeusThunderSky&radius=50' },
  { name: 'Allfather Odin', series: 'Norse Myth', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=OdinAllfatherRaven&radius=50' },
  { name: 'Anubis Jackal', series: 'Egyptian Myth', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AnubisShadowGate&radius=50' },
  { name: 'Spartan King', series: 'Sparta', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LeonidasSpartanShield&radius=50' },
  { name: 'Ronin Samurai', series: 'Feudal Japan', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MusashiRoninKatana&radius=50' },
  { name: 'Viking Berserker', series: 'Valhalla', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RagnarBerserkerAxe&radius=50' },
  { name: 'Dragon Sovereign', series: 'Mythic Beast', category: 'myth', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DragonLordFlame&radius=50' },
  { name: 'Athena Wisdom', series: 'Strategy Goddess', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AthenaStrategyGoddess&radius=50' },
  { name: 'Poseidon Ocean', series: 'Seas', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=PoseidonTridentSea&radius=50' },
  { name: 'Pharaoh Pharaoh', series: 'Dynasty', category: 'myth', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TutankhamenGoldPharaoh&radius=50' },

  // ================= 6. CHIBI & MASCOTS (10) =================
  { name: 'Cyber Neko', series: 'Mecha Pet', category: 'mascots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberCatMeow&radius=50' },
  { name: 'Shiba Samurai', series: 'Good Boy', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShibaDogeSamurai&radius=50' },
  { name: 'Grandmaster Owl', series: 'Chess Arena Mascot', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=WisdomOwlProfessor&radius=50' },
  { name: 'Ninja Fox', series: 'Kitsune', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KitsuneNinjaFox&radius=50' },
  { name: 'Battle Panda', series: 'Monk', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KungFuPandaMonk&radius=50' },
  { name: 'Royal Lion', series: 'Savannah King', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SimbaPrideLion&radius=50' },
  { name: 'Tactical Penguin', series: 'Cold Strategy', category: 'mascots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TacticalPenguinIce&radius=50' },
  { name: 'Baby Dragon', series: 'Mythic Pet', category: 'mascots', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CuteDragonFire&radius=50' },
  { name: 'Golden Bear', series: 'Guardian', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GrizzlyGoldBear&radius=50' },
  { name: 'Spirit Wolf', series: 'Pack Leader', category: 'mascots', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlphaSpiritWolf&radius=50' }
];

// Backward-compatible alias for existing imports
export const ANIME_AVATARS = FAMOUS_AVATARS.filter(a => a.category === 'anime');
