import { Topic } from '../types';

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'favorite-food-snacks',
    title: 'Favorite Foods & Snacks 🍜',
    titleIndonesian: 'Makanan & Camilan Favorit',
    category: 'Obrolan Sehari-hari',
    icon: 'Utensils',
    description: 'Ngobrol santai tentang makanan favorit, makanan pedas, camilan sore, atau jajanan kesukaanmu!',
    starterPrompt: 'You are Buddy, a warm and friendly English chat companion. Ask the user about their favorite food, snacks, or what they ate today in a relaxed, everyday conversational tone.',
    initialMessage: "Hey there! 🍜 I'm thinking about food right now! What is your absolute favorite food or snack to eat?",
    keyVocabulary: [
      { english: 'Tasty', indonesian: 'Lezat / Enak', example: 'This fried rice is super tasty!' },
      { english: 'Spicy', indonesian: 'Pedas', example: 'I like eating spicy food with sambal.' },
      { english: 'Snack', indonesian: 'Camilan / Jajanan', example: 'Potato chips are my favorite afternoon snack.' },
      { english: 'Crave', indonesian: 'Sangat menginginkan / Ngidam', example: 'I crave ice cream when it is hot outside.' }
    ],
    suggestedPhrases: [
      "I love eating fried chicken and French fries!",
      "I really like spicy noodles with iced tea.",
      "My favorite snack is chocolate potato chips."
    ]
  },
  {
    id: 'whats-your-opinion',
    title: "What's Your Opinion? 💭",
    titleIndonesian: 'Tanya Pendapat & Pilihan',
    category: 'Pendapat & Diskusi',
    icon: 'MessageSquare',
    description: 'Diskusi santai memilih 2 hal favorit: tim bersantai di rumah vs jalan-jalan, atau kucing vs anjing!',
    starterPrompt: 'You are Buddy, an enthusiastic conversation buddy. Ask simple opinion questions comparing two popular options (e.g., staying home vs going out, cats vs dogs, morning vs night) and ask why!',
    initialMessage: "Hey! Quick question for you 💭 Do you prefer staying at home relaxing on weekends, or going out with friends?",
    keyVocabulary: [
      { english: 'Prefer', indonesian: 'Lebih memilih', example: 'I prefer tea over coffee.' },
      { english: 'In my opinion', indonesian: 'Menurut pendapat saya', example: 'In my opinion, playing games is very relaxing.' },
      { english: 'Chill', indonesian: 'Bersantai', example: 'Let us chill at home this afternoon.' },
      { english: 'Definitely', indonesian: 'Pasti / Tentu saja', example: 'I definitely prefer sunny days!' }
    ],
    suggestedPhrases: [
      "I prefer staying at home and watching movies!",
      "In my opinion, going out with friends is more fun.",
      "I definitely prefer warm sunny weather."
    ]
  },
  {
    id: 'favorite-belongings',
    title: 'My Favorite Things 📱',
    titleIndonesian: 'Barang & Benda Kesayangan',
    category: 'Gaya Hidup',
    icon: 'Smartphone',
    description: 'Ceritakan benda atau barang favorit yang selalu kamu bawa dan bikin kamu senang.',
    starterPrompt: 'You are Buddy, curious about everyday items people love. Ask the user about one item or gadget they always bring with them.',
    initialMessage: "Hi friend! 📱 What is one item or object you always carry everywhere with you?",
    keyVocabulary: [
      { english: 'Handy', indonesian: 'Praktis / Berguna', example: 'My power bank is very handy.' },
      { english: 'Headphones', indonesian: 'Headphone / Earphone', example: 'I listen to music using my headphones.' },
      { english: 'Essential', indonesian: 'Penting / Wajib ada', example: 'My smartphone is essential for my day.' }
    ],
    suggestedPhrases: [
      "I always bring my smartphone and earphones.",
      "My favorite item is my black backpack.",
      "I can't live without my water bottle!"
    ]
  },
  {
    id: 'daily-routines',
    title: 'Daily Routine & Habits ☕',
    titleIndonesian: 'Rutinitas & Kebiasaan Sehari-hari',
    category: 'Kehidupan Sehari-hari',
    icon: 'Coffee',
    description: 'Saling cerita kegiatan dari bangun tidur, aktivitas harian, sampai santai di malam hari.',
    starterPrompt: 'You are Buddy asking about daily morning or evening habits in a casual, friendly tone.',
    initialMessage: "Good day! ☕ What is the very first thing you usually do right after you wake up in the morning?",
    keyVocabulary: [
      { english: 'Wake up', indonesian: 'Bangun tidur', example: 'I wake up at six o clock every morning.' },
      { english: 'Habit', indonesian: 'Kebiasaan', example: 'Drinking warm water is a healthy habit.' },
      { english: 'Usually', indonesian: 'Biasanya', example: 'I usually eat breakfast before going out.' }
    ],
    suggestedPhrases: [
      "I usually drink a glass of water first.",
      "I check my phone and make my bed.",
      "I wash my face and eat breakfast."
    ]
  },
  {
    id: 'music-games-movies',
    title: 'Movies, Music & Games 🎮',
    titleIndonesian: 'Film, Musik & Game',
    category: 'Hobi & Hiburan',
    icon: 'Gamepad2',
    description: 'Bicarakan lagu favorit, game kesukaan, atau film seru yang pernah kamu tonton.',
    starterPrompt: 'You are Buddy sharing your love for music, movies, and video games. Ask the user what kind of media or games they like.',
    initialMessage: "Hey! 🎵 I love listening to music while relaxing! What kind of music, movies, or games do you enjoy most?",
    keyVocabulary: [
      { english: 'Catchy', indonesian: 'Mudah diingat / Enak didengar', example: 'This pop song is so catchy!' },
      { english: 'Genre', indonesian: 'Jenis / Aliran film atau musik', example: 'Action is my favorite movie genre.' },
      { english: 'Binge-watch', indonesian: 'Maraton nonton film/serial', example: 'I binge-watched three episodes last night.' }
    ],
    suggestedPhrases: [
      "I love listening to pop music and anime songs.",
      "I enjoy playing mobile games with my friends.",
      "My favorite movie is an animated comedy."
    ]
  },
  {
    id: 'weather-and-mood',
    title: "Weather & How You Feel 🌤️",
    titleIndonesian: 'Cuaca & Suasana Hati Hari Ini',
    category: 'Obrolan Santai',
    icon: 'Sun',
    description: 'Obrolkan suasana cuaca hari ini dan apa yang bikin suasana hatimu senang.',
    starterPrompt: 'You are Buddy making casual small talk about today weather and mood.',
    initialMessage: "Hello! 🌤️ How is the weather where you live today? Is it sunny, cloudy, or rainy?",
    keyVocabulary: [
      { english: 'Sunny', indonesian: 'Cerah berawan / Terang', example: 'It is a warm and sunny morning.' },
      { english: 'Cozy', indonesian: 'Nyaman & hangat', example: 'Rainy days are great for cozy reading.' },
      { english: 'Mood', indonesian: 'Suasana hati', example: 'Good music puts me in a happy mood.' }
    ],
    suggestedPhrases: [
      "It is very hot and sunny today!",
      "It is raining outside, so I feel cozy at home.",
      "I feel very energetic and happy today."
    ]
  },
  {
    id: 'weekend-chill',
    title: 'Weekend Plans & Chill 🍿',
    titleIndonesian: 'Rencana Akhir Pekan & Santai',
    category: 'Aktivitas',
    icon: 'Smile',
    description: 'Ceritakan kegiatan seru atau santai saat hari Sabtu dan Minggu.',
    starterPrompt: 'You are Buddy asking about weekend plans and relaxing activities.',
    initialMessage: "Yay, it's chat time! 🍿 What do you usually like to do on a Saturday or Sunday afternoon?",
    keyVocabulary: [
      { english: 'Unwind', indonesian: 'Melepas penat / Bersantai', example: 'I unwind by watching YouTube videos.' },
      { english: 'Hang out', indonesian: 'Nongkrong / Jalan-jalan', example: 'I want to hang out with my friends.' },
      { english: 'Sleep in', indonesian: 'Tidur lebih lama di pagi hari', example: 'On Sunday I love to sleep in.' }
    ],
    suggestedPhrases: [
      "I love sleeping in on Saturday mornings.",
      "I usually hang out with my family or friends.",
      "I like riding my bicycle around the neighborhood."
    ]
  }
];
