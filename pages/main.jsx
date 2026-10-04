import { Component, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, CalendarDots, CalendarPlus, CalendarStar, ChatsCircle, Clock, Confetti,
  DownloadSimple, EnvelopeSimple, Eye, FacebookLogo, FileText, GraduationCap, HandHeart, Handshake, Heart, IconContext,
  InstagramLogo, LinkedinLogo, List, LockKey, MapPin, Megaphone, MoonStars, Newspaper, NotePencil, PencilSimple,
  Phone, Plant, Plus, Quotes, ShareNetwork, SignOut, SquaresFour, Stethoscope, Sun, SunHorizon, TiktokLogo, Trash,
  UsersThree, WhatsappLogo, X, XLogo,
} from './icons.jsx';
import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { posts as samplePosts } from '../data/posts.js';
import {
  blogCategories, categories, categoryLabel, compressCover, createEvent, createPost, describeError, eventTypes, fetchEvents, fetchPosts,
  fetchMessages, isFirebaseConfigured, messageTopics, removeEvent, removeMessage, removePost, resetPassword, sendMessage,
  setMessageRead, signIn, signOut, updateEvent, updatePost, watchAdmin,
} from '../data/blog.js';
import {
  approach, contact, coreValues, executiveCommittee, founders, funding, governanceFacts, impact, logoSymbolism, mission,
  objectives, preamble, problems, programs, purpose, quote, rules, siteCredit, socialLinks, vision, waysToJoin,
} from '../data/club.js';
import faithPhoto from '../assets/images/team/faith-waigi.webp';
import reaganPhoto from '../assets/images/team/reagan-kirwa.webp';
import cliffPhoto from '../assets/images/team/cliff-sabaniah.webp';
import heroIllustration from '../assets/images/illustrations/mental-health-matters.webp';
import logoEmblem from '../assets/images/logo/logo-emblem.webp';
import logoFull from '../assets/images/logo/logo-full.webp';
import articlesPdf from '../documents/MIND OVER MATTER ARTICLES OF ASSOCIATION.pdf?url';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/fraunces';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import '../styles.css';

const siteLinks = [
  ['Home', 'index.html'],
  ['Events', 'event.html'],
  ['Blog', 'blog.html'],
  ['About Us', 'about-us.html'],
  ['Contact', 'contact-us.html'],
];


const icons = {
  graduation: GraduationCap,
  hand: HandHeart,
  handshake: Handshake,
  heart: Heart,
  lock: LockKey,
  megaphone: Megaphone,
  message: ChatsCircle,
  party: Confetti,
  share: ShareNetwork,
  sprout: Plant,
  stethoscope: Stethoscope,
  users: UsersThree,
};

const founderPhotos = { faith: faithPhoto, reagan: reaganPhoto, cliff: cliffPhoto };

const ICON_DEFAULTS = { weight: 'duotone' };

function Icon({ name, size = 27 }) {
  const Component = icons[name] || Plant;
  return <Component size={size} aria-hidden="true" />;
}

function getPageName(pathname) {
  return pathname.split('/').filter(Boolean).pop() || 'index.html';
}

function getActiveNavigationHref(pathname) {
  const page = getPageName(pathname);
  if (page === 'article.html') return 'blog.html';
  if (page === 'governance.html') return 'about-us.html';
  return page;
}

const COMPACT_QUERY = '(width <= 920px)';
const SHOW_NEAR_TOP = 120;
const SCROLL_JITTER = 4;
const easeOutExpo = [0.22, 1, 0.36, 1];

const headerVariants = {
  shown: { y: '0%' },
  // Extra distance carries the drop shadow fully off-screen as well.
  hidden: { y: '-145%' },
};

const dropdownVariants = {
  closed: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.16, ease: 'easeIn' } },
  open: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.28, ease: easeOutExpo, staggerChildren: 0.035, delayChildren: 0.04 },
  },
};

const dropdownItemVariants = {
  closed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0, transition: { duration: 0.24, ease: easeOutExpo } },
};

// Page intros: children fade up one after another.
const introVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const introItemVariants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal for content blocks across every page. Elements matching this list fade up as they enter the
// viewport, staggered among their siblings. A MutationObserver picks up content rendered later (page changes,
// blog posts arriving from the database). The visual states live in styles.css under [data-reveal].
const REVEAL_SELECTOR = [
  '.section-heading', '.feature-card', '.about-card', '.team-card', '.post-card', '.program-card', '.event-card',
  '.list-item', '.problem-list li', '.check-list li', '.quote-band', '.logo-showcase',
  '.contact-card', '.contact-form-card', '.archive-empty', '.two-col > div:not(.section-heading)',
].join(', ');
const REVEAL_STAGGER_MS = 80;
const REVEAL_MAX_STEPS = 5;

function useScrollReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.reveal = 'shown';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function prepare(root) {
      const found = root.matches(REVEAL_SELECTOR) ? [root] : [];
      found.push(...root.querySelectorAll(REVEAL_SELECTOR));
      found.forEach((element) => {
        if (element.dataset.reveal) return;
        const siblings = Array.from(element.parentElement?.children ?? []).filter((node) => node.matches(REVEAL_SELECTOR));
        const step = Math.min(Math.max(siblings.indexOf(element), 0), REVEAL_MAX_STEPS);
        element.style.setProperty('--reveal-delay', `${step * REVEAL_STAGGER_MS}ms`);
        element.dataset.reveal = 'hidden';
        observer.observe(element);
      });
    }

    const root = document.getElementById('root');
    prepare(root);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) prepare(node);
      }));
    });
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}

const COUNT_UP_MS = 1400;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

// Counts up from zero the first time the number scrolls into view. Screen readers get the final value.
function CountUp({ value }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setDisplay(value);
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // Browsers pause animation frames on hidden pages (e.g. a background tab), so just show the number.
      if (document.hidden) {
        setDisplay(value);
        return;
      }
      const start = window.performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / COUNT_UP_MS, 1);
        setDisplay(Math.round(easeOutCubic(progress) * value));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <strong ref={ref}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </strong>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);
  const headerRef = useRef(null);
  const activeHref = getActiveNavigationHref(window.location.pathname);
  const { scrollY } = useScroll();

  // Hide while scrolling down, reveal on any scroll up, and always show near the top of the page.
  useMotionValueEvent(scrollY, 'change', (current) => {
    const delta = current - (scrollY.getPrevious() ?? 0);
    if (current < SHOW_NEAR_TOP) {
      setHidden(false);
    } else if (delta > SCROLL_JITTER) {
      setHidden(true);
      setMenuOpen(false);
    } else if (delta < -SCROLL_JITTER) {
      setHidden(false);
    }
  });

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    function closeOnOutsideClick(event) {
      if (!event.composedPath().includes(headerRef.current)) setMenuOpen(false);
    }

    function trackCompact(event) {
      setIsCompact(event.matches);
      setMenuOpen(false);
    }

    const compactQuery = window.matchMedia(COMPACT_QUERY);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('click', closeOnOutsideClick);
    compactQuery.addEventListener('change', trackCompact);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('click', closeOnOutsideClick);
      compactQuery.removeEventListener('change', trackCompact);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const ctaHref = 'about-us.html#get-involved';

  return (
    <motion.header
        className="site-header"
        ref={headerRef}
        inert={hidden}
        initial={false}
        animate={hidden ? 'hidden' : 'shown'}
        variants={headerVariants}
        transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.9 }}
      >
        <div className="container nav-wrap">
          <a href="index.html" className="brand" aria-label="Mind Over Matter home">
            <span className="brand-mark"><img src={logoEmblem} alt="" width="40" height="40" /></span>
            <span>Mind Over Matter</span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? 'close' : 'open'}
                className="menu-toggle-icon"
                initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                {menuOpen ? <X size={21} aria-hidden="true" /> : <List size={21} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>

          {isCompact ? (
            <AnimatePresence>
              {menuOpen && (
                <motion.nav
                  key="dropdown"
                  id="primary-navigation"
                  className="main-nav is-open"
                  aria-label="Main navigation"
                  style={{ transformOrigin: 'top center' }}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={dropdownVariants}
                >
                  {siteLinks.map(([label, href]) => (
                    <motion.a
                      key={label}
                      href={href}
                      aria-current={href === activeHref ? 'page' : undefined}
                      onClick={closeMenu}
                      variants={dropdownItemVariants}
                    >
                      {label}
                    </motion.a>
                  ))}
                  <motion.a className="mobile-nav-link" href={ctaHref} onClick={closeMenu} variants={dropdownItemVariants}>
                    Join the club
                  </motion.a>
                </motion.nav>
              )}
            </AnimatePresence>
          ) : (
            <nav id="primary-navigation" className="main-nav" aria-label="Main navigation">
              {siteLinks.map(([label, href]) => (
                <a key={label} href={href} aria-current={href === activeHref ? 'page' : undefined}>
                  {label}
                </a>
              ))}
            </nav>
          )}

          <a href={ctaHref} className="button button-secondary">
            Join the club
          </a>
        </div>
    </motion.header>
  );
}

const socialIcons = {
  instagram: InstagramLogo,
  x: XLogo,
  tiktok: TiktokLogo,
  facebook: FacebookLogo,
  linkedin: LinkedinLogo,
  whatsapp: WhatsappLogo,
};

// Brand logos read best solid at small sizes.
function SocialIcon({ name }) {
  const Logo = socialIcons[name];
  return <Logo size={20} weight="fill" aria-hidden="true" />;
}

