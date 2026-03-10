import { Event } from './types';

export const EVENTS: Event[] = [
  // Technical Events - Category 1 (2nd, 3rd, 4th Year)
  {
    id: 'paper-pres-cat1',
    name: 'Paper Presentation',
    category: 'Technical',
    description: 'Showcase your research and technical findings to a panel of experts.',
    rules: [
      'Maximum 2 participants per team.',
      'Time limit: 8 mins presentation + 2 mins Q&A.',
      'Abstract must be submitted in advance.'
    ],
    maxParticipants: 2,
    years: ['2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1516322074411-19fd412cb92f?q=80&w=1470&auto=format&fit=crop' // Professional tech presentation
  },
  {
    id: 'tech-quiz-cat1',
    name: 'Technical Quiz',
    category: 'Technical',
    description: 'Test your knowledge across various technical domains.',
    rules: [
      'Individual participation.',
      'Preliminary round followed by finals.',
      'No electronic gadgets allowed.'
    ],
    maxParticipants: 1,
    years: ['2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1470&auto=format&fit=crop' // Quiz/Test environment
  },
  {
    id: 'synth-vision',
    name: 'Synth Vision Animation (AI)',
    category: 'Technical',
    description: 'Bring your creativity to life through AI-powered digital animation.',
    rules: [
      'Maximum 2 participants per team.',
      'Theme will be provided on-spot.',
      'AI tools and software of choice allowed.'
    ],
    maxParticipants: 2,
    years: ['2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1364&auto=format&fit=crop' // Abstract AI/animation
  },
  {
    id: 'code-cracking',
    name: 'Code Cracking',
    category: 'Technical',
    description: 'Solve complex algorithmic challenges and debug code.',
    rules: [
      'Individual participation.',
      'Languages: C, C++, Java, Python.',
      'Time-based scoring.'
    ],
    maxParticipants: 1,
    years: ['2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1470&auto=format&fit=crop' // Coding
  },
  {
    id: 'circuit-cracking',
    name: 'Circuit Cracking',
    category: 'Technical',
    description: 'Debug and design electronic circuits (Exclusively for ECE).',
    rules: [
      'Individual participation.',
      'Component identification and circuit debugging.',
      'Practical round included.'
    ],
    maxParticipants: 1,
    years: ['2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=1469&auto=format&fit=crop' // Circuit board
  },

  // Technical Events - Category 2 (1st Year)
  {
    id: 'paper-pres-cat2',
    name: 'Paper Presentation (1st Year)',
    category: 'Technical',
    description: 'Present your ideas on fundamental science and engineering themes.',
    rules: [
      'Maximum 2 participants per team.',
      'Themes: Tamil, English, Maths, Physics, Chemistry.',
      'Time limit: 7 mins + 2 mins Q&A.'
    ],
    maxParticipants: 2,
    years: ['1st'],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop' // Desk study paper
  },
  {
    id: 'tech-quiz-cat2',
    name: 'Technical Quiz (1st Year)',
    category: 'Technical',
    description: 'A quiz designed for first-year engineering students.',
    rules: [
      'Individual participation.',
      'Questions from basic science and engineering.',
      'Multiple choice format.'
    ],
    maxParticipants: 1,
    years: ['1st'],
    image: 'https://images.unsplash.com/photo-1633613286991-611fe299c4ba?q=80&w=1470&auto=format&fit=crop' // Neon question mark
  },

  // Non-Technical Events (Common)
  {
    id: 'ads-up',
    name: 'Ads-up',
    category: 'Non-Technical',
    description: 'Create and perform a creative advertisement for a random product.',
    rules: [
      'Team of 3-4 members.',
      'Preparation time: 5 mins.',
      'Performance time: 3 mins.'
    ],
    maxParticipants: 4,
    years: ['1st', '2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1470&auto=format&fit=crop' // Strategy/Ads
  },
  {
    id: 'start-music',
    name: 'Start Music',
    category: 'Non-Technical',
    description: 'Identify songs and artists in this musical challenge.',
    rules: [
      'Team of 2-4 members.',
      'Multiple rounds: Intro, Reverse, Hook.',
      'Fun and interactive.'
    ],
    maxParticipants: 4,
    years: ['1st', '2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1470&auto=format&fit=crop' // Music
  },
  {
    id: 'e-sports',
    name: 'E-Sports',
    category: 'Non-Technical',
    description: 'Compete in popular gaming titles.',
    rules: [
      'Individual or team depending on the game.',
      'Fair play rules apply.',
      'Tournament style bracket.'
    ],
    maxParticipants: 4,
    years: ['1st', '2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop' // Gaming setup
  },
  {
    id: 'short-film',
    name: 'Short Film',
    category: 'Non-Technical',
    description: 'Screen your cinematic creations.',
    rules: [
      'Maximum duration: 10 mins.',
      'Must be original content.',
      'Submit via drive link before event.'
    ],
    maxParticipants: 4,
    years: ['1st', '2nd', '3rd', '4th'],
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1459&auto=format&fit=crop' // Film reel
  }
];

export const PPT_THEMES = ['Tamil', 'English', 'Mathematics', 'Chemistry', 'Physics'];
export const DEPARTMENTS = ['CSE', 'IT', 'AI & DS', 'ECE', 'S&H', 'Other'];
export const YEARS = ['1st', '2nd', '3rd', '4th'];