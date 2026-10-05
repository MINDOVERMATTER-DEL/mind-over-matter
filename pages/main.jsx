import { Component, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, CalendarDots, CalendarPlus, CalendarStar, ChatsCircle, CheckCircle,
  Clock, Confetti, EnvelopeSimple, Eye, FacebookLogo, GraduationCap, HandCoins, HandHeart,
  Handshake, Heart, IconContext, InstagramLogo, LinkedinLogo, List, LockKey, MapPin, Megaphone, Minus, MoonStars,
  Newspaper, NotePencil, Package, PencilSimple, Phone, Plant, Plus, Quotes, ShareNetwork, ShoppingBag, SignOut,
  SquaresFour, Stethoscope, Sun, SunHorizon, TiktokLogo, Trash, Truck, UsersThree, WhatsappLogo, X, XLogo,
} from './icons.jsx';
import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { posts as samplePosts } from '../data/posts.js';
import {
  blogCategories, categories, categoryLabel, compressCover, compressProductImage, createEvent, createPost, createProduct, describeError, eventTypes, fetchEvents, fetchPosts,
  deliveryOptions, fetchMessages, fetchOrders, fetchProducts, importProducts, isFirebaseConfigured, messageTopics, orderStatuses, placeOrder,
  removeEvent, removeMessage, removeOrder, removePost, removeProduct, resetPassword, sendMessage, setMessageRead, setOrderStatus, signIn,
  signOut, updateEvent, updatePost, updateProduct, watchAdmin,
} from '../data/blog.js';
import {
  formatPrice, imageLabels, MAX_PRODUCT_IMAGES, merchTagline, orderTotal, productCategories, resolveImage, sizeOptions,
  starterProducts,
} from '../data/merch.js';
import {
  approach, contact, coreValues, funding, impact, logoSymbolism, mission,
  objectives, preamble, problems, programs, purpose, quote, siteCredit, socialLinks, team, vision, waysToJoin,
} from '../data/club.js';
import faithPhoto from '../assets/images/team/faith-waigi.webp';
import reaganPhoto from '../assets/images/team/reagan-kirwa.webp';
import rogersPhoto from '../assets/images/team/rogers-kuria.webp';
import krystalPhoto from '../assets/images/team/krystal-karan.webp';
import jamesPhoto from '../assets/images/team/james-mvoi.webp';
import clubGroupPhoto from '../assets/images/community/club-group.webp';
import supportSessionPhoto from '../assets/images/community/support-session.webp';
import logoEmblem from '../assets/images/logo/logo-emblem.webp';
import logoFull from '../assets/images/logo/logo-full.webp';
import articlesPdf from '../documents/MIND OVER MATTER ARTICLES OF ASSOCIATION.pdf?url';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/fraunces';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import '../styles.css';

