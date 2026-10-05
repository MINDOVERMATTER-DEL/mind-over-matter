// Club content drawn from the Articles of Association and the Mind Over Matter pitch deck (see documents/).

// Contact details shown in the footer and on the Contact page. Fill these in with the club's real details.
export const contact = {
  email: 'mentalwellnessclubmom@gmail.com',
  phone: '+254 704 580 422', // Optional. Hidden while empty.
  location: {
    name: 'Kenyatta University',
    detail: 'Main Campus, Thika Road',
    city: 'Nairobi, Kenya',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kenyatta+University+Main+Campus+Nairobi',
  },
};

// Social media profiles. Paste the full profile link into `url`. Entries with an empty `url` are hidden on the
// live site (the dev preview shows them faded, so the layout can be checked before the links exist).
export const socialLinks = [
  { name: 'Instagram', icon: 'instagram', url: '' },
  { name: 'X (Twitter)', icon: 'x', url: '' },
  { name: 'TikTok', icon: 'tiktok', url: '' },
  { name: 'Facebook', icon: 'facebook', url: '' },
  { name: 'LinkedIn', icon: 'linkedin', url: '' },
  { name: 'WhatsApp', icon: 'whatsapp', url: '' },
];

// Website credit in the footer. Paste the designer's full LinkedIn profile link into `linkedin`.
export const siteCredit = {
  name: 'Vincent Murithi',
  linkedin: 'https://www.linkedin.com/in/vincent-murithi-4a4261266',
};

export const preamble =
  'We, the students of Kenyatta University, recognizing the unique pressures and challenges of our academic and personal lives, and believing in the fundamental importance of mental well-being, do hereby establish "Mind Over Matter." Our purpose is to build a compassionate and supportive community where mental health matters, is openly discussed, and actively nurtured.';

export const purpose =
  'To build a sustainable community where the mental health of all members is valued, protected, and prioritized.';

export const vision =
  'A world where mental health is prioritized, and everyone has access to the resources and support they need to thrive.';

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

export const logoSymbolism = [
  { name: 'The circle', text: 'Community, inclusivity, and the continuous nature of support.' },
  { name: 'The head', text: 'The people within our community and the individual mind.' },
  { name: 'The green bud', text: 'Mental health, growth, renewal, and positive well-being.' },
  { name: 'The name', text: '"Mind Over Matter", placed prominently as our guiding principle.' },
];

export const problems = [
  { title: 'Academic pressure and stress', text: 'Long hours, high stakes, and relentless exams take a real toll on students.' },
  { title: 'Unhealthy coping mechanisms', text: 'Without better tools, many students turn to habits that make things worse.' },
  { title: 'Inadequate institutional support', text: 'Mental health support from administration has not kept pace with student need.' },
  { title: 'Lack of peer support networks', text: 'Too many students struggle alone, without a circle that understands.' },
  { title: 'Suicide risk and prevention', text: 'Early support and open conversation save lives. Silence does not.' },
];

export const approach = [
  { title: 'Advocacy for mental health', icon: 'megaphone', text: 'Pushing for university policies and practices that promote student mental well-being.' },
  { title: 'Creation of support groups', icon: 'users', text: 'Close-knit groups and regular meet-ups where students connect with peers facing similar challenges.' },
  { title: 'Community approach', icon: 'handshake', text: 'Social events, awareness campaigns, and open conversations that build a caring campus community, so no student faces mental health challenges alone.' },
  { title: 'Capacity building', icon: 'sprout', text: 'Workshops that build the skills, knowledge, and resources to manage stress, emotions, and mental health challenges constructively.' },
];

export const objectives = [
  'Provide a safe and supportive space for students to discuss mental health concerns.',
  'Raise awareness about mental health issues among students.',
  'Connect students with trained mental health personnel on and off campus.',
  'Promote healthy coping mechanisms and self-care strategies.',
  'Advocate for policies and practices that support student mental health.',
];

export const programs = [
  {
    title: 'Access to mental health professionals',
    icon: 'stethoscope',
    text: 'Members can access pro-bono services from psychologists, therapists, and psychiatrists, along with curated mental health resources.',
  },
  {
    title: 'Support groups and workshops',
    icon: 'users',
    text: 'Groups for students facing similar challenges, plus workshops on anxiety management, coping skills, and building healthy relationships.',
  },
  {
    title: 'Social events',
    icon: 'party',
    text: 'Walks, game nights, dinners, and team building that build a real sense of community and belonging.',
  },
];

export const impact = [
  { title: 'Increased awareness', text: 'A growing community around mental health, with open conversations that break down stigma.' },
  { title: 'Improved well-being', text: 'Students developing coping mechanisms, reducing stress, and improving their overall mental well-being.' },
  { title: 'Empowered individuals', text: 'Participants gaining tools and resources to manage their mental health, build resilience, and thrive.' },
];

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

export const funding = [
  { title: 'Membership fees', text: 'A sliding-scale fee lets every student access our programs according to their financial ability.' },
  { title: 'Grants and donations', text: 'We seek funding from foundations, organizations, and individuals who support our mission.' },
  { title: 'Partnerships', text: 'We collaborate with mental health organizations and professionals to deliver services and raise awareness.' },
];
