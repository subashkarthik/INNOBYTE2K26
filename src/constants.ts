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
    image: '/events/paper_pres.png'
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
    image: '/events/tech_quiz.png'
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
    image: '/events/ai_animation.png'
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
    image: '/events/code_cracking.png'
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
    image: '/events/circuit_cracking.png'
  },

  // Technical Events - Category 2 (1st Year)
  {
    id: 'paper-pres-cat2',
    name: 'Paper Presentation (1st Year)',
    category: 'Technical',
    description: 'Present your ideas on fundamental science and engineering themes.',
    rules: [
      'Maximum 2 participants per team.',
      'Subjects: Tamil, English, Maths, Physics, Chemistry.',
      'Time limit: 7 mins + 2 mins Q&A.'
    ],
    maxParticipants: 2,
    years: ['1st'],
    image: '/events/paper_pres.png'
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
    image: '/events/tech_quiz.png'
  },

  // Non-Technical Events (Common)
  {
    id: 'ad-zap',
    name: 'Ad-Zap',
    category: 'Non-Technical',
    description: 'Create and perform a creative advertisement for a random product.',
    rules: [
      'Team of 3-4 members.',
      'Preparation time: 5 mins.',
      'Performance time: 3 mins.'
    ],
    maxParticipants: 4,
    years: ['1st', '2nd', '3rd', '4th'],
    image: '/events/ads_up.png'
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
    image: '/events/start_music.png'
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
    image: '/events/esports.png'
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
    image: '/events/short_film.png'
  }
];

export const PPT_THEMES = ['Tamil', 'English', 'Mathematics', 'Chemistry', 'Physics'];
export const DEPARTMENTS = ['CSE', 'IT', 'AI & DS', 'ECE', 'S&H', 'Other'];
export const YEARS = ['1st', '2nd', '3rd', '4th'];