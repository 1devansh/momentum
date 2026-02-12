/**
 * Creator Program Mock Data
 *
 * Predefined programs for MVP. In the future these will come
 * from a backend API with real creator publishing.
 *
 * TODO: Replace with API fetch when backend is available
 * TODO: Add creator profile images / bios
 * TODO: Add program cover images
 */

import { CreatorProgram } from "./types";

export const CREATOR_PROGRAMS: CreatorProgram[] = [
  {
    id: "prog_confidence_7d",
    title: "7 Days of Confidence",
    creatorName: "Momentum Team",
    creatorBio:
      "The team behind Momentum. We believe everyone deserves to feel unstuck and empowered to take action toward the life they want.",
    description:
      "Build unshakable self-belief through daily micro-actions. Perfect for anyone who feels stuck waiting for permission to start.",
    durationDays: 7,
    premium: false,
    socialProof: {
      enrolledCount: 2847,
      averageRating: 4.7,
      reviews: [
        {
          id: "r1",
          name: "Jordan M.",
          rating: 5,
          text: "This program got me out of my head and into action. Day 4 was a game-changer.",
        },
        {
          id: "r2",
          name: "Priya S.",
          rating: 5,
          text: "Simple but powerful. I actually looked forward to each day's challenge.",
        },
        {
          id: "r3",
          name: "Alex T.",
          rating: 4,
          text: "Exactly what I needed to stop overthinking and start doing. Highly recommend.",
        },
      ],
    },
    days: [
      {
        day: 1,
        title: "Speak up once today",
        description:
          "Share an opinion, ask a question, or volunteer an idea in a conversation — even a small one counts.",
        encouragement:
          "Your voice matters. Using it is how you prove that to yourself.",
      },
      {
        day: 2,
        title: "Do something you've been postponing",
        description:
          "Pick the smallest postponed task and finish it. Send that email, make that call, or clean that corner.",
        encouragement: "Action dissolves anxiety. You just proved it.",
      },
      {
        day: 3,
        title: "Compliment a stranger or acquaintance",
        description:
          "Give a genuine, specific compliment to someone you don't know well. Notice how it feels.",
        encouragement: "Confidence grows when you give it away.",
      },
      {
        day: 4,
        title: "Set one boundary",
        description:
          "Say no to something that doesn't serve you, or ask for what you need clearly and kindly.",
        encouragement:
          "Boundaries aren't walls — they're proof you value yourself.",
      },
      {
        day: 5,
        title: "Try something you might fail at",
        description:
          "Attempt something with no guarantee of success. A new recipe, a workout, a creative project.",
        encouragement:
          "Failure is data. You're collecting courage, not perfection.",
      },
      {
        day: 6,
        title: "Share something you created or believe in",
        description:
          "Post a thought, share your work, or tell someone about a project you care about.",
        encouragement:
          "Visibility is vulnerability — and you showed up anyway.",
      },
      {
        day: 7,
        title: "Write a letter to your future self",
        description:
          "Write down who you're becoming and what you're proud of from this week. Seal it for 30 days.",
        encouragement:
          "You just completed 7 days of choosing yourself. That's momentum.",
      },
    ],
  },
  {
    id: "prog_morning_14d",
    title: "14-Day Morning Momentum",
    creatorName: "Alex Rivera",
    creatorBio:
      "Wellness coach and morning routine specialist. Alex has helped thousands of people transform their mornings from chaotic to intentional through simple, sustainable practices.",
    description:
      "Transform your mornings from chaotic to intentional. Each day builds on the last to create a morning routine that actually sticks.",
    durationDays: 14,
    premium: true,
    socialProof: {
      enrolledCount: 1523,
      averageRating: 4.8,
      reviews: [
        {
          id: "r4",
          name: "Sam K.",
          rating: 5,
          text: "My mornings used to be chaos. By day 7 I had a routine I actually enjoy.",
        },
        {
          id: "r5",
          name: "Maria L.",
          rating: 5,
          text: "The gradual build-up is genius. Each day felt doable and I never wanted to quit.",
        },
        {
          id: "r6",
          name: "Chris W.",
          rating: 4,
          text: "Cold water day was rough but the rest was transformative. Still doing my routine 3 months later.",
        },
      ],
    },
    days: [
      {
        day: 1,
        title: "Wake up and hydrate",
        description:
          "Before anything else — phone, coffee, thoughts — drink a full glass of water.",
        encouragement: "The simplest wins build the strongest habits.",
      },
      {
        day: 2,
        title: "5 minutes of stillness",
        description:
          "Sit quietly for 5 minutes. No phone, no music. Just breathe and notice.",
        encouragement:
          "Stillness isn't doing nothing — it's choosing presence.",
      },
      {
        day: 3,
        title: "Write your top 3 intentions",
        description:
          "Before opening any apps, write down 3 things you intend to do or feel today.",
        encouragement: "Direction beats speed. You just set yours.",
      },
      {
        day: 4,
        title: "Move your body for 10 minutes",
        description:
          "Stretch, walk, dance — anything that gets you out of your head and into your body.",
        encouragement: "Energy isn't found, it's created. You just made some.",
      },
      {
        day: 5,
        title: "No phone for the first 30 minutes",
        description:
          "Keep your phone in another room or on airplane mode for the first half hour after waking.",
        encouragement:
          "You chose yourself before the world could choose for you.",
      },
      {
        day: 6,
        title: "Eat a real breakfast",
        description:
          "Prepare and sit down for a proper breakfast. No eating on the go.",
        encouragement: "Nourishing yourself is an act of self-respect.",
      },
      {
        day: 7,
        title: "Review your week so far",
        description:
          "Spend 5 minutes reviewing what went well this week and what you'd adjust.",
        encouragement:
          "Reflection turns experience into wisdom. One week down.",
      },
      {
        day: 8,
        title: "Add gratitude to your morning",
        description:
          "Write down 3 specific things you're grateful for before starting your day.",
        encouragement: "Gratitude rewires your brain for opportunity.",
      },
      {
        day: 9,
        title: "Cold water finish",
        description:
          "End your shower with 30 seconds of cold water. Embrace the discomfort.",
        encouragement:
          "Discomfort on your terms builds resilience everywhere else.",
      },
      {
        day: 10,
        title: "Read for 10 minutes",
        description:
          "Read something that feeds your mind — a book, an article, not social media.",
        encouragement: "Leaders are readers. You're investing in yourself.",
      },
      {
        day: 11,
        title: "Prepare the night before",
        description:
          "Tonight, lay out tomorrow's clothes and prep your morning. Feel the difference.",
        encouragement: "Tomorrow's momentum starts with tonight's intention.",
      },
      {
        day: 12,
        title: "Connect with someone",
        description:
          "Send a thoughtful message to someone you care about before 9am.",
        encouragement: "Connection is the ultimate morning fuel.",
      },
      {
        day: 13,
        title: "Combine your favorites",
        description:
          "Build your ideal morning using the practices that resonated most from this program.",
        encouragement:
          "You're not following a routine anymore — you're designing one.",
      },
      {
        day: 14,
        title: "Commit to your morning",
        description:
          "Write down your personal morning routine and commit to it for the next 30 days.",
        encouragement:
          "14 days of showing up. Your mornings will never be the same.",
      },
    ],
  },
  {
    id: "prog_focus_10d",
    title: "10 Days of Deep Focus",
    creatorName: "Dr. Sarah Chen",
    creatorBio:
      "Cognitive scientist and productivity researcher. Dr. Chen studies attention and focus at the intersection of neuroscience and practical performance, translating research into daily habits anyone can adopt.",
    description:
      "Reclaim your attention in a distracted world. Science-backed daily practices to sharpen your focus and get more meaningful work done.",
    durationDays: 10,
    premium: true,
    socialProof: {
      enrolledCount: 982,
      averageRating: 4.6,
      reviews: [
        {
          id: "r7",
          name: "Taylor R.",
          rating: 5,
          text: "I went from 10-minute focus sessions to 50 minutes by the end. The science-backed approach really works.",
        },
        {
          id: "r8",
          name: "Nina P.",
          rating: 4,
          text: "The distraction audit on day 1 was eye-opening. Changed how I think about my phone.",
        },
        {
          id: "r9",
          name: "Dev A.",
          rating: 5,
          text: "As a developer, deep focus is everything. This program gave me a system that sticks.",
        },
      ],
    },
    days: [
      {
        day: 1,
        title: "Audit your distractions",
        description:
          "Track every time you get distracted today. Just notice and tally — no judgment.",
        encouragement: "Awareness is the first step to mastery.",
      },
      {
        day: 2,
        title: "Single-task for 25 minutes",
        description:
          "Pick one task. Set a timer for 25 minutes. Do nothing else until it rings.",
        encouragement: "You just proved your brain can still do this.",
      },
      {
        day: 3,
        title: "Create a distraction-free zone",
        description:
          "Designate one physical space for focused work. Remove all non-essential items.",
        encouragement:
          "Your environment shapes your attention more than willpower.",
      },
      {
        day: 4,
        title: "Batch your communication",
        description:
          "Check email and messages only at 2-3 set times today. Not continuously.",
        encouragement: "Reactivity is the enemy of depth. You chose depth.",
      },
      {
        day: 5,
        title: "Practice the 2-minute reset",
        description:
          "Between tasks, close your eyes for 2 minutes. Let your mind clear before switching.",
        encouragement: "Rest between rounds makes the next round stronger.",
      },
      {
        day: 6,
        title: "Identify your peak hours",
        description:
          "Notice when your focus is sharpest today. Protect those hours tomorrow.",
        encouragement: "Working with your rhythm beats fighting against it.",
      },
      {
        day: 7,
        title: "Do your hardest task first",
        description:
          "Start with the task you've been avoiding. Give it your freshest energy.",
        encouragement: "Eating the frog gets easier every time.",
      },
      {
        day: 8,
        title: "Digital sunset",
        description:
          "Turn off all screens 1 hour before bed tonight. Let your brain wind down.",
        encouragement: "Tomorrow's focus is built on tonight's rest.",
      },
      {
        day: 9,
        title: "Extend to 50 minutes",
        description:
          "Do a 50-minute deep work session today. You've built up to this.",
        encouragement:
          "Your focus muscle is getting stronger. Feel the difference.",
      },
      {
        day: 10,
        title: "Design your focus protocol",
        description:
          "Write down your personal focus rules based on what worked best this program.",
        encouragement:
          "10 days of intentional focus. You've rewired how you work.",
      },
    ],
  },
];
