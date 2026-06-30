/**
 * All landing-page copy lives here, typed and centralised.
 * House style: no full stops in display copy, bold and plainspoken.
 * See frontend/skills/landing-copy/SKILL.md for the voice + section frameworks.
 */

export interface HeroContent {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  titleTail: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  trust: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Step {
  index: string;
  title: string;
  body: string;
}

export interface Feature {
  title: string;
  body: string;
}

export interface StackLayer {
  index: string;
  name: string;
  blurb: string;
  accent?: boolean;
}

export interface LandingContent {
  hero: HeroContent;
  stats: Stat[];
  how: {
    eyebrow: string;
    heading: string;
    subheading: string;
    steps: Step[];
  };
  features: {
    eyebrow: string;
    heading: string;
    subheading: string;
    items: Feature[];
  };
  stack: {
    eyebrow: string;
    heading: string;
    subheading: string;
    layers: StackLayer[];
  };
  cta: {
    heading: string;
    body: string;
    button: string;
    note: string;
  };
}

export const landingContent: LandingContent = {
  hero: {
    eyebrow: 'Built on Cognee — Memory AI',
    titleLead: 'A',
    titleAccent: 'living memory',
    titleTail: 'for the people you love',
    subtitle:
      'Recall turns photos, voices and family stories into a connected memory graph — so a loved one living with dementia can find their way back to the moments that made them',
    primaryCta: 'Start for free',
    secondaryCta: 'See how it works',
    trust: ['Free to start', 'No card required', 'Private & secure'],
  },

  stats: [
    { value: '55M', label: 'people live with dementia worldwide' },
    { value: '1 in 3', label: 'seniors will be affected in their lifetime' },
    { value: '5 min', label: 'to begin a lifetime of memories' },
  ],

  how: {
    eyebrow: 'How it works',
    heading: 'Three steps to a memory that lasts',
    subheading: 'Recall does the remembering, so you can focus on being together',
    steps: [
      {
        index: '01',
        title: 'Capture the moment',
        body: 'Add a photo, record a voice note, or write down a story — family can contribute from anywhere, and every memory counts',
      },
      {
        index: '02',
        title: 'Cognee connects it',
        body: 'Behind the scenes, Cognee weaves each memory into a living graph, linking the people, places and moments that belong together',
      },
      {
        index: '03',
        title: 'Recall, gently',
        body: 'Your loved one taps a prompt or asks a question, and the right memory surfaces in their own story, in their own words',
      },
    ],
  },

  features: {
    eyebrow: 'Built for everyone who cares',
    heading: 'Care that remembers, for the whole family',
    subheading: 'One calm place for caregivers, family, and the person at the heart of it all',
    items: [
      {
        title: 'Daily orientation briefs',
        body: 'A gentle, auto-written summary of who, where and when — ready to read aloud each morning',
      },
      {
        title: 'Voice-first reminiscence',
        body: 'Large, calm prompts your loved one can tap or simply talk to, with no menus and no confusion',
      },
      {
        title: 'Family contributions',
        body: 'Invite siblings and grandchildren to add their photos and stories from anywhere in the world',
      },
      {
        title: 'Private by design',
        body: "Each person's memories are theirs alone — invite-only, never shared, never sold",
      },
    ],
  },

  stack: {
    eyebrow: 'The memory stack',
    heading: 'Five layers, one living memory',
    subheading:
      'Every memory passes through the same pipeline — and the graph is where it all comes together',
    layers: [
      { index: '01', name: 'Capture', blurb: 'Photos, voice notes, videos and stories come in from the whole family' },
      { index: '02', name: 'Transcribe', blurb: 'Whisper turns every voice and video into searchable, gentle text' },
      { index: '03', name: 'Memory Graph', blurb: 'Cognee links people, places and moments into one connected graph', accent: true },
      { index: '04', name: 'Enrich', blurb: 'Background passes link the same person and place across hundreds of memories' },
      { index: '05', name: 'Recall', blurb: 'A question or a tap surfaces the right memory, in their own words' },
    ],
  },

  cta: {
    heading: 'Start preserving what matters today',
    body: "Set up your loved one's memory in minutes — it's free to begin",
    button: 'Create your free account',
    note: 'No credit card required',
  },
};