const siteLinks = [
  ['Home', '/'],
  ['Events', '/event'],
  ['Blog', '/blog'],
  ['Merch', '/merch'],
  ['About Us', '/about-us'],
  ['Contact', '/contact-us'],
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

const teamPhotos = { faith: faithPhoto, reagan: reaganPhoto, rogers: rogersPhoto, krystal: krystalPhoto, james: jamesPhoto };

const ICON_DEFAULTS = { weight: 'duotone' };

function Icon({ name, size = 27 }) {
  const Component = icons[name] || Plant;
  return <Component size={size} aria-hidden="true" />;
}

// The site uses clean addresses (/blog, /admin). Turns any address into a page name, accepting the older .html
// form too: "/", "/index.html" → "index"; "/blog" or "/blog.html" → "blog".
function getPageName(pathname) {
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  return last.replace(/\.html$/, '') || 'index';
}

function pageHref(page) {
  return page === 'index' ? '/' : `/${page}`;
}

// Which menu item to underline: articles belong to Blog.
function getActiveNavigationHref(pathname) {
  const page = getPageName(pathname);
  if (page === 'article') return '/blog';
  return pageHref(page);
}

const COMPACT_QUERY = '(width <= 920px)';
const SHOW_NEAR_TOP = 120;
const SCROLL_JITTER = 4;
const MENU_CLOSE_SCROLL = 80;
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
  '.list-item', '.problem-list li', '.check-list li', '.quote-band', '.logo-showcase', '.photo-tile',
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
function CountUp({ value, suffix = '' }) {
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
      <span aria-hidden="true">{display}{suffix}</span>
      <span className="sr-only">{value}{suffix}</span>
    </strong>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);
  const headerRef = useRef(null);
  const activeHref = getActiveNavigationHref(window.location.pathname);
  const { count: cartCount } = useCart();
  const { scrollY } = useScroll();
  // Where the page was scrolled to when the menu opened (null while it's closed).
  const menuOpenedAt = useRef(null);

  useEffect(() => {
    menuOpenedAt.current = menuOpen ? window.scrollY : null;
  }, [menuOpen]);

  // Hide while scrolling down, reveal on any scroll up, and always show near the top of the page.
  useMotionValueEvent(scrollY, 'change', (current) => {
    // With the menu open, ignore the small movements phones make on their own (momentum, the address bar
    // resizing, the bounce at the page edge); only a deliberate scroll closes it.
    if (menuOpenedAt.current !== null) {
      if (Math.abs(current - menuOpenedAt.current) > MENU_CLOSE_SCROLL) setMenuOpen(false);
      return;
    }
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
  const ctaHref = '/about-us#get-involved';

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
          <a href="/" className="brand" aria-label="Mind Over Matter home">
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

          <div className="nav-actions">
            {cartCount > 0 && (
              <a href="/merch?view=cart" className="cart-link" aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}>
                <ShoppingBag size={22} aria-hidden="true" />
                <span className="cart-count" aria-hidden="true">{cartCount}</span>
              </a>
            )}
            <a href={ctaHref} className="button button-secondary">
              Join the club
            </a>
          </div>
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
          <a href="/" className="brand footer-logo" aria-label="Mind Over Matter home">
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
            <li><a className="footer-link" href="/about-us#get-involved">Get involved</a></li>
            <li><a className="footer-link" href={articlesPdf} download>Articles of Association (PDF)</a></li>
            <li><a className="footer-link" href="/privacy" aria-current={activeHref === '/privacy' ? 'page' : undefined}>Privacy policy</a></li>
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
                  {contact.location.city}
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
const ProductsContext = createContext(null);

function SiteDataProvider({ children }) {
  const posts = useRemoteList(fetchPosts, samplePosts);
  const events = useRemoteList(fetchEvents, sampleEvents);
  const products = useRemoteList(fetchProducts, starterProducts);
  // Until products have been imported in the dashboard, the shop shows the built-in starter catalogue. It is
  // also the fallback if products can't be loaded, so the shop never goes blank.
  const usingStarter = products.status === 'error' || (products.status === 'ready' && !products.items.length);
  const productValue = {
    products: usingStarter ? starterProducts : products.items,
    status: usingStarter ? 'ready' : products.status,
    loadFailed: products.status === 'error',
    refresh: products.refresh,
    usingStarter: usingStarter || !isFirebaseConfigured,
  };
  return (
    <PostsContext.Provider value={{ posts: posts.items, status: posts.status, refresh: posts.refresh }}>
      <EventsContext.Provider value={{ events: events.items, status: events.status, refresh: events.refresh }}>
        <ProductsContext.Provider value={productValue}>
          {children}
        </ProductsContext.Provider>
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

// All products (admins see hidden ones too); `shopProducts` lists only those shown in the shop.
function useProducts() {
  const context = useContext(ProductsContext);
  const findProduct = (id) => context.products.find((product) => product.id === id) ?? null;
  const shopProducts = context.products.filter((product) => product.available && product.images.length);
  return { ...context, findProduct, shopProducts };
}

// Shown only until Firebase is connected.
const sampleEvents = [
  { id: 'sample-1', date: '2026-11-12', time: '14:00', type: 'Workshop', title: 'Anxiety Management Workshop', description: 'Practical tools for recognizing anxiety, calming the body, and coping during exam season.', venue: '' },
  { id: 'sample-2', date: '2026-11-27', time: '17:30', type: 'Support group', title: 'Support Circle', description: 'A confidential, judgment-free meet-up for students facing similar challenges.', venue: '' },
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
          <a href={`/article?slug=${post.slug}`} className="text-link">Read article <ArrowRight size={17} aria-hidden="true" /></a>
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
      <a className="read-more" href={`/article?slug=${post.slug}`}>Read article <ArrowRight size={17} aria-hidden="true" /></a>
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
      <section className="hero hero-photo">
        {/* The club group photo fills the hero, under a green wash that keeps the text readable. */}
        <motion.img
          className="hero-photo-bg"
          src={clubGroupPhoto}
          alt=""
          width="1280"
          height="960"
          fetchPriority="high"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: easeOutExpo }}
        />
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial="hidden" animate="shown" variants={introVariants}>
            <motion.p className="eyebrow" variants={introItemVariants}>Kenyatta University · Student mental health</motion.p>
            <motion.h1 variants={introItemVariants}>A community where mental health matters.</motion.h1>
            <motion.p className="lede hero-lede" variants={introItemVariants}>Mind Over Matter is a student-led club building a compassionate, supportive community where mental health is openly discussed, actively nurtured, and never faced alone.</motion.p>
            <motion.div className="hero-actions" variants={introItemVariants}>
              <a href="/about-us#get-involved" className="button button-primary">Join the club <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="/event#programs" className="button button-ghost">See our programs <ArrowUpRight size={17} aria-hidden="true" /></a>
            </motion.div>
            <motion.ul className="hero-stats" aria-label="Club at a glance" variants={introItemVariants}>
              <li><CountUp value={4} /><span className="hero-stat-label">core programs</span></li>
              <li><CountUp value={600} suffix="+" /><span className="hero-stat-label">students represented</span></li>
              <li><CountUp value={coreValues.length} /><span className="hero-stat-label">guiding values</span></li>
            </motion.ul>
          </motion.div>
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
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Our community</p>
            <h2>Real students, real conversations.</h2>
            <p className="lede">Every gathering is a chance to talk openly, listen without judgement, and leave feeling a little less alone.</p>
          </div>
          <div className="photo-mosaic">
            <ClubPhoto src={clubGroupPhoto} alt="Mind Over Matter members gathered together in a lecture hall" caption="The Mind Over Matter family" width="1280" height="960" wide />
            <ClubPhoto src={supportSessionPhoto} alt="Students seated around a table, smiling and talking during a club session" caption="Conversations that matter" width="960" height="1280" />
          </div>
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
            <a href="/event#programs" className="button button-primary">Explore programs & services <ArrowRight size={17} aria-hidden="true" /></a>
            <a href="/about-us" className="button button-ghost">Our mission & values <ArrowUpRight size={17} aria-hidden="true" /></a>
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

      <MerchPromo />
    </PageLayout>
  );
}

// A photo from club life, with a short caption over its lower corner.
function ClubPhoto({ src, alt, caption, width, height, wide = false, band = false }) {
  return (
    <figure className={`photo-tile${wide ? ' photo-tile-wide' : ''}${band ? ' photo-tile-band' : ''}`}>
      <img className={`photo-tile-img${band ? ' photo-tile-band-img' : ''}`} src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
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
  // A category can be chosen by link too, e.g. /blog?category=coping-skills (used on article pages).
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
                <div className="hero-actions"><a href="/blog" className="button button-primary">Browse the blog <ArrowRight size={17} aria-hidden="true" /></a></div>
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
          <p className="eyebrow"><a href={`/blog?category=${post.category}`}>{categoryLabel(post.category)}</a></p>
          <h1>{post.title}</h1>
          <div className="article-meta"><span>{post.author}</span><span>{post.date}</span><span>{post.readTime}</span></div>
        </div>
        <PostCover post={post} className="article-cover" />
        <div className="article-content">
          <RichText text={post.body ?? post.content.join('\n\n')} />
        </div>
        <div className="article-footer">
          <a href="/blog" className="text-link"><ArrowLeft size={16} aria-hidden="true" /> All articles</a>
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
      <PageHero eyebrow="Events & programs" title="Workshops, support circles, and time to breathe." lede="Upcoming events first, then everything we offer year-round: professional care, support groups, workshops, and community." />

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
          <div className="section-heading"><p className="eyebrow">How we work</p><h2>The pillars behind every program.</h2></div>
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
            <a href="/contact-us" className="button button-primary">Get in touch <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
      <MerchBanner />
    </PageLayout>
  );
}

function AboutPage() {
  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="About us" title="Built by students, for students." lede={preamble} />

      <section className="section section-compact">
        <div className="container">
          <ClubPhoto src={clubGroupPhoto} alt="Mind Over Matter members gathered together in a lecture hall" caption="Our members at a club gathering" width="1280" height="960" band />
        </div>
      </section>

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
          <div className="section-heading"><p className="eyebrow">Meet the team</p><h2>The faces behind the organisation.</h2></div>
          <div className="team-grid">
            {team.map((person) => (
              <article className={`team-card${person.name ? '' : ' is-vacant'}`} key={person.role}>
                {person.photo ? (
                  <img src={teamPhotos[person.photo]} alt={`Portrait of ${person.name}`} width="320" height="320" loading="lazy" decoding="async" />
                ) : (
                  <span className="team-placeholder" aria-hidden="true"><UsersThree size={56} /></span>
                )}
                <h3>{person.name ?? 'To be announced'}</h3>
                <span className="post-tag">{person.role}</span>
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
        <ClubPhoto src={supportSessionPhoto} alt="Students seated around a table, smiling and talking during a club session" caption="There’s a seat for you" width="960" height="1280" band />
        <div className="hero-actions">
          <a href="/contact-us" className="button button-primary">Get in touch <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
      </div></section>

      <section className="section alt-section"><div className="container">
        <div className="section-heading"><p className="eyebrow">How we’re funded</p><h2>Keeping support accessible to everyone.</h2></div>
        <div className="about-grid">
          {funding.map((item, index) => <article className="about-card" key={item.title}><span className="journal-tag">{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </div></section>

    </PageLayout>
  );
}

// Links can preselect the topic, e.g. /contact-us?topic=membership.
const topicFromLink = {
  membership: 'Membership',
  merch: 'Merch',
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
      <PageHero eyebrow="Contact us" title="We’re here to listen, connect, and collaborate." lede="Reach out with a question, ask about membership or events, propose a partnership, or simply say hello. Every message is treated in confidence." />
      <section className="section"><div className="container contact-grid">
        <article className="contact-card"><span className="journal-tag">Get in touch</span><h3>Talk to us.</h3><p>Students can reach out about support groups, events, or membership. Partners, NGOs, and mental health professionals: we would love to work with you.</p><ul className="contact-list">
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
            <span>Only the Mind Over Matter committee can read messages. See our <a className="article-link" href="/privacy">privacy policy</a>.</span>
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
  { id: 'orders', label: 'Orders', Icon: Package },
  { id: 'merch', label: 'Merch', Icon: ShoppingBag },
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
  const orders = useRemoteList(fetchOrders, NO_MESSAGES);
  const newOrderCount = orders.items.filter((order) => order.status === 'new').length;
  const [tab, setTab] = useState('overview');
  // null shows the list; 'new' opens a blank editor; an item opens it for editing.
  const [postEditing, setPostEditing] = useState(null);
  const [eventEditing, setEventEditing] = useState(null);
  const [productEditing, setProductEditing] = useState(null);
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

  const stats = [
    { label: 'Published posts', value: postsStatus === 'ready' ? posts.length : '–', Icon: Newspaper },
    { label: 'Upcoming events', value: eventsStatus === 'ready' ? upcoming.length : '–', Icon: CalendarStar },
    { label: 'Unread messages', value: messages.status === 'ready' ? unreadCount : '–', Icon: EnvelopeSimple },
    { label: 'New orders', value: orders.status === 'ready' ? newOrderCount : '–', Icon: Package },
  ];

  function openTab(id) {
    setTab(id);
    setPostEditing(null);
    setEventEditing(null);
    setProductEditing(null);
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
            {id === 'orders' && newOrderCount > 0 && <span className="dashboard-count is-alert" aria-label={`${newOrderCount} new`}>{newOrderCount}</span>}
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
        {tab === 'orders' && <OrdersManager orders={orders.items} status={orders.status} refresh={orders.refresh} />}
        {tab === 'merch' && <ProductsManager editing={productEditing} onEdit={setProductEditing} />}
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
              <a className="button button-ghost button-small" href={`/article?slug=${post.slug}`} target="_blank" rel="noopener noreferrer"><Eye size={15} aria-hidden="true" /> View</a>
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

function ProductsManager({ editing, onEdit }) {
  const { products, status, refresh, usingStarter, loadFailed } = useProducts();
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  if (editing) {
    return (
      <ProductEditor
        key={editing === 'new' ? 'new' : editing.id}
        product={editing === 'new' ? null : editing}
        nextSortOrder={products.reduce((max, product) => Math.max(max, product.sortOrder), -1) + 1}
        onCancel={() => onEdit(null)}
        onSaved={(text) => {
          setNotice({ type: 'success', text });
          onEdit(null);
          refresh();
        }}
      />
    );
  }

  // Products added to the website's built-in catalogue after the first import, placed after the existing ones.
  // A built-in product that was deleted in the dashboard shows up here again, so it can be restored.
  const lastSortOrder = products.reduce((max, product) => Math.max(max, product.sortOrder), -1);
  const newStarterProducts = starterProducts
    .filter((starter) => !products.some((product) => product.id === starter.id))
    .map((starter, index) => ({ ...starter, sortOrder: lastSortOrder + 1 + index }));

  async function run(task, successText) {
    setBusy(true);
    try {
      await task();
      setNotice({ type: 'success', text: successText });
      await refresh();
    } catch (taskError) {
      setNotice({ type: 'error', text: describeError(taskError) });
    } finally {
      setBusy(false);
    }
  }

  // Swaps a product's position with its neighbour, which sets the order products appear in the shop.
  function move(index, direction) {
    const other = products[index + direction];
    const product = products[index];
    run(async () => {
      await updateProduct(product.id, { ...product, sortOrder: other.sortOrder });
      await updateProduct(other.id, { ...other, sortOrder: product.sortOrder });
    }, `Moved “${product.name}” ${direction < 0 ? 'up' : 'down'}.`);
  }

  return (
    <section className="dashboard-card" aria-labelledby="products-heading">
      <div className="dashboard-card-head">
        <div>
          <h2 id="products-heading">Merch</h2>
          <p>Products in the order they appear in the shop. The first three are also featured on the home page.</p>
        </div>
        {!usingStarter && <button type="button" className="button button-primary" onClick={() => onEdit('new')}><Plus size={17} aria-hidden="true" /> New product</button>}
      </div>
      <DashboardNotice notice={notice} />
      {status === 'loading' && <div className="archive-empty" role="status"><p>Loading products…</p></div>}
      {loadFailed && (
        <p className="dashboard-notice is-error" role="alert">
          Couldn’t load products from the database, so the shop is showing the starter catalogue. Check the latest security rules are published, then refresh the page.
        </p>
      )}

      {status === 'ready' && usingStarter && !loadFailed && (
        <div className="dashboard-notice is-info starter-notice">
          <p><strong>The shop is showing the starter catalogue</strong> built into the website. Import it once to edit prices, details, and photos, and to add new products.</p>
          <button type="button" className="button button-primary button-small" disabled={busy} onClick={() => run(() => importProducts(starterProducts), 'Imported the starter products. You can now edit them and add more.')}>
            {busy ? 'Importing…' : 'Import starter products'}
          </button>
        </div>
      )}

      {status === 'ready' && !usingStarter && newStarterProducts.length > 0 && (
        <div className="dashboard-notice is-info starter-notice">
          <p><strong>{newStarterProducts.length} new {newStarterProducts.length === 1 ? 'design is' : 'designs are'} ready to add:</strong> {newStarterProducts.map((product) => product.name).join(', ')}. They’ll go to the end of the shop, and you can edit or hide them afterwards.</p>
          <button type="button" className="button button-primary button-small" disabled={busy} onClick={() => run(() => importProducts(newStarterProducts), `Added ${newStarterProducts.length} new ${newStarterProducts.length === 1 ? 'product' : 'products'} to the shop.`)}>
            {busy ? 'Adding…' : 'Add to shop'}
          </button>
        </div>
      )}

      <ul className="dashboard-list">
        {products.map((product, index) => (
          <li key={product.id} className={`dashboard-row${product.available ? '' : ' is-hidden-product'}`}>
            <span className="product-row-thumb">
              {product.images[0] && <img src={resolveImage(product.images[0].src)} alt="" width="1000" height="1250" />}
            </span>
            <div className="dashboard-row-info">
              <strong>{product.name}</strong>
              <span>{product.category} · {formatPrice(product.price)}{product.available ? '' : ' · Hidden from shop'}</span>
            </div>
            {!usingStarter && (
              <div className="dashboard-row-actions">
                <button type="button" className="button button-ghost button-small" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Move ${product.name} up`}>↑</button>
                <button type="button" className="button button-ghost button-small" disabled={busy || index === products.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${product.name} down`}>↓</button>
                <button type="button" className="button button-ghost button-small" disabled={busy} onClick={() => run(() => updateProduct(product.id, { ...product, available: !product.available }), product.available ? `“${product.name}” is now hidden from the shop.` : `“${product.name}” is now in the shop.`)}>
                  {product.available ? 'Hide' : 'Show'}
                </button>
                <button type="button" className="button button-ghost button-small" onClick={() => onEdit(product)}><PencilSimple size={15} aria-hidden="true" /> Edit</button>
                <DeleteControl onDelete={() => run(() => removeProduct(product.id), `Deleted “${product.name}”.`)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductEditor({ product, nextSortOrder, onCancel, onSaved }) {
  const isEditing = Boolean(product);
  const [images, setImages] = useState(() => product?.images ?? []);
  const [sizes, setSizes] = useState(() => product?.sizes ?? ['S', 'M', 'L', 'XL', 'XXL']);
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const imageInputRef = useRef(null);

  async function handleImageChange(event) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PRODUCT_IMAGES - images.length);
    setImageError('');
    try {
      const added = [];
      for (const file of files) {
        added.push({ src: await compressProductImage(file), label: imageLabels[Math.min(images.length + added.length, imageLabels.length - 1)] });
      }
      setImages((current) => [...current, ...added]);
    } catch (imageProblem) {
      setImageError(imageProblem.message);
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }

  function updateImage(index, changes) {
    setImages((current) => current.map((image, i) => (i === index ? { ...image, ...changes } : image)));
  }

  function moveImage(index, direction) {
    setImages((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }

  function toggleSize(size) {
    setSizes((current) => (current.includes(size)
      ? current.filter((entry) => entry !== size)
      : sizeOptions.filter((option) => option === size || current.includes(option))));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!images.length) {
      setError('Add at least one photo.');
      return;
    }
    if (!sizes.length) {
      setError('Choose at least one size.');
      return;
    }
    const fields = {
      name: values.name,
      category: values.category,
      price: values.price,
      sizes,
      description: values.description,
      details: values.details.split('\n'),
      images,
      available: values.available === 'on',
      sortOrder: product?.sortOrder ?? nextSortOrder,
    };
    setBusy(true);
    setError('');
    try {
      if (isEditing) await updateProduct(product.id, fields);
      else await createProduct(fields);
      onSaved(isEditing ? `Saved your changes to “${values.name.trim()}”.` : `Added “${values.name.trim()}” to the shop.`);
    } catch (saveError) {
      setError(describeError(saveError));
      setBusy(false);
    }
  }

  return (
    <section className="dashboard-card" aria-labelledby="product-editor-heading">
      <div className="dashboard-card-head">
        <h2 id="product-editor-heading">{isEditing ? 'Edit product' : 'Add a product'}</h2>
        <button type="button" className="button button-ghost button-small" onClick={onCancel}>Back to merch</button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>Product name<input name="name" type="text" maxLength={80} required defaultValue={product?.name ?? ''} placeholder="e.g. Green bucket hat" /></label>
        <div className="admin-form-row">
          <label>Category
            <select name="category" required defaultValue={product?.category ?? ''}>
              <option value="" disabled>Choose a category</option>
              {productCategories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>Price (KSh)<input name="price" type="number" min="0" step="1" required defaultValue={product?.price ?? ''} placeholder="e.g. 500" /></label>
        </div>

        <fieldset className="size-picker">
          <legend>Sizes available <span className="admin-hint">Caps and hats usually use “One size”.</span></legend>
          <div className="size-options">
            {sizeOptions.map((option) => (
              <label key={option} className={`size-option${sizes.includes(option) ? ' is-active' : ''}`}>
                <input className="size-option-input" type="checkbox" checked={sizes.includes(option)} onChange={() => toggleSize(option)} />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label>Description<textarea name="description" rows={3} maxLength={1000} required defaultValue={product?.description ?? ''} /></label>
        <label>Features <span className="admin-hint">Optional. One per line, shown as a checklist.</span>
          <textarea name="details" rows={4} defaultValue={(product?.details ?? []).join('\n')} />
        </label>

        <div className="admin-field">
          <span className="admin-field-label">Photos <span className="admin-hint">Up to {MAX_PRODUCT_IMAGES}. The first photo is the main one. Photos on a plain white background look best.</span></span>
          {images.length > 0 && (
            <ul className="product-image-list">
              {images.map((image, index) => (
                <li key={`${index}-${image.src.slice(-24)}`} className="product-image-item">
                  <img src={resolveImage(image.src)} alt="" width="1000" height="1250" />
                  <select aria-label="Photo label" value={image.label} onChange={(event) => updateImage(index, { label: event.target.value })}>
                    {imageLabels.map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <div className="product-image-actions">
                    <button type="button" className="button button-ghost button-small" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label="Move photo earlier">←</button>
                    <button type="button" className="button button-ghost button-small" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} aria-label="Move photo later">→</button>
                    <button type="button" className="button button-ghost button-small" onClick={() => setImages((current) => current.filter((_, i) => i !== index))} aria-label="Remove photo"><Trash size={15} aria-hidden="true" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {images.length < MAX_PRODUCT_IMAGES && (
            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} aria-label="Add photos" />
          )}
          {imageError && <p className="form-status error" role="alert">{imageError}</p>}
        </div>

        <label className="admin-checkbox"><input className="admin-checkbox-input" name="available" type="checkbox" defaultChecked={product?.available ?? true} /> Show in the shop</label>

        <div className="dashboard-form-actions">
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}</button>
          <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        </div>
        <p className="form-status error" aria-live="polite">{error}</p>
      </form>
    </section>
  );
}

// Kenyan numbers like "0712 345 678" or "+254 712 345 678" → "254712345678" for WhatsApp links.
function whatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

const orderStatusLabel = (id) => orderStatuses.find((status) => status.id === id)?.label ?? id;

function OrdersManager({ orders, status, refresh }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState(null);
  // Status changes show instantly; the list is refreshed from the database in the background.
  const [statusOverrides, setStatusOverrides] = useState({});

  const statusOf = (order) => statusOverrides[order.id] ?? order.status;
  const visible = filter === 'all' ? orders : orders.filter((order) => statusOf(order) === filter);
  const selected = orders.find((order) => order.id === selectedId) ?? null;

  async function changeStatus(order, next) {
    const previous = statusOf(order);
    setStatusOverrides((current) => ({ ...current, [order.id]: next }));
    try {
      await setOrderStatus(order.id, next);
      refresh();
    } catch (statusError) {
      setStatusOverrides((current) => ({ ...current, [order.id]: previous }));
      setNotice({ type: 'error', text: describeError(statusError) });
    }
  }

  async function handleDelete(order) {
    try {
      await removeOrder(order.id);
      setSelectedId(null);
      setNotice({ type: 'success', text: `Deleted order ${order.reference}.` });
      await refresh();
    } catch (deleteError) {
      setNotice({ type: 'error', text: describeError(deleteError) });
    }
  }

  const itemCount = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subject = (order) => encodeURIComponent(`Your Mind Over Matter order ${order.reference}`);

  return (
    <section className="dashboard-card" aria-labelledby="orders-heading">
      <div className="dashboard-card-head">
        <div>
          <h2 id="orders-heading">Merch orders</h2>
          <p>Contact each buyer to confirm the price, payment, and pickup or delivery, then update the status.</p>
        </div>
        <div className="inbox-filters" role="group" aria-label="Show orders">
          {[{ id: 'all', label: 'All' }, ...orderStatuses].map(({ id, label }) => (
            <button key={id} type="button" className={`pill${filter === id ? ' is-active' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
      </div>
      <DashboardNotice notice={notice} />
      {status === 'loading' && <div className="archive-empty" role="status"><p>Loading orders…</p></div>}
      {status === 'error' && <div className="archive-empty" role="alert"><h3>We couldn’t load orders.</h3><p>Check the latest security rules are published, then refresh the page.</p></div>}
      {status === 'ready' && !visible.length && (
        <div className="archive-empty">
          <h3>{filter === 'all' ? 'No orders yet.' : `No ${orderStatusLabel(filter).toLowerCase()} orders.`}</h3>
          <p>Orders placed on the Merch page appear here.</p>
        </div>
      )}

      {visible.length > 0 && (
        <div className={`inbox${selected ? ' has-selection' : ''}`}>
          <ul className="inbox-list">
            {visible.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  className={`inbox-item${statusOf(order) === 'new' ? ' is-unread' : ''}${order.id === selectedId ? ' is-selected' : ''}`}
                  onClick={() => setSelectedId(order.id)}
                  aria-current={order.id === selectedId ? 'true' : undefined}
                >
                  <span className="inbox-item-top">
                    <strong className="inbox-item-name">{order.name}</strong>
                    <time dateTime={order.createdAt.toISOString()}>{shortDate.format(order.createdAt)}</time>
                  </span>
                  <span className="inbox-item-topic">
                    {statusOf(order) === 'new' && <span className="inbox-dot" aria-label="New" />}
                    {order.reference} · <span className={`order-status is-${statusOf(order)}`}>{orderStatusLabel(statusOf(order))}</span>
                  </span>
                  <span className="inbox-item-preview">
                    {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'}: {order.items.map((item) => item.name).join(', ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="inbox-reader">
            {selected ? (
              <article aria-labelledby="order-reader-heading">
                <button type="button" className="button button-ghost button-small inbox-back" onClick={() => setSelectedId(null)}>Back to orders</button>
                <span className="post-tag">{selected.reference}</span>
                <h3 id="order-reader-heading" className="inbox-reader-name">{selected.name}</h3>
                <p className="inbox-meta">
                  <span>{messageDateTime.format(selected.createdAt)}</span>
                  <span>{selected.delivery}</span>
                </p>

                <div className="order-contact">
                  <a className="button button-primary button-small" href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`}><Phone size={15} aria-hidden="true" /> Call {selected.phone}</a>
                  <a className="button button-ghost button-small" href={`https://wa.me/${whatsAppNumber(selected.phone)}`} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={15} aria-hidden="true" /> WhatsApp</a>
                  <a className="button button-ghost button-small" href={`mailto:${selected.email}?subject=${subject(selected)}`}><EnvelopeSimple size={15} aria-hidden="true" /> Email</a>
                </div>
                <p className="inbox-meta"><a className="inbox-meta-email" href={`mailto:${selected.email}`}>{selected.email}</a></p>

                <table className="order-items">
                  <thead><tr><th scope="col">Item</th><th scope="col">Size</th><th scope="col">Qty</th><th scope="col">Price</th></tr></thead>
                  <tbody>
                    {selected.items.map((item) => (
                      <tr key={`${item.productId}-${item.size}`}>
                        <td>{item.name}</td><td>{item.size}</td><td>{item.quantity}</td>
                        <td>{item.price === null ? '—' : formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr><th scope="row" colSpan={3}>Total</th><td>{selected.total === null ? 'To confirm' : formatPrice(selected.total)}</td></tr></tfoot>
                </table>

                {selected.note && <div className="inbox-body order-note"><strong>Note from buyer:</strong> {selected.note}</div>}

                <div className="dashboard-row-actions inbox-actions">
                  <label className="order-status-select">Status
                    <select className="order-status-dropdown" value={statusOf(selected)} onChange={(event) => changeStatus(selected, event.target.value)}>
                      {orderStatuses.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
                    </select>
                  </label>
                  <DeleteControl onDelete={() => handleDelete(selected)} />
                </div>
              </article>
            ) : (
              <div className="inbox-placeholder">
                <Package size={34} aria-hidden="true" />
                <p>Select an order to see the buyer’s details.</p>
              </div>
            )}
          </div>
        </div>
      )}
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

/* ---------- Merch shop ---------- */
// Pages: /merch (all products), /merch?product=<id> (one product), /merch?view=cart (cart and checkout).
// There is no online payment: an order is sent to the admin dashboard, and the committee contacts the buyer by
// phone or email to confirm the price, payment, and pickup or delivery.

const CART_STORAGE_KEY = 'mom-cart';
const MAX_QUANTITY = 10;
const CartContext = createContext(null);

function readStoredCart() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
    return Array.isArray(stored)
      ? stored.filter((item) => typeof item?.productId === 'string' && typeof item.size === 'string' && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

// Cart items are { productId, size, quantity }, remembered in the browser between visits.
function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private browsing); the cart still works for this visit.
    }
  }, [items]);

  const value = {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    add(productId, size, quantity) {
      setItems((current) => {
        const existing = current.find((item) => item.productId === productId && item.size === size);
        if (!existing) return [...current, { productId, size, quantity }];
        return current.map((item) => (item === existing
          ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) }
          : item));
      });
    },
    setQuantity(productId, size, quantity) {
      setItems((current) => current.map((item) => (item.productId === productId && item.size === size
        ? { ...item, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) }
        : item)));
    },
    remove(productId, size) {
      setItems((current) => current.filter((item) => !(item.productId === productId && item.size === size)));
    },
    clear() {
      setItems([]);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  return useContext(CartContext);
}

// Cart items joined with their product details and current price. Items whose product has since been removed
// (or hidden) from the shop are left out.
function useCartLines() {
  const { items } = useCart();
  const { shopProducts } = useProducts();
  return items.flatMap((item) => {
    const product = shopProducts.find((entry) => entry.id === item.productId);
    return product ? [{ ...item, product, name: product.name, price: product.price }] : [];
  });
}

function QuantityStepper({ value, onChange, label }) {
  return (
    <div className="quantity-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity"><Minus size={16} aria-hidden="true" /></button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QUANTITY} aria-label="Increase quantity"><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}

const orderSteps = [
  { icon: ShoppingBag, title: 'Choose your merch', text: 'Pick your items and sizes, then place your order with your phone number and email.' },
  { icon: HandCoins, title: 'We contact you', text: 'A committee member gets in touch to confirm the price, payment, and your order.' },
  { icon: Truck, title: 'Collect or receive it', text: 'Pick it up on campus or arrange delivery, whichever suits you.' },
];

function OrderSteps() {
  return (
    <ol className="order-steps">
      {orderSteps.map(({ icon: StepIcon, title, text }) => (
        <li key={title}>
          <span className="feature-icon"><StepIcon size={24} aria-hidden="true" /></span>
          <div><strong>{title}</strong><p>{text}</p></div>
        </li>
      ))}
    </ol>
  );
}

function ProductCard({ product }) {
  const [front, back] = product.images;
  return (
    <article className="product-card">
      <a href={`/merch?product=${product.id}`} className="product-card-link">
        <div className={`product-card-image${back ? ' has-back' : ''}`}>
          {/* The products are the page's main content, so their front photos load straight away. */}
          <img className="product-card-photo" src={resolveImage(front.src)} alt={`${product.name}, front`} width="1000" height="1250" decoding="async" />
          {back && <img className="product-card-photo product-card-back" src={resolveImage(back.src)} alt="" width="1000" height="1250" loading="lazy" decoding="async" />}
        </div>
        <div className="product-card-body">
          <span className="post-tag">{product.category}</span>
          <h3 className="product-card-title">{product.name}</h3>
          <p className="product-price">{formatPrice(product.price)}</p>
        </div>
      </a>
    </article>
  );
}

function MerchPage() {
  const { shopProducts, status } = useProducts();
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product');
  if (productId) {
    if (status === 'loading') {
      return <PageLayout pageClass="page-main"><section className="section"><div className="container"><div className="archive-empty" role="status"><p>Loading…</p></div></div></section></PageLayout>;
    }
    // Keyed by product so switching products starts with a fresh size and photo choice.
    return <ProductPage key={productId} product={shopProducts.find((product) => product.id === productId) ?? null} />;
  }
  if (params.get('view') === 'cart') return <CartPage />;
  return <ShopPage />;
}

function ShopPage() {
  const { shopProducts, status } = useProducts();
  const [category, setCategory] = useState('All');
  const categoryNames = ['All', ...new Set(shopProducts.map((product) => product.category))];
  const visible = category === 'All' ? shopProducts : shopProducts.filter((product) => product.category === category);

  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Merch" title="Wear the message." lede={`${merchTagline}. Every purchase supports Mind Over Matter’s programs for students.`} />
      <section className="section">
        <div className="container">
          <div className="shop-toolbar">
            <div className="filter-pills" role="group" aria-label="Filter merch">
              {categoryNames.map((name) => (
                <button key={name} type="button" className={`pill${category === name ? ' is-active' : ''}`} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>
              ))}
            </div>
            <CartSummaryLink />
          </div>
          {status === 'loading' && <div className="archive-empty" role="status"><p>Loading merch…</p></div>}
          {status === 'error' && <div className="archive-empty" role="alert"><h3>We couldn’t load the shop right now.</h3><p>Please check your connection and try again.</p></div>}
          {status === 'ready' && !shopProducts.length && <div className="archive-empty"><h3>New merch is on the way.</h3><p>Check back soon.</p></div>}
          <div className="product-grid">
            {visible.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>
      <section className="section alt-section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">How ordering works</p><h2>No online payment needed.</h2></div>
          <OrderSteps />
        </div>
      </section>
    </PageLayout>
  );
}

function CartSummaryLink() {
  const { count } = useCart();
  if (!count) return null;
  return (
    <a href="/merch?view=cart" className="button button-primary">
      <ShoppingBag size={17} aria-hidden="true" /> View cart ({count})
    </a>
  );
}

function ProductPage({ product }) {
  const { add } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (product) document.title = `${product.name} | Mind Over Matter merch`;
  }, [product]);

  if (!product) {
    return (
      <PageLayout pageClass="page-main">
        <PageHero eyebrow="Merch" title="We couldn’t find that item." lede="It may have been removed, or the link may be incorrect." />
        <section className="section"><div className="container"><a href="/merch" className="button button-primary">See all merch <ArrowRight size={17} aria-hidden="true" /></a></div></section>
      </PageLayout>
    );
  }

  function handleAdd() {
    if (!size) {
      setSizeError(true);
      return;
    }
    add(product.id, size, quantity);
    setAdded(true);
  }

  const image = product.images[imageIndex];
  return (
    <PageLayout pageClass="page-main">
      <section className="section product-section">
        <div className="container">
          <a href="/merch" className="text-link product-back"><ArrowLeft size={16} aria-hidden="true" /> All merch</a>
          <div className="product-layout">
            <div className="product-gallery">
              <div className="product-main-image">
                <img className="product-main-photo" src={resolveImage(image.src)} alt={`${product.name}, ${image.label.toLowerCase()}`} width="1000" height="1250" />
              </div>
              {product.images.length > 1 && (
                <div className="product-thumbs" role="group" aria-label="Product views">
                  {product.images.map((view, index) => (
                    <button key={view.label} type="button" className={`product-thumb${index === imageIndex ? ' is-active' : ''}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)}>
                      <img className="product-thumb-photo" src={resolveImage(view.src)} alt="" width="1000" height="1250" />
                      <span>{view.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-info">
              <span className="post-tag">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="product-price product-price-large">{formatPrice(product.price)}</p>
              <p className="product-description">{product.description}</p>

              <fieldset className="size-picker">
                <legend>Size {sizeError && <span className="size-error" role="alert">Please choose a size</span>}</legend>
                <div className="size-options">
                  {product.sizes.map((option) => (
                    <label key={option} className={`size-option${size === option ? ' is-active' : ''}`}>
                      <input className="size-option-input" type="radio" name="size" value={option} checked={size === option} onChange={() => { setSize(option); setSizeError(false); setAdded(false); }} />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="product-buy">
                <QuantityStepper value={quantity} onChange={(next) => { setQuantity(Math.max(1, Math.min(MAX_QUANTITY, next))); setAdded(false); }} label="Quantity" />
                <button type="button" className="button button-primary" onClick={handleAdd}><ShoppingBag size={17} aria-hidden="true" /> Add to cart</button>
              </div>
              {added && (
                <p className="dashboard-notice is-success product-added" role="status">
                  <CheckCircle size={18} aria-hidden="true" /> Added to your cart. <a href="/merch?view=cart" className="article-link">View cart and order</a>
                </p>
              )}

              <ul className="check-list check-list-compact product-details">
                {product.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
              <p className="admin-hint">No online payment: after you order, we contact you to confirm the price, payment, and pickup or delivery.</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function CartPage() {
  const cart = useCart();
  const lines = useCartLines();
  const total = orderTotal(lines);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    // Hidden spam trap, as on the contact form.
    if (values.website) {
      setConfirmation({ reference: '', name: values.name });
      return;
    }
    if (!isFirebaseConfigured) {
      setStatus({ type: 'error', text: `Ordering isn’t connected yet. Please email us at ${contact.email}.` });
      return;
    }
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const reference = await placeOrder({
        ...values,
        items: lines.map(({ productId, name, size, quantity, price }) => ({ productId, name, size, quantity, price })),
        total,
      });
      cart.clear();
      setConfirmation({ reference, name: values.name.trim().split(/\s+/)[0] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus({ type: 'error', text: `Sorry, your order couldn’t be sent. Please try again, or email us at ${contact.email}.` });
    } finally {
      setBusy(false);
    }
  }

  if (confirmation) {
    return (
      <PageLayout pageClass="page-main">
        <section className="section">
          <div className="container narrow-container order-confirmation">
            <span className="order-confirmation-icon"><CheckCircle size={44} aria-hidden="true" /></span>
            <p className="eyebrow">Order received</p>
            <h1>Thank you{confirmation.name ? `, ${confirmation.name}` : ''}!</h1>
            <p className="lede">A committee member will contact you by phone or email to confirm the price, payment, and pickup or delivery.</p>
            {confirmation.reference && <p className="order-reference">Your order reference: <strong>{confirmation.reference}</strong></p>}
            <div className="hero-actions"><a href="/merch" className="button button-ghost">Back to merch</a><a href="/" className="button button-primary">Go to the home page</a></div>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageClass="page-main">
      <PageHero eyebrow="Merch" title="Your cart." lede={lines.length ? 'Check your items, then send us your order. No payment is taken online.' : undefined} />
      <section className="section">
        <div className="container">
          {!lines.length ? (
            <div className="archive-empty">
              <h3>Your cart is empty.</h3>
              <p>Browse our hoodies and T-shirts to get started.</p>
              <a href="/merch" className="button button-primary cart-empty-button">Shop merch <ArrowRight size={17} aria-hidden="true" /></a>
            </div>
          ) : (
            <div className="cart-layout">
              <section className="dashboard-card" aria-labelledby="cart-items-heading">
                <h2 id="cart-items-heading" className="cart-heading">Items ({cart.count})</h2>
                <ul className="cart-list">
                  {lines.map((line) => (
                    <li key={`${line.productId}-${line.size}`} className="cart-line">
                      <a href={`/merch?product=${line.productId}`} className="cart-line-image"><img className="cart-line-photo" src={resolveImage(line.product.images[0].src)} alt="" width="1000" height="1250" /></a>
                      <div className="cart-line-info">
                        <a href={`/merch?product=${line.productId}`} className="cart-line-name">{line.name}</a>
                        <span>Size {line.size} · {formatPrice(line.price)}</span>
                        <div className="cart-line-actions">
                          <QuantityStepper value={line.quantity} onChange={(next) => cart.setQuantity(line.productId, line.size, next)} label={`Quantity of ${line.name}, size ${line.size}`} />
                          <button type="button" className="admin-link-button" onClick={() => cart.remove(line.productId, line.size)}>Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">
                  <span>Total</span>
                  <strong>{total === null ? 'Confirmed when we contact you' : formatPrice(total)}</strong>
                </div>
              </section>

              <section className="dashboard-card" aria-labelledby="checkout-heading">
                <h2 id="checkout-heading" className="cart-heading">Your details</h2>
                <form className="admin-form" onSubmit={handleSubmit}>
                  <label>Full name<input name="name" type="text" maxLength={100} autoComplete="name" required /></label>
                  <label>Phone number <span className="admin-hint">We’ll call or WhatsApp you about your order.</span>
                    <input name="phone" type="tel" inputMode="tel" maxLength={20} placeholder="e.g. 0712 345 678" autoComplete="tel" pattern="[+0-9 ()\-]{9,20}" required />
                  </label>
                  <label>Email<input name="email" type="email" maxLength={200} autoComplete="email" required /></label>
                  <label>How would you like to receive it?
                    <select name="delivery" defaultValue={deliveryOptions[0]} required>
                      {deliveryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>Anything else? <span className="admin-hint">Optional: questions, preferred pickup time, delivery area.</span>
                    <textarea name="note" rows={3} maxLength={1000} />
                  </label>
                  <label className="contact-trap" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
                  <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Sending order…' : 'Place order'}</button>
                  <p className="admin-hint">No payment is taken now. By ordering you agree to be contacted about it, as described in our <a className="article-link" href="/privacy">privacy policy</a>.</p>
                  <p className={`form-status ${status.type}`} aria-live="polite">{status.text}</p>
                </form>
              </section>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

const PROMO_PRODUCT_COUNT = 3;

// Home page section advertising the merch: the first products in the shop order (set in the dashboard).
function MerchPromo() {
  const { shopProducts } = useProducts();
  const featured = shopProducts.slice(0, PROMO_PRODUCT_COUNT);
  if (!featured.length) return null;
  return (
    <section className="section merch-promo-section">
      <div className="container">
        <div className="merch-promo">
          <div className="merch-promo-copy">
            <p className="eyebrow">New · Club merch</p>
            <h2>Wear the message.</h2>
            <p>Club merch carrying our motto, <em>{merchTagline}</em>. Every purchase supports our programs.</p>
            <a href="/merch" className="button button-light"><ShoppingBag size={17} aria-hidden="true" /> Shop merch</a>
          </div>
          <div className="merch-promo-products">
            {featured.map((product) => (
              <a key={product.id} href={`/merch?product=${product.id}`} className="merch-promo-item">
                <img className="merch-promo-photo" src={resolveImage(product.images[0].src)} alt={product.name} width="1000" height="1250" loading="lazy" decoding="async" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// A smaller merch banner for other pages.
function MerchBanner() {
  const { shopProducts } = useProducts();
  const product = shopProducts.find((entry) => entry.id === 'hoodie-green') ?? shopProducts[0];
  if (!product) return null;
  return (
    <section className="section section-compact">
      <div className="container">
        <aside className="merch-banner" aria-label="Club merch">
          <img className="merch-banner-photo" src={resolveImage(product.images[0].src)} alt="" width="1000" height="1250" loading="lazy" decoding="async" />
          <div>
            <h2>Rep the club at our next event.</h2>
            <p>Mind Over Matter merch is now available to order.</p>
          </div>
          <a href="/merch" className="button button-primary">Shop merch <ArrowRight size={17} aria-hidden="true" /></a>
        </aside>
      </div>
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
            <a href="/" className="button button-primary">Go to the home page <ArrowRight size={17} aria-hidden="true" /></a>
            <a href="/event" className="button button-ghost">Events & programs</a>
            <a href="/blog" className="button button-ghost">Blog</a>
            <a href="/contact-us" className="button button-ghost">Contact us</a>
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
          <p>To learn which pages are useful and how quickly the site loads, we use Vercel Web Analytics and Speed Insights. They count visits anonymously and in total (for example, page views, country, and device type), without cookies and without identifying you.</p>

          <h2>Why we collect it</h2>
          <p>We use your details only to read and reply to your message, for example to answer a question, share event details, or follow up on a partnership or merch order. We rely on your consent, which you give by sending the message.</p>

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
  'index': 'Mind Over Matter | Kenyatta University Mental Health Club',
  'event': 'Events & Programs | Mind Over Matter',
  'blog': 'Blog | Mind Over Matter',
  'article': 'Mind Over Matter | Article',
  'about-us': 'About Us | Mind Over Matter',
  'merch': 'Merch | Mind Over Matter',
  'contact-us': 'Contact Us | Mind Over Matter',
  'privacy': 'Privacy Policy | Mind Over Matter',
  'admin': 'Admin | Mind Over Matter',
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

// Keeps the admin dashboard out of the site statistics, so committee members' own visits don't count.
function skipAdminPages(event) {
  return event.url?.includes('/admin') ? null : event;
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
  const page = getPageName(route.pathname);
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
      const pageName = getPageName(url.pathname);
      if (url.origin !== window.location.origin || !Object.hasOwn(pageTitles, pageName)) return;

      // "/blog" and "/blog.html" (or "/" and "/index.html") are the same page.
      const isSamePage = pageName === getPageName(window.location.pathname);

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
    'index': HomePage,
    'event': EventsPage,
    'blog': ArchivePage,
    'article': ArticlePage,
    'about-us': AboutPage,
      'merch': MerchPage,
    'contact-us': ContactPage,
    'privacy': PrivacyPage,
    'admin': AdminPage,
  };
  const PageComponent = routes[page] ?? NotFoundPage;
  const content = <PageComponent />;

  return (
    <MotionConfig reducedMotion="user">
      {/* Every Phosphor icon on the site defaults to the two-tone style unless it sets its own weight. */}
      <IconContext.Provider value={ICON_DEFAULTS}>
        <SiteDataProvider>
          <CartProvider>
            <ErrorBoundary key={page}>{content}</ErrorBoundary>
          </CartProvider>
        </SiteDataProvider>
      </IconContext.Provider>
      {/* Vercel visitor and page-speed statistics (anonymous, no cookies). Admin visits are left out. */}
      <Analytics beforeSend={skipAdminPages} />
      <SpeedInsights route={`/${page}`} beforeSend={skipAdminPages} />
    </MotionConfig>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = import.meta.hot?.data.root ?? createRoot(rootElement);

  if (import.meta.hot) import.meta.hot.data.root = root;
  root.render(<App />);
}
