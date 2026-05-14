const { supabase } = require('../server/supabase');

const seedIdeas = [
  {
    id: 'eco-track-001',
    title: 'EcoTrack AI',
    rawDescription: 'A platform to track carbon footprint using receipt scanning.',
    enhancedDescription: 'EcoTrack AI is a revolutionary mobile platform designed for the conscious consumer. By utilizing advanced OCR and machine learning, users can simply scan their daily shopping receipts to get an instant breakdown of their carbon footprint. The app provides actionable insights, suggesting sustainable alternatives for high-impact purchases and gamifying the journey toward a net-zero lifestyle.\n\nBuilt on a robust blockchain backend for transparent offset tracking, EcoTrack empowers individuals to contribute to global climate goals while saving money through eco-friendly rewards.',
    features: ['Real-time Receipt OCR Analysis', 'Personalized Sustainable Recommendations', 'Verified Carbon Offset Marketplace', 'Social Impact Leaderboards'],
    problems: ['Accurate categorization of non-standardized receipts', 'Sourcing reliable carbon data for millions of SKUs', 'Maintaining high user retention in a lifestyle app'],
    fuel: 142,
    members: ['Nitin', 'Alex', 'Sarah_Dev'],
    author: 'EcoBuilder',
    timestamp: Date.now() - 86400000,
    comments: [
      { id: 'c1', author: 'VentureViking', text: 'This is brilliant. Have you considered partnering with grocery chains for direct API integration?', timestamp: Date.now() - 72000000 },
      { id: 'c2', author: 'GreenCoder', text: 'The OCR part is tricky, but using Gemini 1.5 Flash for categorization would make this super fast.', timestamp: Date.now() - 36000000 }
    ]
  },
  {
    id: 'huddle-dev-002',
    title: 'HuddleDev',
    rawDescription: 'Tinder for developers to find side project partners.',
    enhancedDescription: 'HuddleDev is the ultimate matchmaking engine for the builder ecosystem. Instead of swiping on looks, you swipe on tech stacks, project vibes, and git contributions. Whether you are a backend wizard looking for a CSS sorcerer or a founder seeking a technical co-pilot, HuddleDev uses a proprietary "Synergy Algorithm" to find your perfect project partner.\n\nThe platform integrates directly with GitHub and Vercel, allowing teams to launch a shared repository and dev environment with a single click after a match.',
    features: ['GitHub Portfolio Integration', 'Real-time Synergy Matching', 'One-click Team Repository Setup', 'In-app Technical Chat & Voice'],
    problems: ['Preventing ghosting after a match', 'Ensuring balanced skill distribution in teams', 'Verifying the authenticity of project ideas'],
    fuel: 89,
    members: ['CoderX', 'DesignQueen'],
    author: 'Nitin',
    timestamp: Date.now() - 43200000,
    comments: [
      { id: 'c3', author: 'TechLead', text: 'The GitHub integration is a must-have. I would love to see an IDE launch feature right after matching.', timestamp: Date.now() - 21600000 },
      { id: 'c4', author: 'StartupGuru', text: 'Great for hackathons! This could be the default tool for team formation.', timestamp: Date.now() - 10800000 }
    ]
  },
  {
    id: 'mind-flow-003',
    title: 'MindFlow Pro',
    rawDescription: 'AI-driven focus music that adapts to your heart rate.',
    enhancedDescription: 'MindFlow Pro takes deep work to the next level by creating a bio-responsive auditory environment. By connecting to your wearable devices (Apple Watch, Oura, Garmin), the platform monitors your stress levels and heart rate variability in real-time. It then uses generative AI to adjust the binaural beats, tempo, and frequency of your focus music to keep you in the "Flow State" for longer.\n\nNo more manually skipping tracks or losing focus—MindFlow Pro understands your biological needs before you do.',
    features: ['Bio-Metric Sync (Apple/Garmin)', 'Generative AI Soundscapes', 'Focus Duration Analytics', 'Circadian Rhythm Adaptation'],
    problems: ['Latency in music generation based on real-time data', 'Data privacy for sensitive health metrics', 'Compatibility with multiple wearable protocols'],
    fuel: 215,
    members: ['BioHacker', 'SoundEngineer', 'Nitin'],
    author: 'FlowState',
    timestamp: Date.now() - 172800000,
    comments: [
      { id: 'c5', author: 'DeepWorker', text: 'As someone with ADHD, this sounds like a dream. The bio-metric part is the real differentiator.', timestamp: Date.now() - 129600000 },
      { id: 'c6', author: 'HealthTech_Investor', text: 'The TAM for this is huge. Every corporate worker is a potential customer.', timestamp: Date.now() - 86400000 }
    ]
  }
];

async function seed() {
  console.log('Seeding ideas...');
  for (const idea of seedIdeas) {
    const { error } = await supabase.from('ideas').upsert(idea);
    if (error) console.error(`Error seeding ${idea.title}:`, error);
    else console.log(`Successfully seeded: ${idea.title}`);
  }
  process.exit();
}

seed();
