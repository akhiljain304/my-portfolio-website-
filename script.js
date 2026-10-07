/**
 * Akhil Jain - Personal Portfolio JavaScript
 * Functions:
 *  - Mobile hamburger menu toggle & auto-close
 *  - Active section observer for desktop sidebar and mobile nav
 *  - Smooth anchor link scrolling with header offset
 *  - One-click copy email button with clipboard fallback
// Immediately restore theme before paint to prevent flash of wrong theme
(function() {
  try {
    const saved = localStorage.getItem('akhil-portfolio-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initActiveSectionObserver();
  initEmailCopy();
  initSmoothScroll();
  initTaglineTyping();
  initScrollReveal();
});

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileNav() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburgerBtn || !mobileDrawer) return;

  function toggleMenu(forceClose = false) {
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isExpanded;

    hamburgerBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    hamburgerBtn.classList.toggle('is-active', shouldOpen);
    mobileDrawer.classList.toggle('open', shouldOpen);

    // Prevent background scrolling while menu is open
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking mobile navigation links
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  // Close if window is resized above mobile breakpoint (960px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && mobileDrawer.classList.contains('open')) {
      toggleMenu(true);
    }
  });

  // Close if clicked outside drawer
  document.addEventListener('click', (e) => {
    if (
      mobileDrawer.classList.contains('open') &&
      !mobileDrawer.contains(e.target) &&
      !hamburgerBtn.contains(e.target)
    ) {
      toggleMenu(true);
    }
  });
}

/**
 * Active Navigation Link Highlighter based on Scroll Position / IntersectionObserver
 */
function initActiveSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!sections.length) return;

  function setActiveLink(currentId) {
    // Desktop sidebar
    sidebarLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile nav links
    mobileLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Use IntersectionObserver if available
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id) {
            setActiveLink(id);
          }
        }
      });
    }, observerOptions);

    sections.forEach((sec) => observer.observe(sec));
  } else {
    // Fallback scroll listener
    window.addEventListener('scroll', () => {
      let currentSection = '';
      const scrollPos = window.scrollY + 180;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSection = section.getAttribute('id');
        }
      });

      if (currentSection) {
        setActiveLink(currentSection);
      }
    });
  }
}

/**
 * Copy Email to Clipboard with UI feedback
 */
function initEmailCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyText = document.getElementById('copyBtnText');
  const emailToCopy = 'akhil304@gmail.com';

  if (!copyBtn || !copyText) return;

  copyBtn.addEventListener('click', async () => {
    let copiedSuccessfully = false;

    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(emailToCopy);
        copiedSuccessfully = true;
      } catch (err) {
        copiedSuccessfully = fallbackCopyText(emailToCopy);
      }
    } else {
      copiedSuccessfully = fallbackCopyText(emailToCopy);
    }

    if (copiedSuccessfully) {
      const originalText = copyText.textContent;
      copyText.textContent = 'Copied to Clipboard!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyText.textContent = originalText;
        copyBtn.classList.remove('copied');
      }, 2400);
    }
  });

  // Fallback for file:// or unsecure contexts
  function fallbackCopyText(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Smooth Anchor Navigation
 */
function initSmoothScroll() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();

        // Calculate offset (especially on mobile with fixed header)
        const headerHeight = window.innerWidth <= 960 ? 76 : 20;
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          location.hash = targetId;
        }
      }
    });
  });
}

/**
 * Typing animation for hero tagline
 * Types prefix "B.Tech CSE Student", reveals divider "|",
 * and cycles dynamic focus phrases in terracotta starting with "Learning to Code".
 */
function initTaglineTyping() {
  const prefixEl = document.getElementById('taglinePrefix');
  const dividerEl = document.getElementById('taglineDivider');
  const focusEl = document.getElementById('taglineFocus');

  if (!prefixEl || !focusEl) return;

  const prefixText = 'B.Tech CSE Student';
  const phrases = [
    'Learning to Code',
    'Exploring AI Tools',
    'Building Web Projects',
    'Currently Learning C',
    '1st Year @ JECRC'
  ];

  // Set initial empty state for smooth animated entrance
  prefixEl.textContent = '';
  if (dividerEl) {
    dividerEl.style.opacity = '0';
  }
  focusEl.textContent = '';

  let prefixIndex = 0;

  // Step 1: Type prefix
  function typePrefix() {
    if (prefixIndex < prefixText.length) {
      prefixEl.textContent += prefixText.charAt(prefixIndex);
      prefixIndex++;
      setTimeout(typePrefix, 40);
    } else {
      // Reveal divider
      if (dividerEl) {
        dividerEl.style.opacity = '1';
      }
      setTimeout(() => {
        startFocusCycle();
      }, 180);
    }
  }

  // Step 2: Cycle focus phrases
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function startFocusCycle() {
    typeFocus();
  }

  function typeFocus() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      focusEl.textContent = currentPhrase.substring(0, charIndex);
    } else {
      charIndex++;
      focusEl.textContent = currentPhrase.substring(0, charIndex);
    }

    let delay = isDeleting ? 30 : 60;

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Completed phrase, pause for reading
      delay = 2400;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting, transition to next phrase
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 350;
    }

    setTimeout(typeFocus, delay);
  }

  // Start initial typing
  setTimeout(typePrefix, 300);
}

/**
 * Smooth Fade-Up Reveal Animation on Scroll for Cards
 */
function initScrollReveal() {
  const revealCards = document.querySelectorAll('.reveal-card');

  if (!revealCards.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve so animation plays cleanly once
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealCards.forEach((card) => {
      observer.observe(card);
    });
  } else {
    // Immediate fallback if IntersectionObserver is unsupported
    revealCards.forEach((card) => {
      card.classList.add('is-revealed');
    });
  }
}

/**
 * Dark / Light Theme Toggle Management
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleLabel = document.getElementById('themeToggleLabel');
  const mobileThemeBtn = document.getElementById('mobileThemeBtn');
  const root = document.documentElement;

  function updateUI(isDark) {
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-pressed', 'true');
        themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
      }
      if (themeToggleLabel) {
        themeToggleLabel.textContent = 'Light Theme';
      }
      if (mobileThemeBtn) {
        mobileThemeBtn.setAttribute('aria-label', 'Switch to light mode');
      }
    } else {
      root.removeAttribute('data-theme');
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-pressed', 'false');
        themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      }
      if (themeToggleLabel) {
        themeToggleLabel.textContent = 'Dark Theme';
      }
      if (mobileThemeBtn) {
        mobileThemeBtn.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    updateUI(isDark);
    try {
      localStorage.setItem('akhil-portfolio-theme', theme);
    } catch (e) {}
  }

  function toggle() {
    const isCurrentlyDark = root.getAttribute('data-theme') === 'dark';
    applyTheme(isCurrentlyDark ? 'light' : 'dark');
  }

  // Initial sync of UI state with currently active theme
  const isInitialDark = root.getAttribute('data-theme') === 'dark';
  updateUI(isInitialDark);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggle);
  }

  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', toggle);
  }

  // Listen to OS theme changes if user hasn't set explicit preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let saved = null;
      try {
        saved = localStorage.getItem('akhil-portfolio-theme');
      } catch (err) {}
      if (!saved) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}