function Footer() {
  const activeHref = getActiveNavigationHref(window.location.pathname);
  // Profiles without a link are hidden on the live site; the dev preview shows them faded as placeholders.
  const socials = socialLinks.filter((social) => social.url || import.meta.env.DEV);
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : '';

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="index.html" className="brand footer-logo" aria-label="Mind Over Matter home">
            <span className="brand-mark"><img src={logoEmblem} alt="" width="40" height="40" loading="lazy" /></span>
            <span>Mind Over Matter</span>
          </a>
          <p>A student-led mental health club at Kenyatta University, building a community where mental health is openly discussed, actively nurtured, and never faced alone.</p>
          {socials.length > 0 && (
            <ul className="footer-social" aria-label="Mind Over Matter on social media">
              {socials.map((social) => (
                <li key={social.name}>
                  {social.url ? (
                    <a className="footer-social-link" href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${social.name} (opens in a new tab)`}>
                      <SocialIcon name={social.icon} />
                    </a>
                  ) : (
                    <span className="footer-social-link is-placeholder" title={`${social.name}: add the profile link in data/club.js`}>
                      <SocialIcon name={social.icon} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="footer-column" aria-label="Footer">
          <h2>Explore</h2>
          <ul>
            {siteLinks.map(([label, href]) => (
              <li key={label}><a className="footer-link" href={href} aria-current={href === activeHref ? 'page' : undefined}>{label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="footer-column">
          <h2>The club</h2>
          <ul>
            <li><a className="footer-link" href="about-us.html#get-involved">Get involved</a></li>
            <li><a className="footer-link" href="governance.html">Executive Committee</a></li>
            <li><a className="footer-link" href="governance.html">Class Representative Council</a></li>
            <li><a className="footer-link" href={articlesPdf} download>Articles of Association (PDF)</a></li>
            <li><a className="footer-link" href="privacy.html" aria-current={activeHref === 'privacy.html' ? 'page' : undefined}>Privacy policy</a></li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h2>Contact</h2>
          <ul>
            <li>
              <EnvelopeSimple className="footer-icon" size={17} aria-hidden="true" />
              <a className="footer-link" href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            {contact.phone && (
              <li>
                <Phone className="footer-icon" size={17} aria-hidden="true" />
                <a className="footer-link" href={telHref}>{contact.phone}</a>
              </li>
            )}
            <li>
              <MapPin className="footer-icon" size={17} aria-hidden="true" />
              <address>
                <a className="footer-link" href={contact.location.mapUrl} target="_blank" rel="noopener noreferrer">
                  {contact.location.name}<br />{contact.location.detail}<br />{contact.location.city}
                </a>
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Mind Over Matter, Kenyatta University. All rights reserved.</p>
        <p className="footer-credit">
          Designed by {siteCredit.name}
          {siteCredit.linkedin ? (
            <a className="footer-credit-link" href={siteCredit.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${siteCredit.name} on LinkedIn (opens in a new tab)`}>
              <SocialIcon name="linkedin" />
            </a>
          ) : import.meta.env.DEV && (
            <span className="footer-credit-link is-placeholder" title="Add the LinkedIn link in data/club.js">
              <SocialIcon name="linkedin" />
            </span>
          )}
        </p>
        <button type="button" className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top <ArrowUp size={16} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}


function PageLayout({ children, pageClass = '' }) {
  return (
    <>
      <Header />
      <motion.main
        className={pageClass}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOutExpo }}
      >
        {children}
      </motion.main>
      <Footer />
    </>
  );
}

// Posts and events come from Firebase once it is configured; until then built-in samples are shown.
// Each list loads once per visit and is refreshed after the admin changes it.
function useRemoteList(fetcher, samples) {
  const [state, setState] = useState(() => (
    isFirebaseConfigured ? { items: [], status: 'loading' } : { items: samples, status: 'ready' }
  ));

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      setState({ items: await fetcher(), status: 'ready' });
    } catch {
      setState({ items: [], status: 'error' });
    }
  }, [fetcher]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

const PostsContext = createContext(null);
const EventsContext = createContext(null);

function SiteDataProvider({ children }) {
  const posts = useRemoteList(fetchPosts, samplePosts);
  const events = useRemoteList(fetchEvents, sampleEvents);
  return (
    <PostsContext.Provider value={{ posts: posts.items, status: posts.status, refresh: posts.refresh }}>
      <EventsContext.Provider value={{ events: events.items, status: events.status, refresh: events.refresh }}>
        {children}
      </EventsContext.Provider>
    </PostsContext.Provider>
  );
}

function usePosts() {
  return useContext(PostsContext);
}

function useEvents() {
  return useContext(EventsContext);
}

// Shown only until Firebase is connected.
const sampleEvents = [
  { id: 'sample-1', date: '2026-11-12', time: '14:00', type: 'Workshop', title: 'Anxiety Management Workshop', description: 'Practical tools for recognizing anxiety, calming the body, and coping during exam season.', venue: '' },
  { id: 'sample-2', date: '2026-11-27', time: '17:30', type: 'Support group', title: 'Peer Support Circle', description: 'A confidential, judgment-free meet-up for students facing similar challenges, guided by trained peer counselors.', venue: '' },
  { id: 'sample-3', date: '2026-12-09', time: '18:30', type: 'Social', title: 'Game Night & Dinner', description: 'Unwind, meet new people, and build the sense of belonging that keeps us all going.', venue: '' },
];

/* ---------- Event dates ---------- */

// Today's date as "YYYY-MM-DD" in the visitor's own time zone, to compare with stored event dates.
function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isUpcoming(event) {
  return event.date >= todayIso();
}

// "YYYY-MM-DD" → a local Date at midday (so no time zone can push it onto the previous or next day).
function parseEventDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

const monthShort = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const eventLongDate = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

function formatEventTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${((hours + 11) % 12) + 1}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function eventDetails(event) {
  return [formatEventTime(event.time), event.venue || 'Venue to be confirmed'].filter(Boolean).join(' · ');
}

// Loading, error, and empty states shared by every post list. Renders nothing when posts are ready to show.
function PostsStatus({ status, count, emptyTitle = 'No posts yet.', emptyText = 'New articles will appear here soon.' }) {
  if (status === 'loading') return <div className="archive-empty" role="status"><p>Loading posts…</p></div>;
  if (status === 'error') {
    return <div className="archive-empty" role="alert"><h3>We couldn’t load the blog right now.</h3><p>Please check your connection and try again.</p></div>;
  }
  if (!count) return <div className="archive-empty"><h3>{emptyTitle}</h3><p>{emptyText}</p></div>;
  return null;
}

function PostCover({ post, className }) {
  if (post.coverImage) {
    return <div className={`${className} has-image`}><img className={`${className}-image`} src={post.coverImage} alt="" loading="lazy" /></div>;
  }
  return <div className={className}>{post.coverLabel}</div>;
}

function PostCard({ post }) {
  return (
    <article className="post-card">
      <PostCover post={post} className="post-cover" />
      <div className="post-content">
        <span className="post-tag">{categoryLabel(post.category)}</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="post-meta">
          <span><CalendarDots size={14} aria-hidden="true" />{post.date}</span>
          <span><Clock size={14} aria-hidden="true" />{post.readTime}</span>
        </div>
        <div className="post-meta">
          <a href={`article.html?slug=${post.slug}`} className="text-link">Read article <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
      </div>
    </article>
  );
}

function PostRow({ post }) {
  const date = new Date(post.date);
  return (
    <article className="list-item">
      <div className="list-item-date">
        <strong>{date.getDate()}</strong>
        <span>{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}</span>
      </div>
      <div>
        <span className="post-tag">{categoryLabel(post.category)}</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
      <a className="read-more" href={`article.html?slug=${post.slug}`}>Read article <ArrowRight size={17} aria-hidden="true" /></a>
    </article>
  );
}

function HomePage() {
  const { posts, status } = usePosts();
  const [category, setCategory] = useState('all');
  const featuredPosts = posts.slice(0, 3);
  const visiblePosts = category === 'all' ? posts : posts.filter((post) => post.category === category);

  return (
    <PageLayout>
      <section className="hero">
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial="hidden" animate="shown" variants={introVariants}>
            <motion.p className="eyebrow" variants={introItemVariants}>Kenyatta University · Student mental health</motion.p>
            <motion.h1 variants={introItemVariants}>A community where mental health matters.</motion.h1>
            <motion.p className="lede" variants={introItemVariants}>Mind Over Matter is a student-led club building a compassionate, supportive community where mental health is openly discussed, actively nurtured, and never faced alone.</motion.p>
            <motion.div className="hero-actions" variants={introItemVariants}>
              <a href="about-us.html#get-involved" className="button button-primary">Join the club <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="event.html#programs" className="button button-ghost">See our programs <ArrowUpRight size={17} aria-hidden="true" /></a>
            </motion.div>
            <motion.ul className="hero-stats" aria-label="Club at a glance" variants={introItemVariants}>
              <li><CountUp value={programs.length} /><span>core programs</span></li>
              <li><CountUp value={6} /><span>classes represented</span></li>
              <li><CountUp value={coreValues.length} /><span>guiding values</span></li>
            </motion.ul>
          </motion.div>
          <motion.figure
            className="hero-art"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.25 }}
          >
            {/* Gentle, endless float once the entrance has finished. */}
            <motion.img
              src={heroIllustration}
              alt="Illustration of a head in profile with green leaves growing from it, captioned Mental Health Matters"
              width="500"
              height="500"
              fetchPriority="high"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1.2 }}
            />
          </motion.figure>
        </div>
      </section>

      <section className="section section-compact">
        <div className="container">
          <blockquote className="quote-band">
            <Quotes className="quote-icon" size={30} aria-hidden="true" />
            <p>{quote.text}</p>
            <cite>{quote.author}</cite>
          </blockquote>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div className="section-heading">
            <p className="eyebrow">Why we exist</p>
            <h2>Student life carries pressures nobody should carry alone.</h2>
            <p className="lede">We started Mind Over Matter because we saw what our classmates were facing, and how little support there was.</p>
          </div>
          <ol className="problem-list">
            {problems.map((item) => <li key={item.title}><strong>{item.title}</strong><span>{item.text}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Our approach</p>
            <h2>A new way of supporting each other.</h2>
          </div>
          <div className="feature-grid">
            {approach.map((item) => <FeatureCard key={item.title} {...item} />)}
          </div>
          <div className="hero-actions">
            <a href="event.html#programs" className="button button-primary">Explore programs & services <ArrowRight size={17} aria-hidden="true" /></a>
            <a href="about-us.html" className="button button-ghost">Our mission & values <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="featured" className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">From the blog</p>
            <h2>Reflections on resilience, habits, and wellbeing.</h2>
          </div>
          <PostsStatus status={status} count={posts.length} />
          <div className="card-grid">{featuredPosts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
        </div>
      </section>

      <section id="latest" className="section alt-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">Latest articles</p><h2>Stories and reflections from our community.</h2></div>
            <div className="filter-pills" aria-label="Categories">
              {[{ id: 'all', label: 'All' }, ...blogCategories].map(({ id, label }) => (
                <button key={id} className={`pill${category === id ? ' is-active' : ''}`} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {status === 'ready' && posts.length > 0 && !visiblePosts.length && (
            <div className="archive-empty"><h3>No posts in this category yet.</h3><p>Try another category.</p></div>
          )}
          <div className="stack-list">{visiblePosts.map((post) => <PostRow key={post.slug} post={post} />)}</div>
        </div>
      </section>

      <section id="journal" className="section">
        <div className="container journal-wrap">
          <div className="section-heading"><p className="eyebrow">Be part of it</p><h2>Join us in building a healthier community.</h2></div>
          <div className="feature-grid feature-grid-3">
            {waysToJoin.map((item) => <FeatureCard key={item.title} {...item} />)}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function FeatureCard({ title, text, icon, emailLink = false }) {
  return (
    <article className="feature-card">
      <span className="feature-icon"><Icon name={icon} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      {emailLink && (
        <a className="text-link feature-card-link" href={`mailto:${contact.email}?subject=${encodeURIComponent('Donating to Mind Over Matter')}`}>
          <EnvelopeSimple size={16} aria-hidden="true" /> {contact.email}
        </a>
      )}
    </article>
  );
}

function PageHero({ eyebrow, title, lede }) {
  return (
    <section className="page-hero">
      <motion.div className="container narrow-container" initial="hidden" animate="shown" variants={introVariants}>
        <motion.p className="eyebrow" variants={introItemVariants}>{eyebrow}</motion.p>
        <motion.h1 variants={introItemVariants}>{title}</motion.h1>
        {lede && <motion.p className="lede" variants={introItemVariants}>{lede}</motion.p>}
      </motion.div>
    </section>
  );
}


function ArchivePage() {
  const { posts, status } = usePosts();
  const [search, setSearch] = useState('');
  // A category can be chosen by link too, e.g. blog.html?category=coping-skills (used on article pages).
  const [category, setCategory] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('category');
    return categories.includes(requested) ? requested : 'all';
  });
  const query = search.trim().toLowerCase();
  const visiblePosts = posts.filter((post) => (category === 'all' || post.category === category)
    && `${post.title} ${categoryLabel(post.category)} ${post.excerpt}`.toLowerCase().includes(query));
  const activeCategory = blogCategories.find((entry) => entry.id === category);

  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Blog" title="Stories, skills, and support for student life." lede="Articles from the Mind Over Matter community on coping, wellbeing, and life at Kenyatta University." />
      <section className="section"><div className="container">
        <div className="archive-toolbar">
          <label className="sr-only" htmlFor="archive-search">Search articles</label>
          <input id="archive-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles" />
          <div className="filter-pills" role="group" aria-label="Filter by category">
            {[{ id: 'all', label: 'All' }, ...blogCategories].map(({ id, label }) => (
              <button key={id} className={`pill${category === id ? ' is-active' : ''}`} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {activeCategory && <p className="archive-category-note">{activeCategory.description}</p>}
        <div className="archive-list">
          <PostsStatus status={status} count={posts.length} />
          {status === 'ready' && posts.length > 0 && (visiblePosts.length
            ? visiblePosts.map((post) => <PostRow key={post.slug} post={post} />)
            : <div className="archive-empty"><h3>No articles match.</h3><p>Try another keyword or category.</p></div>)}
        </div>
      </div></section>
    </PageLayout>
  );
}

/* ---------- Post formatting ----------
 * Posts are plain text with a few simple marks, rendered here into real HTML elements (never raw HTML,
 * so nothing typed into a post can break or attack the page):
 *   ## Heading   ### Smaller heading   - bullet   1. numbered   > quote
 *   **bold**   *italic*   [link text](https://example.com)
 * A blank line starts a new paragraph or block.
 */
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^\s)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;

function renderInline(text, keyPrefix) {
  return text.split(INLINE_PATTERN).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
    const link = part.match(LINK_PATTERN);
    if (link) {
      const external = link[2].startsWith('http');
      return <a key={key} className="article-link" href={link[2]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link[1]}</a>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderLines(lines, keyPrefix) {
  return lines.flatMap((line, index) => (index === 0 ? renderInline(line, `${keyPrefix}-${index}`) : [<br key={`${keyPrefix}-br-${index}`} />, ...renderInline(line, `${keyPrefix}-${index}`)]));
}

function RichText({ text }) {
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    const key = `block-${index}`;
    const lines = block.split('\n').map((line) => line.trim());
    if (lines[0].startsWith('### ')) return <h3 key={key}>{renderInline(lines.join(' ').slice(4), key)}</h3>;
    if (lines[0].startsWith('## ')) return <h2 key={key}>{renderInline(lines.join(' ').slice(3), key)}</h2>;
    if (lines.every((line) => /^[-*] /.test(line))) {
      return <ul key={key}>{lines.map((line, item) => <li key={`${key}-${item}`}>{renderInline(line.slice(2), `${key}-${item}`)}</li>)}</ul>;
    }
    if (lines.every((line) => /^\d+[.)] /.test(line))) {
      return <ol key={key}>{lines.map((line, item) => <li key={`${key}-${item}`}>{renderInline(line.replace(/^\d+[.)] /, ''), `${key}-${item}`)}</li>)}</ol>;
    }
    if (lines.every((line) => line.startsWith('>'))) {
      return <blockquote key={key}>{renderLines(lines.map((line) => line.replace(/^>\s?/, '')), key)}</blockquote>;
    }
    return <p key={key}>{renderLines(lines, key)}</p>;
  });
}

// Gives each article its own browser-tab title and search description (the page shell only has a generic one).
function useArticleMeta(post) {
  useEffect(() => {
    if (!post) return undefined;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = `${post.title} | Mind Over Matter`;
    description?.setAttribute('content', post.excerpt);
    return () => {
      if (description && previousDescription) description.setAttribute('content', previousDescription);
    };
  }, [post]);
}

function ArticlePage() {
  const { posts, status } = usePosts();
  const slug = new URLSearchParams(window.location.search).get('slug');
  const post = posts.find((entry) => entry.slug === slug);
  useArticleMeta(post);

  if (!post) {
    return (
      <PageLayout pageClass="article-page">
        <article className="article-shell">
          <div className="article-top">
            {status === 'loading' ? <p role="status">Loading article…</p> : (
              <>
                <p className="eyebrow">Blog</p>
                <h1>{status === 'error' ? 'We couldn’t load this article.' : 'Article not found.'}</h1>
                <p className="lede">It may have been removed, or the link may be incorrect.</p>
                <div className="hero-actions"><a href="blog.html" className="button button-primary">Browse the blog <ArrowRight size={17} aria-hidden="true" /></a></div>
              </>
            )}
          </div>
        </article>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageClass="article-page">
      <article className="article-shell">
        <div className="article-top">
          <p className="eyebrow"><a href={`blog.html?category=${post.category}`}>{categoryLabel(post.category)}</a></p>
          <h1>{post.title}</h1>
          <div className="article-meta"><span>{post.author}</span><span>{post.date}</span><span>{post.readTime}</span></div>
        </div>
        <PostCover post={post} className="article-cover" />
        <div className="article-content">
          <RichText text={post.body ?? post.content.join('\n\n')} />
        </div>
        <div className="article-footer">
          <a href="blog.html" className="text-link"><ArrowLeft size={16} aria-hidden="true" /> All articles</a>
        </div>
      </article>
    </PageLayout>
  );
}


const PAST_EVENTS_SHOWN = 6;

function EventCard({ event, isPast = false }) {
  const date = parseEventDate(event.date);
  return (
    <article className={`event-card col-12 col-lg-4${isPast ? ' is-past' : ''}`}>
      <div className="event-date"><strong>{date.getDate()}</strong><span>{monthShort.format(date)}</span>{isPast && <small>{date.getFullYear()}</small>}</div>
      <div className="event-body">
        <span className="post-tag">{isPast ? `Past · ${event.type}` : event.type}</span>
        <h3 className="event-title">{event.title}</h3>
        {event.description && <p>{event.description}</p>}
        <small><CalendarDots size={15} aria-hidden="true" />{eventDetails(event)}</small>
      </div>
    </article>
  );
}

function EventsPage() {
  const { events, status } = useEvents();
  // Events move from "upcoming" to "past" automatically: the split is worked out from today's date on every visit.
  const upcoming = events.filter(isUpcoming);
  const past = events.filter((event) => !isUpcoming(event)).reverse().slice(0, PAST_EVENTS_SHOWN);
  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Events & programs" title="Workshops, support circles, and time to breathe." lede="Upcoming events first, then everything we offer year-round: peer counselling, professional care, support groups, and community." />

      <section className="section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Upcoming events</p><h2>Join us at our next gathering.</h2></div>
        </div>
        <div className="container">
          {status === 'loading' && <div className="archive-empty" role="status"><p>Loading events…</p></div>}
          {status === 'error' && <div className="archive-empty" role="alert"><h3>We couldn’t load events right now.</h3><p>Please check your connection and try again.</p></div>}
          {status === 'ready' && !upcoming.length && (
            <div className="archive-empty"><h3>No upcoming events just now.</h3><p>New events are announced here and on our social media. Check back soon.</p></div>
          )}
        </div>
        <div className="container row g-4 event-grid">
          {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
        </div>

        {past.length > 0 && (
          <>
            <div className="container past-events-heading">
              <div className="section-heading"><p className="eyebrow">Past events</p><h2>A look back at recent gatherings.</h2></div>
            </div>
            <div className="container row g-4 event-grid">
              {past.map((event) => <EventCard key={event.id} event={event} isPast />)}
            </div>
          </>
        )}
      </section>

      <section id="programs" className="section alt-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Programs & services</p><h2>Support that meets students where they are.</h2></div>
          <div className="program-list">
            {programs.map((program, index) => (
              <article className="program-card" key={program.title}>
                <span className="program-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="feature-icon"><Icon name={program.icon} size={28} /></span>
                <div>
                  <h3>{program.title}</h3>
                  <p>{program.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">How we work</p><h2>Four pillars behind every program.</h2></div>
          <div className="feature-grid">
            {approach.map((item) => <FeatureCard key={item.title} {...item} />)}
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Our impact</p><h2>What changes when students support each other.</h2></div>
          <div className="about-grid">
            {impact.map((item) => <article className="about-card" key={item.title}><span className="journal-tag">Impact</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
          <div className="hero-actions">
            <a href="contact-us.html?topic=counselling" className="button button-primary">Book a peer counselling session <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function AboutPage() {
  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="About us" title="Built by students, for students." lede={preamble} />

      <section className="section">
        <div className="container about-grid">
          <article className="about-card"><span className="journal-tag">Our purpose</span><h3>Mental health, valued and protected.</h3><p>{purpose}</p></article>
          <article className="about-card"><span className="journal-tag">Our vision</span><h3>Everyone gets to thrive.</h3><p>{vision}</p></article>
          <article className="about-card"><span className="journal-tag">Membership</span><h3>Open to every KU student.</h3><p>Membership is open to medical students and to every other student currently enrolled at Kenyatta University. <a className="text-link" href="#get-involved">How to join <ArrowRight size={15} aria-hidden="true" /></a></p></article>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container two-col">
          <div className="section-heading">
            <p className="eyebrow">Our mission</p>
            <h2>What we set out to do.</h2>
          </div>
          <ol className="problem-list">
            {mission.map((item) => <li key={item}><span>{item}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Core values</p><h2>The principles that guide everything we do.</h2></div>
          <div className="feature-grid feature-grid-3">
            {coreValues.map((value) => <FeatureCard key={value.name} title={value.name} text={value.text} icon={value.icon} />)}
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container two-col">
          <div className="section-heading">
            <p className="eyebrow">Our objectives</p>
            <h2>How we measure what matters.</h2>
          </div>
          <ul className="check-list">
            {objectives.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Meet the team</p><h2>The people who started it.</h2></div>
          <div className="team-grid">
            {founders.map((person) => (
              <article className="team-card" key={person.name}>
                <img src={founderPhotos[person.photo]} alt={`Portrait of ${person.name}`} width="320" height="320" loading="lazy" decoding="async" />
                <h3>{person.name}</h3>
                <span className="post-tag">{person.role}</span>
                <p>{person.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Our logo</p><h2>A symbol of growth and belonging.</h2></div>
          <figure className="logo-showcase">
            <img src={logoFull} alt="The Mind Over Matter logo: a head in profile with green leaves, inside a green circle, beneath the words Mind Over Matter" width="301" height="258" loading="lazy" decoding="async" />
          </figure>
          <div className="feature-grid">
            {logoSymbolism.map((item) => <FeatureCard key={item.name} title={item.name} text={item.text} icon="sprout" />)}
          </div>
          <div className="hero-actions">
            <a href="governance.html" className="button button-ghost">How the club is run <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="get-involved" className="section"><div className="container">
        <div className="section-heading">
          <p className="eyebrow">Get involved</p>
          <h2>Join us in building a healthier community.</h2>
          <p className="lede">Whether you need support, want to give it, or can help us reach more students, there is a place for you at Mind Over Matter.</p>
        </div>
        <div className="feature-grid feature-grid-3">
          {waysToJoin.map((item) => <FeatureCard key={item.title} {...item} />)}
        </div>
        <div className="hero-actions">
          <a href="contact-us.html" className="button button-primary">Get in touch <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
      </div></section>

      <section className="section alt-section"><div className="container">
        <div className="section-heading"><p className="eyebrow">How we’re funded</p><h2>Keeping support accessible to everyone.</h2></div>
        <div className="about-grid">
          {funding.map((item, index) => <article className="about-card" key={item.title}><span className="journal-tag">{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </div></section>

      <section className="section"><div className="container two-col">
        <div className="section-heading">
          <p className="eyebrow">Lead with us</p>
          <h2>Interested in a leadership role?</h2>
        </div>
        <div>
          <p className="lede">Executive Committee positions are filled through nomination, which may be opened to all members, with approval by the existing committee. Every medical class, Year 1 through Year 6, also has its own class representative.</p>
          <div className="hero-actions">
            <a href="governance.html" className="button button-ghost">See all roles <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </div></section>
    </PageLayout>
  );
}

function GovernancePage() {
  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Governance" title="How Mind Over Matter is run." lede="Our Articles of Association set out a transparent, accountable structure, so every class has a voice and every decision is made openly." />

      <section className="section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Executive Committee</p><h2>The leadership team and what each role does.</h2></div>
          <div className="role-grid">
            {executiveCommittee.map((member) => (
              <article className="about-card" key={member.role}>
                <h3>{member.role}</h3>
                <ul className="check-list check-list-compact">
                  {member.duties.map((duty) => <li key={duty}>{duty}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Wider structure</p><h2>Representation from every year.</h2></div>
          <div className="about-grid">
            {governanceFacts.map((item) => <article className="about-card" key={item.title}><span className="journal-tag">Structure</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Key rules</p><h2>Appointments, voting, and meetings.</h2></div>
          <div className="about-grid">
            {rules.map((item) => <article className="about-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
          <div className="hero-actions">
            <a href={articlesPdf} download className="button button-primary"><DownloadSimple size={17} aria-hidden="true" /> Download the Articles of Association (PDF)</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

// Links can preselect the topic, e.g. contact-us.html?topic=counselling.
const topicFromLink = {
  counselling: 'Peer counselling',
  membership: 'Membership',
  partnership: 'Partnership',
  events: 'Events',
};

const MESSAGE_MAX_LENGTH = 5000;

function ContactPage() {
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const initialTopic = topicFromLink[new URLSearchParams(window.location.search).get('topic')] ?? messageTopics[0];

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    // Hidden "website" field: people never see it, but spam bots fill it in. Pretend it worked and discard it.
    if (values.website) {
      form.reset();
      setStatus({ type: 'success', text: 'Thank you. Your message has been sent.' });
      return;
    }

    if (!isFirebaseConfigured) {
      setStatus({ type: 'error', text: `The message form isn’t connected yet. Please email us at ${contact.email}.` });
      return;
    }

    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      await sendMessage(values);
      form.reset();
      setStatus({ type: 'success', text: 'Thank you. Your message has been sent, and a member of the committee will get back to you by email.' });
    } catch {
      setStatus({ type: 'error', text: `Sorry, your message couldn’t be sent. Please try again, or email us at ${contact.email}.` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Contact us" title="We’re here to listen, connect, and collaborate." lede="Reach out to book a peer counselling session, ask about membership, propose a partnership, or simply say hello. Every message is treated in confidence." />
      <section className="section"><div className="container contact-grid">
        <article className="contact-card"><span className="journal-tag">Get in touch</span><h3>Talk to us.</h3><p>Students can reach out for peer counselling or support group details. Partners, NGOs, and mental health professionals: we would love to work with you.</p><ul className="contact-list">
          <li><EnvelopeSimple className="contact-list-icon" size={17} aria-hidden="true" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
          {contact.phone && <li><Phone className="contact-list-icon" size={17} aria-hidden="true" /><a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a></li>}
          <li><MapPin className="contact-list-icon" size={17} aria-hidden="true" /><span>{contact.location.name}, {contact.location.detail}, {contact.location.city}</span></li>
        </ul></article>
        <div className="contact-form-card"><h3>Send a message</h3><form className="contact-form" onSubmit={handleSubmit}>
          <label>Name<input name="name" type="text" placeholder="Your name" maxLength={100} autoComplete="name" required /></label>
          <label>Email<input name="email" type="email" placeholder="your@email.com" maxLength={200} autoComplete="email" required /></label>
          <label>What’s it about?
            <select name="topic" defaultValue={initialTopic} required>
              {messageTopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          </label>
          <label>Message<textarea name="message" placeholder="Tell us how we can help..." maxLength={MESSAGE_MAX_LENGTH} required /></label>
          <label className="contact-trap" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          <p className="contact-privacy">
            <LockKey className="contact-privacy-icon" size={16} aria-hidden="true" />
            <span>Only the Mind Over Matter committee can read messages. See our <a className="article-link" href="privacy.html">privacy policy</a>.</span>
          </p>
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
          <p className={`form-status ${status.type}`} aria-live="polite">{status.text}</p>
        </form></div>
      </div></section>
    </PageLayout>
  );
}

/* ---------- Admin dashboard ---------- */

const longToday = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Greeting follows the admin's own clock.
function getGreeting(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', Icon: SunHorizon };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', Icon: Sun };
  return { text: 'Good evening', Icon: MoonStars };
}

function AdminPage() {
  const [session, setSession] = useState(() => ({
    status: isFirebaseConfigured ? 'checking' : 'unconfigured',
    user: null,
    isAdmin: false,
    adminName: '',
  }));

  // Explains an automatic sign-out on the sign-in screen that follows it.
  const [signedOutNotice, setSignedOutNotice] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return watchAdmin((next) => setSession({ status: 'ready', ...next }));
  }, []);

  const isSignedInAdmin = session.status === 'ready' && session.user && session.isAdmin;

  function handleIdleSignOut() {
    setSignedOutNotice('You were signed out after 30 minutes of inactivity, to keep the site safe. Please sign in again.');
    signOut();
  }

  let body;
  if (session.status === 'unconfigured') body = <AdminSetupNotice />;
  else if (session.status === 'checking') body = <div className="admin-card admin-narrow" role="status"><p>Checking sign-in…</p></div>;
  else if (!session.user) body = <AdminSignIn notice={signedOutNotice} />;
  else if (!session.isAdmin) {
    body = (
      <div className="admin-card admin-narrow">
        <h2>No admin access</h2>
        <p>You’re signed in as <strong>{session.user.email}</strong>, but this account hasn’t been made an admin. Ask whoever manages the Firebase project to add it.</p>
        <button type="button" className="button button-ghost" onClick={signOut}>Sign out</button>
      </div>
    );
  } else {
    body = <AdminDashboard user={session.user} adminName={session.adminName} onIdleSignOut={handleIdleSignOut} />;
  }

  return (
    <PageLayout pageClass="page-main">
      {!isSignedInAdmin && <PageHero eyebrow="Admin" title="Site dashboard." lede="Sign in to manage blog posts and events." />}
      <section className={isSignedInAdmin ? 'dashboard-section' : 'section'}><div className="container">{body}</div></section>
    </PageLayout>
  );
}

function AdminSetupNotice() {
  return (
    <div className="admin-card admin-narrow">
      <h2>Connect Firebase to start publishing</h2>
      <p>The site isn’t connected to a database yet, so it is showing built-in sample content. To finish setup:</p>
      <ol className="admin-steps">
        <li>Create a Firebase project and add a web app.</li>
        <li>Paste the web app’s config into <code>firebase-config.js</code>.</li>
        <li>Turn on Email/Password sign-in, create the admin’s account, and add the security rules from <code>firestore.rules</code>.</li>
      </ol>
      <p>Full step-by-step instructions are in <code>FIREBASE_SETUP.md</code> in the project folder.</p>
    </div>
  );
}

function AdminSignIn({ notice }) {
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError('');
    setResetSent(false);
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const { password } = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (signInError) {
      setError(describeError(signInError));
      setBusy(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (resetError) {
      setError(describeError(resetError));
    } finally {
      setBusy(false);
    }
  }

  const emailField = (
    <label>Email<input name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
  );

  if (mode === 'reset') {
    return (
      <div className="admin-card admin-narrow">
        <h2>Reset your password</h2>
        {resetSent ? (
          <>
            <p className="dashboard-notice is-success" role="status">
              If <strong>{email}</strong> belongs to an admin account, a password reset link is on its way. Check your inbox, and your spam folder if it doesn’t arrive within a few minutes.
            </p>
            <button type="button" className="button button-primary" onClick={() => switchMode('sign-in')}>Back to sign in</button>
          </>
        ) : (
          <form className="admin-form" onSubmit={handleReset}>
            <p className="admin-hint">Enter the email you sign in with and we’ll send you a link to choose a new password.</p>
            {emailField}
            <div className="dashboard-form-actions">
              <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
              <button type="button" className="button button-ghost" onClick={() => switchMode('sign-in')} disabled={busy}>Back to sign in</button>
            </div>
            <p className="form-status error" aria-live="polite">{error}</p>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="admin-card admin-narrow">
      <h2>Admin sign-in</h2>
      {notice && <p className="dashboard-notice is-info" role="status">{notice}</p>}
      <form className="admin-form" onSubmit={handleSignIn}>
        {emailField}
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <div className="admin-signin-actions">
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <button type="button" className="admin-link-button" onClick={() => switchMode('reset')}>Forgot password?</button>
        </div>
        <p className="form-status error" aria-live="polite">{error}</p>
      </form>
      <p className="admin-hint">For security, you’re signed out when you close this tab or after 30 minutes without activity.</p>
    </div>
  );
}

/* ---------- Automatic sign-out after inactivity ---------- */

const IDLE_SIGN_OUT_MS = 30 * 60_000;
const IDLE_WARNING_MS = 60_000;
const IDLE_CHECK_MS = 1000;
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'];

// Signs the admin out after IDLE_SIGN_OUT_MS without any activity. Returns the seconds left during the final
// IDLE_WARNING_MS (null otherwise) so the dashboard can show a countdown. Time is measured from the clock rather
// than counted by timers, so it stays accurate even when the browser slows timers in a background tab.
function useIdleSignOut(onTimeout) {
  const lastActivity = useRef(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    let lastMark = 0;
    let timedOut = false;

    function check() {
      if (timedOut) return;
      const remaining = IDLE_SIGN_OUT_MS - (Date.now() - lastActivity.current);
      if (remaining <= 0) {
        timedOut = true;
        onTimeoutRef.current();
      } else {
        setSecondsLeft(remaining <= IDLE_WARNING_MS ? Math.ceil(remaining / 1000) : null);
      }
    }

    function markActive() {
      const now = Date.now();
      if (now - lastMark < IDLE_CHECK_MS) return;
      lastMark = now;
      lastActivity.current = now;
      setSecondsLeft(null);
    }

    function handleVisibility() {
      if (!document.hidden) check();
    }

    ACTIVITY_EVENTS.forEach((type) => window.addEventListener(type, markActive, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    const timer = window.setInterval(check, IDLE_CHECK_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((type) => window.removeEventListener(type, markActive));
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(timer);
    };
  }, []);

  function stayActive() {
    lastActivity.current = Date.now();
    setSecondsLeft(null);
  }

  return { secondsLeft, stayActive };
}

function IdleWarning({ secondsLeft, onStay }) {
  return (
    <AnimatePresence>
      {secondsLeft !== null && (
        <motion.div
          className="idle-warning"
          role="alert"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: easeOutExpo }}
        >
          <Clock size={20} aria-hidden="true" />
          <p>Still there? For security, you’ll be signed out in <strong>{secondsLeft} seconds</strong>.</p>
          <button type="button" className="button button-light button-small" onClick={onStay}>Stay signed in</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const dashboardTabs = [
  { id: 'overview', label: 'Overview', Icon: SquaresFour },
  { id: 'posts', label: 'Blog posts', Icon: Newspaper },
  { id: 'events', label: 'Events', Icon: CalendarDots },
  { id: 'messages', label: 'Messages', Icon: EnvelopeSimple },
];

const NO_MESSAGES = [];

const GREETING_REFRESH_MS = 60_000;

function AdminDashboard({ user, adminName, onIdleSignOut }) {
  const { secondsLeft, stayActive } = useIdleSignOut(onIdleSignOut);
  const { posts, status: postsStatus } = usePosts();
  const { events, status: eventsStatus } = useEvents();
  // Messages are private, so they load here (for signed-in admins) rather than for every visitor.
  const messages = useRemoteList(fetchMessages, NO_MESSAGES);
  const unreadCount = messages.items.filter((message) => !message.read).length;
  const [tab, setTab] = useState('overview');
  // null shows the list; 'new' opens a blank editor; an item opens it for editing.
  const [postEditing, setPostEditing] = useState(null);
  const [eventEditing, setEventEditing] = useState(null);
  const [now, setNow] = useState(() => new Date());

  // Keep the greeting right if the dashboard stays open across morning/afternoon/evening.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), GREETING_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const greeting = getGreeting(now);
  const GreetingIcon = greeting.Icon;
  const displayName = capitalize((adminName || user.email.split('@')[0]).split(/\s+/)[0]);
  const upcoming = events.filter(isUpcoming);
  const latestPost = posts[0];

  const stats = [
    { label: 'Published posts', value: postsStatus === 'ready' ? posts.length : '–', Icon: Newspaper },
    { label: 'Upcoming events', value: eventsStatus === 'ready' ? upcoming.length : '–', Icon: CalendarStar },
    { label: 'Unread messages', value: messages.status === 'ready' ? unreadCount : '–', Icon: EnvelopeSimple },
    { label: 'Last post', value: latestPost?.createdAt ? shortDate.format(latestPost.createdAt) : '–', Icon: FileText },
  ];

  function openTab(id) {
    setTab(id);
    setPostEditing(null);
    setEventEditing(null);
  }

  function startPost(post = 'new') {
    setTab('posts');
    setPostEditing(post);
  }

  function startEvent(event = 'new') {
    setTab('events');
    setEventEditing(event);
  }

  return (
    <div className="dashboard">
      <motion.section
        className="dashboard-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
      >
        <div className="dashboard-greeting">
          <p className="dashboard-today"><GreetingIcon size={16} aria-hidden="true" />{longToday.format(now)}</p>
          <h1>{greeting.text}, {displayName}.</h1>
          <p>Welcome back. Here’s what’s happening on the Mind Over Matter site.</p>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="button button-light" onClick={() => startPost()}><NotePencil size={17} aria-hidden="true" /> New post</button>
          <button type="button" className="button button-light" onClick={() => startEvent()}><CalendarPlus size={17} aria-hidden="true" /> New event</button>
          <button type="button" className="button button-outline-light" onClick={signOut}><SignOut size={17} aria-hidden="true" /> Sign out</button>
        </div>
      </motion.section>

      <ul className="dashboard-stats" aria-label="Site at a glance">
        {stats.map(({ label, value, Icon: StatIcon }) => (
          <li key={label} className="dashboard-stat">
            <span className="feature-icon"><StatIcon size={25} aria-hidden="true" /></span>
            <div><strong>{value}</strong><span className="dashboard-stat-label">{label}</span></div>
          </li>
        ))}
      </ul>

      <div className="dashboard-tabs" role="tablist" aria-label="Dashboard sections">
        {dashboardTabs.map(({ id, label, Icon: TabIcon }) => (
          <button
            key={id}
            id={`dashboard-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls="dashboard-panel"
            className={`dashboard-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => openTab(id)}
          >
            <TabIcon size={17} aria-hidden="true" />
            {label}
            {id === 'posts' && postsStatus === 'ready' && <span className="dashboard-count">{posts.length}</span>}
            {id === 'events' && eventsStatus === 'ready' && <span className="dashboard-count">{events.length}</span>}
            {id === 'messages' && unreadCount > 0 && <span className="dashboard-count is-alert" aria-label={`${unreadCount} unread`}>{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div id="dashboard-panel" role="tabpanel" aria-labelledby={`dashboard-tab-${tab}`} className="dashboard-panel">
        {tab === 'overview' && (
          <DashboardOverview
            onOpenTab={openTab}
            onNewPost={() => startPost()}
            onEditPost={startPost}
            onNewEvent={() => startEvent()}
            onEditEvent={startEvent}
          />
        )}
        {tab === 'posts' && <PostsManager editing={postEditing} onEdit={setPostEditing} />}
        {tab === 'events' && <EventsManager editing={eventEditing} onEdit={setEventEditing} />}
        {tab === 'messages' && <MessagesInbox messages={messages.items} status={messages.status} refresh={messages.refresh} />}
      </div>

      <p className="dashboard-signed-in">Signed in as {user.email}</p>
      <IdleWarning secondsLeft={secondsLeft} onStay={stayActive} />
    </div>
  );
}

const OVERVIEW_LIMIT = 4;

function DashboardOverview({ onOpenTab, onNewPost, onEditPost, onNewEvent, onEditEvent }) {
  const { posts, status: postsStatus } = usePosts();
  const { events, status: eventsStatus } = useEvents();
  const upcoming = events.filter(isUpcoming).slice(0, OVERVIEW_LIMIT);

  return (
    <div className="dashboard-overview">
      <section className="dashboard-card" aria-labelledby="overview-posts">
        <div className="dashboard-card-head">
          <h2 id="overview-posts">Latest posts</h2>
          <button type="button" className="text-link" onClick={() => onOpenTab('posts')}>Manage all <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
        <PostsStatus status={postsStatus} count={posts.length} emptyTitle="No posts yet." emptyText="Your published articles will appear here." />
        {postsStatus === 'ready' && !posts.length && (
          <button type="button" className="button button-primary dashboard-card-cta" onClick={onNewPost}><Plus size={17} aria-hidden="true" /> Write the first post</button>
        )}
        <ul className="dashboard-list">
          {posts.slice(0, OVERVIEW_LIMIT).map((post) => (
            <li key={post.slug} className="dashboard-row">
              <PostCover post={post} className="admin-post-cover" />
              <div className="dashboard-row-info"><strong>{post.title}</strong><span>{categoryLabel(post.category)} · {post.date}</span></div>
              <div className="dashboard-row-actions">
                <button type="button" className="button button-ghost button-small" onClick={() => onEditPost(post)}><PencilSimple size={15} aria-hidden="true" /> Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-card" aria-labelledby="overview-events">
        <div className="dashboard-card-head">
          <h2 id="overview-events">Coming up</h2>
          <button type="button" className="text-link" onClick={() => onOpenTab('events')}>Manage all <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
        {eventsStatus === 'loading' && <div className="archive-empty" role="status"><p>Loading events…</p></div>}
        {eventsStatus === 'error' && <div className="archive-empty" role="alert"><h3>We couldn’t load events.</h3><p>Check the security rules are published, then refresh.</p></div>}
        {eventsStatus === 'ready' && !upcoming.length && (
          <>
            <div className="archive-empty"><h3>No upcoming events.</h3><p>Add one and it appears on the Events page straight away.</p></div>
            <button type="button" className="button button-primary dashboard-card-cta" onClick={onNewEvent}><Plus size={17} aria-hidden="true" /> Add an event</button>
          </>
        )}
        <ul className="dashboard-list">
          {upcoming.map((event) => (
            <li key={event.id} className="dashboard-row">
              <EventDateBadge date={event.date} />
              <div className="dashboard-row-info"><strong>{event.title}</strong><span>{event.type} · {eventDetails(event)}</span></div>
              <div className="dashboard-row-actions">
                <button type="button" className="button button-ghost button-small" onClick={() => onEditEvent(event)}><PencilSimple size={15} aria-hidden="true" /> Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function EventDateBadge({ date }) {
  const parsed = parseEventDate(date);
  return (
    <span className="dashboard-date-badge" aria-hidden="true">
      <strong>{parsed.getDate()}</strong>
      <span>{monthShort.format(parsed)}</span>
    </span>
  );
}

// Two-step delete: the first click asks for confirmation; the second deletes.
function DeleteControl({ onDelete }) {
  const [state, setState] = useState('idle');

  if (state === 'idle') {
    return (
      <button type="button" className="button button-ghost button-small" onClick={() => setState('confirm')}>
        <Trash size={15} aria-hidden="true" /> Delete
      </button>
    );
  }

  const busy = state === 'busy';
  return (
    <span className="dashboard-confirm">
      <span>Delete for good?</span>
      <button
        type="button"
        className="button button-danger button-small"
        disabled={busy}
        onClick={async () => {
          setState('busy');
          await onDelete();
          setState('idle');
        }}
      >
        {busy ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button type="button" className="button button-ghost button-small" disabled={busy} onClick={() => setState('idle')}>Cancel</button>
    </span>
  );
}

function DashboardNotice({ notice }) {
  if (!notice) return null;
  return <p className={`dashboard-notice is-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>;
}

function PostsManager({ editing, onEdit }) {
  const { posts, status, refresh } = usePosts();
  const [notice, setNotice] = useState(null);

  if (editing) {
    return (
      <PostEditor
        key={editing === 'new' ? 'new' : editing.slug}
        post={editing === 'new' ? null : editing}
        onCancel={() => onEdit(null)}
        onSaved={(text) => {
          setNotice({ type: 'success', text });
          onEdit(null);
          refresh();
        }}
      />
    );
  }

  async function handleDelete(post) {
    try {
      await removePost(post.slug);
      setNotice({ type: 'success', text: `Deleted “${post.title}”.` });
      await refresh();
    } catch (deleteError) {
      setNotice({ type: 'error', text: describeError(deleteError) });
    }
  }

  return (
    <section className="dashboard-card" aria-labelledby="posts-heading">
      <div className="dashboard-card-head">
        <div>
          <h2 id="posts-heading">Blog posts</h2>
          <p>Everything published on the blog, newest first.</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => onEdit('new')}><Plus size={17} aria-hidden="true" /> New post</button>
      </div>
      <DashboardNotice notice={notice} />
      <PostsStatus status={status} count={posts.length} emptyTitle="No posts yet." emptyText="Click “New post” to publish your first article." />
      <ul className="dashboard-list">
        {posts.map((post) => (
          <li key={post.slug} className="dashboard-row">
            <PostCover post={post} className="admin-post-cover" />
            <div className="dashboard-row-info">
              <strong>{post.title}</strong>
              <span>{categoryLabel(post.category)} · {post.date}{post.updatedAt ? ' · edited' : ''}</span>
            </div>
            <div className="dashboard-row-actions">
              <a className="button button-ghost button-small" href={`article.html?slug=${post.slug}`} target="_blank" rel="noopener noreferrer"><Eye size={15} aria-hidden="true" /> View</a>
              <button type="button" className="button button-ghost button-small" onClick={() => onEdit(post)}><PencilSimple size={15} aria-hidden="true" /> Edit</button>
              <DeleteControl onDelete={() => handleDelete(post)} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Buttons that add the post formatting marks (see RichText) around the selected text, so admins don't have to
// remember them. Inline styles wrap the selection; block styles prefix each selected line.
const formatActions = [
  { id: 'bold', label: 'Bold', short: 'B', wrap: ['**', '**'], placeholder: 'bold text' },
  { id: 'italic', label: 'Italic', short: 'I', wrap: ['*', '*'], placeholder: 'italic text' },
  { id: 'heading', label: 'Heading', short: 'H', prefix: '## ' },
  { id: 'bullets', label: 'Bulleted list', short: '•', prefix: '- ' },
  { id: 'numbers', label: 'Numbered list', short: '1.', prefix: 'number' },
  { id: 'quote', label: 'Quote', short: '“', prefix: '> ' },
  { id: 'link', label: 'Link', short: 'Link', link: true },
];

function FormatToolbar({ textareaRef }) {
  function apply(action) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.slice(start, end);

    if (action.wrap || action.link) {
      const text = selected || action.placeholder || 'link text';
      const replacement = action.link ? `[${text}](https://)` : `${action.wrap[0]}${text}${action.wrap[1]}`;
      textarea.setRangeText(replacement, start, end, 'end');
      if (action.link) {
        // Leave the cursor where the web address goes.
        const urlStart = start + text.length + 3;
        textarea.setSelectionRange(urlStart, urlStart + 'https://'.length);
      } else if (!selected) {
        const textStart = start + action.wrap[0].length;
        textarea.setSelectionRange(textStart, textStart + text.length);
      }
    } else {
      // Expand to whole lines, then prefix each one.
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEndIndex = value.indexOf('\n', end);
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
      const lines = value.slice(lineStart, lineEnd).split('\n');
      const prefixed = lines.map((line, index) => {
        const bare = line.replace(/^(#{2,3} |[-*] |\d+[.)] |> )/, '');
        return `${action.prefix === 'number' ? `${index + 1}. ` : action.prefix}${bare}`;
      }).join('\n');
      textarea.setRangeText(prefixed, lineStart, lineEnd, 'select');
    }
    textarea.focus();
  }

  return (
    <div className="format-toolbar" role="toolbar" aria-label="Formatting">
      {formatActions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`format-button format-${action.id}`}
          title={action.label}
          aria-label={action.label}
          // Keep the textarea's selection: don't let the button take focus on mouse down.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply(action)}
        >
          {action.short}
        </button>
      ))}
    </div>
  );
}

function PostEditor({ post, onCancel, onSaved }) {
  const [cover, setCover] = useState(post?.coverImage ?? null);
  const [coverError, setCoverError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const coverInputRef = useRef(null);
  const bodyRef = useRef(null);
  const isEditing = Boolean(post);

  function clearCover() {
    setCover(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  async function handleCoverChange(event) {
    const file = event.target.files?.[0];
    setCoverError('');
    if (!file) return;
    try {
      setCover(await compressCover(file));
    } catch (coverProblem) {
      clearCover();
      setCoverError(coverProblem.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      if (isEditing) await updatePost(post.slug, { ...values, coverImage: cover });
      else await createPost({ ...values, coverImage: cover });
      onSaved(isEditing ? `Saved your changes to “${values.title.trim()}”.` : 'Published! The post is now live on the blog.');
    } catch (saveError) {
      setError(describeError(saveError));
      setBusy(false);
    }
  }

  return (
    <section className="dashboard-card" aria-labelledby="post-editor-heading">
      <div className="dashboard-card-head">
        <h2 id="post-editor-heading">{isEditing ? 'Edit post' : 'Write a new post'}</h2>
        <button type="button" className="button button-ghost button-small" onClick={onCancel}>Back to posts</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Title<input name="title" type="text" maxLength={200} required defaultValue={post?.title ?? ''} /></label>
        <div className="admin-form-row">
          <label>Category
            <select name="category" required defaultValue={post?.category ?? ''}>
              <option value="" disabled>Choose a category</option>
              {categories.map((value) => <option key={value} value={value}>{categoryLabel(value)}</option>)}
            </select>
          </label>
          <label>Author<input name="author" type="text" maxLength={100} placeholder="Mind Over Matter" defaultValue={post?.author ?? ''} /></label>
        </div>
        <label>Short summary <span className="admin-hint">Optional. Shown on blog cards. Leave blank to use the start of the post.</span>
          <textarea name="excerpt" rows={2} maxLength={300} defaultValue={post?.rawExcerpt ?? ''} />
        </label>
        <div className="admin-field">
          <label htmlFor="post-body">Post <span className="admin-hint">Leave an empty line between paragraphs. Select text, then use the buttons to format it.</span></label>
          <FormatToolbar textareaRef={bodyRef} />
          <textarea id="post-body" ref={bodyRef} name="body" rows={16} required defaultValue={post?.body ?? ''} />
        </div>
        <label>Cover image <span className="admin-hint">Optional. Large photos are resized automatically.</span>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} />
        </label>
        {coverError && <p className="form-status error" role="alert">{coverError}</p>}
        {cover && (
          <div className="admin-cover-preview">
            <img className="admin-cover-image" src={cover} alt="Cover preview" />
            <button type="button" className="button button-ghost button-small" onClick={clearCover}>Remove image</button>
          </div>
        )}
        <div className="dashboard-form-actions">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? 'Saving…' : isEditing ? 'Save changes' : 'Publish post'}
          </button>
          <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        </div>
        <p className="form-status error" aria-live="polite">{error}</p>
      </form>
    </section>
  );
}

function EventsManager({ editing, onEdit }) {
  const { events, status, refresh } = useEvents();
  const [notice, setNotice] = useState(null);

  if (editing) {
    return (
      <EventEditor
        key={editing === 'new' ? 'new' : editing.id}
        event={editing === 'new' ? null : editing}
        onCancel={() => onEdit(null)}
        onSaved={(text) => {
          setNotice({ type: 'success', text });
          onEdit(null);
          refresh();
        }}
      />
    );
  }

  async function handleDelete(event) {
    try {
      await removeEvent(event.id);
      setNotice({ type: 'success', text: `Deleted “${event.title}”.` });
      await refresh();
    } catch (deleteError) {
      setNotice({ type: 'error', text: describeError(deleteError) });
    }
  }

  const upcoming = events.filter(isUpcoming);
  // Most recent past events first.
  const past = events.filter((event) => !isUpcoming(event)).reverse();

  const renderRow = (event) => (
    <li key={event.id} className="dashboard-row">
      <EventDateBadge date={event.date} />
      <div className="dashboard-row-info">
        <strong>{event.title}</strong>
        <span>{event.type} · {eventLongDate.format(parseEventDate(event.date))} · {eventDetails(event)}</span>
      </div>
      <div className="dashboard-row-actions">
        <button type="button" className="button button-ghost button-small" onClick={() => onEdit(event)}><PencilSimple size={15} aria-hidden="true" /> Edit</button>
        <DeleteControl onDelete={() => handleDelete(event)} />
      </div>
    </li>
  );

  return (
    <section className="dashboard-card" aria-labelledby="events-heading">
      <div className="dashboard-card-head">
        <div>
          <h2 id="events-heading">Events</h2>
          <p>Upcoming events show on the public Events page; past ones are kept here for your records.</p>
        </div>
        <button type="button" className="button button-primary" onClick={() => onEdit('new')}><Plus size={17} aria-hidden="true" /> New event</button>
      </div>
      <DashboardNotice notice={notice} />
      {status === 'loading' && <div className="archive-empty" role="status"><p>Loading events…</p></div>}
      {status === 'error' && <div className="archive-empty" role="alert"><h3>We couldn’t load events.</h3><p>Check the latest security rules are published, then refresh the page.</p></div>}
      {status === 'ready' && !events.length && <div className="archive-empty"><h3>No events yet.</h3><p>Click “New event” to add the first one.</p></div>}

      {upcoming.length > 0 && (
        <>
          <h3 className="dashboard-group-title">Upcoming ({upcoming.length})</h3>
          <ul className="dashboard-list">{upcoming.map(renderRow)}</ul>
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 className="dashboard-group-title">Past ({past.length})</h3>
          <ul className="dashboard-list is-past">{past.map(renderRow)}</ul>
        </>
      )}
    </section>
  );
}

function EventEditor({ event, onCancel, onSaved }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isEditing = Boolean(event);

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    const values = Object.fromEntries(new FormData(submitEvent.currentTarget));
    setBusy(true);
    setError('');
    try {
      if (isEditing) await updateEvent(event.id, values);
      else await createEvent(values);
      onSaved(isEditing ? `Saved your changes to “${values.title.trim()}”.` : 'Event added! It now appears on the Events page.');
    } catch (saveError) {
      setError(describeError(saveError));
      setBusy(false);
    }
  }

  return (
    <section className="dashboard-card" aria-labelledby="event-editor-heading">
      <div className="dashboard-card-head">
        <h2 id="event-editor-heading">{isEditing ? 'Edit event' : 'Add a new event'}</h2>
        <button type="button" className="button button-ghost button-small" onClick={onCancel}>Back to events</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Event name<input name="title" type="text" maxLength={120} required defaultValue={event?.title ?? ''} /></label>
        <div className="admin-form-row">
          <label>Type
            <select name="type" required defaultValue={event?.type ?? ''}>
              <option value="" disabled>Choose a type</option>
              {eventTypes.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>Venue <span className="admin-hint">Optional</span>
            <input name="venue" type="text" maxLength={150} placeholder="e.g. Lecture Theatre 2, School of Medicine" defaultValue={event?.venue ?? ''} />
          </label>
        </div>
        <div className="admin-form-row">
          <label>Date<input name="date" type="date" required defaultValue={event?.date ?? ''} /></label>
          <label>Start time <span className="admin-hint">Optional</span><input name="time" type="time" defaultValue={event?.time ?? ''} /></label>
        </div>
        <label>Description <span className="admin-hint">Optional. One or two sentences about what to expect.</span>
          <textarea name="description" rows={4} maxLength={600} defaultValue={event?.description ?? ''} />
        </label>
        <div className="dashboard-form-actions">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? 'Saving…' : isEditing ? 'Save changes' : 'Add event'}
          </button>
          <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        </div>
        <p className="form-status error" aria-live="polite">{error}</p>
      </form>
    </section>
  );
}

const messageDateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const MESSAGE_PREVIEW_LENGTH = 90;

function MessagesInbox({ messages, status, refresh }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState(null);
  // Read/unread changes show instantly; the list is refreshed from the database in the background.
  const [readOverrides, setReadOverrides] = useState({});

  const isRead = (message) => readOverrides[message.id] ?? message.read;
  const visible = filter === 'unread' ? messages.filter((message) => !isRead(message)) : messages;
  const selected = messages.find((message) => message.id === selectedId) ?? null;

  async function markRead(message, read) {
    setReadOverrides((current) => ({ ...current, [message.id]: read }));
    try {
      await setMessageRead(message.id, read);
      refresh();
    } catch (markError) {
      setReadOverrides((current) => ({ ...current, [message.id]: !read }));
      setNotice({ type: 'error', text: describeError(markError) });
    }
  }

  function openMessage(message) {
    setSelectedId(message.id);
    setNotice(null);
    if (!isRead(message)) markRead(message, true);
  }

  async function handleDelete(message) {
    try {
      await removeMessage(message.id);
      setSelectedId(null);
      setNotice({ type: 'success', text: `Deleted the message from ${message.name}.` });
      await refresh();
    } catch (deleteError) {
      setNotice({ type: 'error', text: describeError(deleteError) });
    }
  }

  const replyHref = (message) => {
    const subject = encodeURIComponent(`Re: your message to Mind Over Matter (${message.topic})`);
    return `mailto:${message.email}?subject=${subject}`;
  };

  return (
    <section className="dashboard-card" aria-labelledby="messages-heading">
      <div className="dashboard-card-head">
        <div>
          <h2 id="messages-heading">Messages</h2>
          <p>Sent from the Contact page. Only signed-in admins can read these.</p>
        </div>
        <div className="inbox-filters" role="group" aria-label="Show messages">
          {[['all', 'All'], ['unread', 'Unread']].map(([id, label]) => (
            <button key={id} type="button" className={`pill${filter === id ? ' is-active' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
      </div>
      <DashboardNotice notice={notice} />
      {status === 'loading' && <div className="archive-empty" role="status"><p>Loading messages…</p></div>}
      {status === 'error' && <div className="archive-empty" role="alert"><h3>We couldn’t load messages.</h3><p>Check the latest security rules are published, then refresh the page.</p></div>}
      {status === 'ready' && !visible.length && (
        <div className="archive-empty">
          <h3>{filter === 'unread' ? 'You’re all caught up.' : 'No messages yet.'}</h3>
          <p>{filter === 'unread' ? 'Every message has been read.' : 'Messages sent from the Contact page will appear here.'}</p>
        </div>
      )}

      {visible.length > 0 && (
        <div className={`inbox${selected ? ' has-selection' : ''}`}>
          <ul className="inbox-list">
            {visible.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  className={`inbox-item${isRead(message) ? '' : ' is-unread'}${message.id === selectedId ? ' is-selected' : ''}`}
                  onClick={() => openMessage(message)}
                  aria-current={message.id === selectedId ? 'true' : undefined}
                >
                  <span className="inbox-item-top">
                    <strong className="inbox-item-name">{message.name}</strong>
                    <time dateTime={message.createdAt.toISOString()}>{shortDate.format(message.createdAt)}</time>
                  </span>
                  <span className="inbox-item-topic">{!isRead(message) && <span className="inbox-dot" aria-label="Unread" />}{message.topic}</span>
                  <span className="inbox-item-preview">
                    {message.message.length > MESSAGE_PREVIEW_LENGTH ? `${message.message.slice(0, MESSAGE_PREVIEW_LENGTH)}…` : message.message}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="inbox-reader">
            {selected ? (
              <article aria-labelledby="inbox-reader-heading">
                <button type="button" className="button button-ghost button-small inbox-back" onClick={() => setSelectedId(null)}>Back to messages</button>
                <span className="post-tag">{selected.topic}</span>
                <h3 id="inbox-reader-heading" className="inbox-reader-name">{selected.name}</h3>
                <p className="inbox-meta">
                  <a className="inbox-meta-email" href={`mailto:${selected.email}`}>{selected.email}</a>
                  <span>{messageDateTime.format(selected.createdAt)}</span>
                </p>
                <div className="inbox-body">{selected.message}</div>
                <div className="dashboard-row-actions inbox-actions">
                  <a className="button button-primary button-small" href={replyHref(selected)}><EnvelopeSimple size={15} aria-hidden="true" /> Reply by email</a>
                  <button type="button" className="button button-ghost button-small" onClick={() => markRead(selected, false)}>Mark as unread</button>
                  <DeleteControl onDelete={() => handleDelete(selected)} />
                </div>
              </article>
            ) : (
              <div className="inbox-placeholder">
                <ChatsCircle size={34} aria-hidden="true" />
                <p>Select a message to read it.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function NotFoundPage() {
  return (
    <PageLayout pageClass="page-main">
      <section className="page-hero not-found">
        <motion.div className="container narrow-container" initial="hidden" animate="shown" variants={introVariants}>
          <motion.p className="eyebrow" variants={introItemVariants}>Error 404</motion.p>
          <motion.h1 variants={introItemVariants}>We couldn’t find that page.</motion.h1>
          <motion.p className="lede" variants={introItemVariants}>The link may be broken, or the page may have moved. Try one of these instead:</motion.p>
          <motion.div className="hero-actions" variants={introItemVariants}>
            <a href="index.html" className="button button-primary">Go to the home page <ArrowRight size={17} aria-hidden="true" /></a>
            <a href="event.html" className="button button-ghost">Events & programs</a>
            <a href="blog.html" className="button button-ghost">Blog</a>
            <a href="contact-us.html" className="button button-ghost">Contact us</a>
          </motion.div>
        </motion.div>
      </section>
    </PageLayout>
  );
}

const PRIVACY_LAST_UPDATED = '4 October 2026';

function PrivacyPage() {
  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Privacy policy" title="How we look after your information." lede={`Last updated ${PRIVACY_LAST_UPDATED}. We keep this short and in plain language.`} />
      <section className="section">
        <div className="container narrow-container privacy-content">
          <h2>Who we are</h2>
          <p>Mind Over Matter is a student-led mental health club at Kenyatta University, Nairobi, Kenya. In this policy, “we” means the club and its Executive Committee.</p>

          <h2>What we collect</h2>
          <p>We only collect information you choose to give us:</p>
          <ul>
            <li><strong>Contact form:</strong> your name, email address, the topic you choose, and your message.</li>
            <li><strong>Emails you send us:</strong> whatever you include in them.</li>
          </ul>
          <p>Browsing the site does not require an account. We do not use advertising or tracking cookies, and we do not sell or share your information for marketing.</p>

          <h2>Why we collect it</h2>
          <p>We use your details only to read and reply to your message, for example to arrange peer counselling, answer a question, or follow up on a partnership. We rely on your consent, which you give by sending the message.</p>

          <h2>Sensitive information</h2>
          <p>Messages about mental health can be personal. Only share what you’re comfortable with. Messages are treated in confidence and are read only by authorised committee members.</p>

          <h2>Who can see it</h2>
          <p>Only signed-in committee members (site administrators) can read contact messages. Messages are stored securely using Google Firebase, which may process data on servers outside Kenya. We do not pass your information to anyone else unless the law requires it.</p>

          <h2>How long we keep it</h2>
          <p>We keep messages only as long as we need them to respond and follow up, and we review and delete old messages at least once a year.</p>

          <h2>Your rights</h2>
          <p>Under Kenya’s Data Protection Act, 2019, you can ask us to:</p>
          <ul>
            <li>tell you what information we hold about you;</li>
            <li>correct anything that is wrong;</li>
            <li>delete your information; or</li>
            <li>stop using it.</li>
          </ul>
          <p>
            To make a request, email <a className="article-link" href={`mailto:${contact.email}`}>{contact.email}</a>. If you’re not satisfied with our response, you can complain to the Office of the Data Protection Commissioner (ODPC).
          </p>

          <h2>Changes to this policy</h2>
          <p>If we change how we handle information, we’ll update this page and the date at the top.</p>
        </div>
      </section>
    </PageLayout>
  );
}

const pageTitles = {
  'index.html': 'Mind Over Matter | Kenyatta University Mental Health Club',
  'event.html': 'Events & Programs | Mind Over Matter',
  'blog.html': 'Blog | Mind Over Matter',
  'article.html': 'Mind Over Matter | Article',
  'about-us.html': 'About Us | Mind Over Matter',
  'governance.html': 'Governance | Mind Over Matter',
  'contact-us.html': 'Contact Us | Mind Over Matter',
  'privacy.html': 'Privacy Policy | Mind Over Matter',
  'admin.html': 'Admin | Mind Over Matter',
};

const NOT_FOUND_TITLE = 'Page not found | Mind Over Matter';

// Shown only when rendering fails. Slow start-up is covered by the boot loader in each page's HTML,
// which appears only if the app takes longer than 0.4s to start.
function LoadErrorScreen() {
  return (
    <div className="page-transition is-visible is-initial" role="alert">
      <div className="page-transition-content">
        <div className="page-transition-emblem" aria-hidden="true">
          <span className="page-transition-orbit page-transition-orbit-outer" />
          <span className="page-transition-orbit page-transition-orbit-inner" />
          <span className="page-transition-mark"><img src={logoEmblem} alt="" width="64" height="64" /></span>
        </div>
        <div className="page-transition-copy">
          <strong>Mind Over Matter</strong>
          <span>Something went wrong while loading this page.</span>
        </div>
        <button type="button" className="button button-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <LoadErrorScreen /> : this.props.children;
  }
}

function scrollToTarget(url) {
  const targetId = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
  if (targetId) window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView());
}

function App() {
  const [route, setRoute] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));
  const page = route.pathname.split('/').pop() || 'index.html';
  useScrollReveal();

  // Content is rendered by JavaScript, so the browser's own jump-to-hash on load finds nothing.
  useEffect(() => {
    scrollToTarget(new URL(window.location.href));
  }, []);

  useEffect(() => {
    function navigate(url, addHistoryEntry = true) {
      if (addHistoryEntry) window.history.pushState({}, '', url);

      setRoute({ pathname: url.pathname, search: url.search });
      window.scrollTo(0, 0);
      scrollToTarget(url);
    }

    function handleInternalLink(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const anchor = event.target.closest('a');
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

      const url = new URL(anchor.href, window.location.href);
      const pageName = url.pathname.split('/').pop() || 'index.html';
      if (url.origin !== window.location.origin || !Object.hasOwn(pageTitles, pageName)) return;

      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const targetPath = url.pathname.replace(/\/+$/, '') || '/';
      const isSamePage = currentPath === targetPath ||
        ((currentPath === '/' || currentPath === '/index.html') &&
          (targetPath === '/' || targetPath === '/index.html'));

      if (isSamePage && url.search === window.location.search) {
        event.preventDefault();
        if (url.hash) {
          document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      event.preventDefault();
      navigate(url);
    }

    function handlePopState() {
      navigate(new URL(window.location.href), false);
    }

    document.addEventListener('click', handleInternalLink);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleInternalLink);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    document.title = pageTitles[page] ?? NOT_FOUND_TITLE;
  }, [page]);

  const routes = {
    'index.html': HomePage,
    'event.html': EventsPage,
    'blog.html': ArchivePage,
    'article.html': ArticlePage,
    'about-us.html': AboutPage,
    'governance.html': GovernancePage,
    'contact-us.html': ContactPage,
    'privacy.html': PrivacyPage,
    'admin.html': AdminPage,
  };
  const PageComponent = routes[page] ?? NotFoundPage;
  const content = <PageComponent />;

  return (
    <MotionConfig reducedMotion="user">
      {/* Every Phosphor icon on the site defaults to the two-tone style unless it sets its own weight. */}
      <IconContext.Provider value={ICON_DEFAULTS}>
        <SiteDataProvider>
          <ErrorBoundary key={page}>{content}</ErrorBoundary>
        </SiteDataProvider>
      </IconContext.Provider>
    </MotionConfig>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = import.meta.hot?.data.root ?? createRoot(rootElement);

  if (import.meta.hot) import.meta.hot.data.root = root;
  root.render(<App />);
}
