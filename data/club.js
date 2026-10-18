// Club content drawn from the Mind Over Matter pitch deck and current club materials.

// Contact details shown in the footer and on the Contact page. Fill these in with the club's real details.
export const contact = {
  email: 'mentalwellnessclubmom@gmail.com',
  phone: '+254 704 580 422', // Optional. Hidden while empty.
  // Where the club is based. Members can be students anywhere in Kenya.
  location: {
    city: 'Nairobi, Kenya',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Nairobi+Kenya',
  },
};

// Social media profiles. Paste the full profile link into `url`. Entries with an empty `url` are hidden on the
// live site (the dev preview shows them faded, so the layout can be checked before the links exist).
export const socialLinks = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/mind_over_matter.med/' },
  { name: 'X (Twitter)', icon: 'x', url: '' },
  { name: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@mind_over_matter.med' },
  { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/share/1D3F9DMeMu/' },
  { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/mind-over-matter-ku-5633453ab' },
  { name: 'WhatsApp', icon: 'whatsapp', url: '' },
];

// Reviews on the home page, from members, volunteers, and partners. Only add one with the person's permission.
// While the list is empty, the home page invites visitors to share their experience instead.
// Format: { quote: 'What they said.', name: 'First name', role: 'Member, Kenyatta University' }
// Leave `name` empty to show the review as anonymous; `role` is optional.
export const reviews = [];

export const reviewInvite = {
  emailSubject: 'My experience with Mind Over Matter',
};

// Website credit in the footer. Paste the designer's full LinkedIn profile link into `linkedin`.
export const siteCredit = {
  name: 'Vincent Murithi',
  linkedin: 'https://www.linkedin.com/in/vincent-murithi-4a4261266',
};

export const purpose =
  'To build a sustainable community where the mental health of all members is valued, protected, and prioritized.';

export const vision =
  'A resilient generation of young people empowered with the resources, skills, and community support needed for mental wellness.';

export const quote = {
  text: 'What mental health needs is more light, more candor, and more unashamed conversations.',
  author: 'Glenn Close',
};

export const mission = [
  'De-stigmatize mental health issues and foster open, honest, and empathetic conversations.',
  'Provide a supportive network and a safe space for students to connect and share their experiences.',
  'Develop and promote programs, initiatives, and resources that enhance mental wellness and resilience.',
  'Advocate for the well-being of the student body within the greater academic community.',
];

export const coreValues = [
  { name: 'Empathy', icon: 'heart', text: 'Seeking to understand and share the feelings of others without judgment.' },
  { name: 'Community', icon: 'users', text: 'Fostering a sense of belonging, connection, and mutual support.' },
  { name: 'Confidentiality', icon: 'lock', text: 'Creating a safe and trusted space for all members.' },
  { name: 'Inclusivity', icon: 'handshake', text: 'Welcoming and respecting all individuals, regardless of background, identity, or experience.' },
  { name: 'Advocacy', icon: 'megaphone', text: 'Proactively championing the cause of mental well-being for all students.' },
  { name: 'Growth', icon: 'sprout', text: 'Encouraging personal and collective development in understanding and managing mental health.' },
];

// "Why we exist" on the home page. `icon` is a key in the icons list in pages/main.jsx; `chips` are optional tags.
// "Why we exist" on the home page. `icon` is a key in the icons list in pages/main.jsx; `chips` are optional tags.
export const problems = [
  { title: 'Academic pressure and stress', icon: 'books', text: 'Long hours, high stakes, and relentless exams take a real toll on students.' },
  { title: 'Unhealthy coping mechanisms', icon: 'pill', text: 'Without better tools, many students turn to habits that make things worse.' },
  { title: 'Inadequate institutional support', icon: 'buildings', text: 'Mental health support from administration has not kept pace with student need.' },
  { title: 'Lack of peer support networks', icon: 'users', text: 'Too many students struggle alone, without a circle that understands.' },
  { title: 'Suicide risk and prevention', icon: 'lifebuoy', text: 'Early support and open conversation save lives. Silence does not.' },
  {
    title: 'Barriers to seeking support',
    icon: 'barricade',
    text: 'Even when students know help exists, these barriers keep many from reaching out, so awareness alone is not enough.',
    chips: ['Stigma', 'Doubts that services help', 'Long wait times', 'Reluctance to ask for help'],
  },
];

// Home "Our approach": four connected steps. `keyword` is the short word shown above each title.
export const approach = [
  { title: 'Advocacy for mental health', keyword: 'Speak up', icon: 'megaphone', text: 'Pushing for university policies and practices that promote student mental well-being.' },
  { title: 'Creation of support groups', keyword: 'Connect', icon: 'users', text: 'Close-knit groups and regular meet-ups where students connect with peers facing similar challenges.' },
  { title: 'Community approach', keyword: 'Belong', icon: 'handshake', text: 'Social events, awareness campaigns, and open conversations that build a caring community, so no student faces mental health challenges alone.' },
  { title: 'Capacity building', keyword: 'Grow', icon: 'sprout', text: 'Workshops that build the skills, knowledge, and resources to manage stress, emotions, and mental health challenges constructively.' },
];

// About page "Our objectives": the targets the club measures itself against. `sign: '+'` marks an increase.
export const objectives = [
  { value: 50, sign: '+', icon: 'firstaid', tone: 'emerald', label: 'increase in students trained in Mental Health First Aid (MHFA)' },
  { value: 30, sign: '+', icon: 'lifebuoy', tone: 'copper', label: 'increase in students seeking mental health resources' },
  { value: 80, sign: '', icon: 'message', tone: 'emerald', label: 'of participants reporting more comfort discussing mental health challenges openly' },
];

// Programs on the Events page. `photos` are keys in programPhotos (pages/main.jsx): the first is the main photo,
// a second one is shown as a smaller overlapping photo. Programs without photos show a green `panel` instead:
// a heading, a few points (each with an icon key), and optional `chips` and `action` link.
export const programs = [
  {
    title: 'Trivia Thursdays',
    kicker: 'Interactive wellness & engagement',
    schedule: 'Monthly, on Thursdays',
    icon: 'puzzle',
    photos: ['trivia'],
    photoAlt: 'Students taking part in an interactive mental health trivia session at Kenyatta University',
    text: 'Interactive mental health trivia sessions that bring together playful learning, friendly peer competition, and group dialogue. They break down the barriers around talking about mental health and build a safe, supportive community.',
  },
  {
    title: 'Ecotherapy',
    kicker: 'Healing in nature',
    icon: 'tree',
    photos: ['ecotherapyForest', 'ecotherapyCave'],
    photoAlt: 'Club members standing together among green trees on an ecotherapy outing',
    text: 'By stepping into natural spaces, we encourage young people to disconnect from academic pressure, practise active coping, and strengthen their resilience together.',
  },
  {
    title: 'Safe Spaces & Community Support Circles',
    kicker: 'Peer support',
    icon: 'message',
    photos: ['safeSpaces'],
    photoAlt: 'Students sitting around a table, talking openly in a support circle',
    text: 'A confidential, judgement-free space where students share lived experiences, build emotional resilience, and practise mutual vulnerability.',
  },
  {
    title: 'Basic Mental Health First Aid Training',
    kicker: 'Skills that help',
    status: 'Enrollment opening soon',
    icon: 'firstaid',
    photos: [],
    panel: {
      heading: 'What you’ll learn',
      points: [
        { icon: 'eye', text: 'Spot the signs that a peer is struggling' },
        { icon: 'message', text: 'Start a calm, supportive conversation' },
        { icon: 'handshake', text: 'Guide them towards professional help' },
      ],
      action: { label: 'Register your interest', href: '/contact-us?topic=events' },
    },
    text: 'Practical training that helps students recognise when a peer is struggling, offer first support with care, and guide them towards professional help.',
  },
  {
    title: 'Book Club',
    kicker: 'Mental health literacy through stories',
    schedule: 'Twice a month, on Tuesdays',
    icon: 'book',
    photos: ['bookClub', 'bookClubLibrary'],
    photoAlt: 'Book club members holding up the books they are reading',
    text: 'We promote mental health literacy through narrative engagement, diving into themes such as:',
    themes: [
      { title: 'De-stigmatising mood disorders', text: 'Unpacking anxiety, depression, and help-seeking.' },
      { title: 'Resilience & burnout', text: 'Overcoming academic stress and setting healthy emotional boundaries.' },
      { title: 'Identity & belonging', text: 'Navigating social pressure, self-worth, and peer connection.' },
    ],
  },
  {
    title: 'The Mental Health Café',
    kicker: 'Professional support',
    schedule: 'In person, plus online sessions & forums',
    icon: 'coffee',
    photos: [],
    panel: {
      heading: 'Two ways to join',
      points: [
        { icon: 'coffee', text: 'In person: sit down with a professional over coffee' },
        { icon: 'laptop', text: 'Online: sessions and forums, wherever you are' },
      ],
      chips: ['Psychologists', 'Therapists', 'Pro bono'],
    },
    text: 'Where we connect young people with mental health professionals, including psychologists and therapists, who offer their time pro bono. We also run online sessions and forums, so you can join from wherever you are.',
  },
];

export const impact = [
  { title: 'Increased awareness', text: 'A growing community around mental health, with open conversations that break down stigma.' },
  { title: 'Improved well-being', text: 'Students developing coping mechanisms, reducing stress, and improving their overall mental well-being.' },
  { title: 'Empowered individuals', text: 'Participants gaining tools and resources to manage their mental health, build resilience, and thrive.' },
];

// Homepage impact timeline. `intro` is an optional line under the heading; it's hidden while empty.
export const homeImpact = {
  intro: '',
  actionLabel: 'Get involved',
  actionHref: '/about-us#get-involved',
  milestones: [
    { statistic: '750+', description: 'annual student engagements through our various programs and services', icon: 'users' },
    { statistic: '10+', description: 'therapy sessions offered to youth in need', icon: 'stethoscope' },
    { statistic: '80%', description: 'of members report improved well-being after attending an activity', icon: 'heart' },
    { statistic: '90%', description: 'of participants report feeling safe sharing in support circles', icon: 'message' },
  ],
};

// The committee on the About page, in the order shown. A member with `name: null` shows as "To be announced"
// with a placeholder portrait; fill in their name and photo key once the role is filled. Photo keys map to
// images in pages/main.jsx (teamPhotos).
export const team = [
  {
    name: 'Faith Waigi',
    role: 'Founder',
    photo: 'faith',
  },
  {
    name: 'Reagan Kirwa',
    role: 'Head of Programs & Initiatives',
    photo: 'reagan',
  },
  {
    name: 'Rogers Kuria',
    role: 'Head of Administration & Finance',
    photo: 'rogers',
  },
  {
    name: 'James Mvoi',
    role: 'Head of Strategic Development & Partnerships',
    photo: 'james',
  },
  {
    name: 'Krystal Karan',
    role: 'Public Relations & Communications',
    photo: 'krystal',
  },
];

// `emailLink: true` adds a "write to us" link using the club email from `contact` above.
export const waysToJoin = [
  { title: 'Volunteer', icon: 'hand', text: 'Share your time and skills at events, support groups, outreach, and on the social media team.' },
  {
    title: 'Donate',
    icon: 'heart',
    text: 'Help us reach more students in need. Every contribution keeps our programs accessible. Email us and we’ll explain how to give.',
    emailLink: true,
  },
  { title: 'Spread the word', icon: 'share', text: 'Tell your classmates, friends, and family about us. One conversation can change someone’s semester.' },
];

// Subject lines filled in when someone clicks "Start a conversation" (home page and About us).
const partnershipSubject = 'Partnering with Mind Over Matter';
const sponsorshipSubject = 'Sponsoring Mind Over Matter';

// The two options on the home page's partner panel.
export const partnerOptions = [
  { title: 'Partnerships', icon: 'handshake', text: 'Mental health organisations, professionals, and NGOs: co-host workshops, support groups, and awareness campaigns with us.', emailSubject: partnershipSubject },
  { title: 'Grants and Sponsorships', icon: 'coins', text: 'Businesses and foundations: sponsor an event, a workshop series, or an outreach campaign that reaches students across Kenya.', emailSubject: sponsorshipSubject },
];

export const funding = [
  // `emailSubject` turns the link into an email to the club with that subject line filled in.
  { title: 'Partnerships', icon: 'handshake', text: 'We collaborate with mental health organisations and professionals to deliver services and raise awareness.', link: { emailSubject: partnershipSubject, label: 'Start a conversation' } },
  { title: 'Grants and Sponsorships', icon: 'coins', text: 'We apply for grants from foundations and organisations that invest in student mental health. Businesses and organisations can sponsor our events, workshops, and awareness campaigns.', link: { emailSubject: sponsorshipSubject, label: 'Start a conversation' } },
  { title: 'Donations', icon: 'hand', text: 'Gifts from individuals, alumni, and well-wishers help us reach more students. Email us to find out how to give.', link: { emailSubject: 'Donating to Mind Over Matter', label: 'Start a conversation' } },
  { title: 'Buy our merch', icon: 'bag', text: 'Every hoodie, T-shirt, cap, and bucket hat you buy helps fund our programs.', link: { href: '/merch', label: 'Shop merch' } },
];
