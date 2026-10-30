(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let hostObserver;
    let observedHost;
    const syncExtensionNotch = () => {
      const host = document.getElementById('flowwell-extension-root');
      if (host !== observedHost) {
        hostObserver?.disconnect();
        observedHost = host;
        if (host) {
          hostObserver = new MutationObserver(syncExtensionNotch);
          hostObserver.observe(host, { attributes: true, attributeFilter: ['data-flowwell-position', 'data-flowwell-visible'] });
        }
      }
      const visible = Boolean(host) && (host.dataset.flowwellVisible == null || host.dataset.flowwellVisible === 'true');
      const position = host?.dataset.flowwellPosition;
      document.body.classList.toggle('flowwell-notch-present', visible);
      document.body.classList.toggle('flowwell-notch-right', visible && position === 'right');
      document.body.classList.toggle('flowwell-notch-center', visible && position === 'center');
    };
    syncExtensionNotch();
    new MutationObserver(syncExtensionNotch).observe(document.documentElement, { childList: true });
  }
  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('open', open);
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
    }));
  }

  // Keep the current section visible in the primary navigation.
  if (navigation) {
    const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const markActive = (id) => navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (location.pathname === '/support' || location.pathname === '/support/') {
      navigation.querySelector('a[href="/support"]')?.setAttribute('aria-current', 'page');
    } else if ('IntersectionObserver' in window) {
      const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
      const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) markActive(visible.target.id);
      }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .1, .3, .6] });
      sections.forEach((section) => sectionObserver.observe(section));
      const initial = location.hash.slice(1);
      if (initial) markActive(initial);
    }
  }

  const states = {
    reminder: {
      title: 'A little stretch', subtitle: 'A SMALL CHECK-IN · NOW', overline: 'A SMALL CHECK-IN', greeting: 'Hey, glad you’re here.', category: '◌ &nbsp;MOVEMENT', time: 'NOW',
      reminder: 'A little stretch', prompt: 'A little moment whenever you’re ready.', action: 'Finish ✓', footer: '2 of 5 moments complete', expanded: true, focus: false,
    },
    focus: {
      title: 'A moment to focus', subtitle: '24:18 LEFT', overline: 'A POCKET OF FOCUS', greeting: 'One thing at a time.', category: '◌ &nbsp;FOCUS SESSION', time: 'IN PROGRESS',
      reminder: 'A moment to focus', prompt: '24:18', action: 'Pause', footer: '2 moments complete today', expanded: true, focus: true,
    },
    collapsed: {
      title: 'A little stretch', subtitle: 'A SMALL CHECK-IN · NOW', overline: 'A SMALL CHECK-IN', greeting: 'Hey, glad you’re here.', category: '◌ &nbsp;MOVEMENT', time: 'NOW',
      reminder: 'A little stretch', prompt: 'A little moment whenever you’re ready.', action: 'Finish ✓', footer: '2 of 5 moments complete', expanded: false, focus: false,
    },
  };
  const modeText = {
    friendly: ['A SMALL CHECK-IN', 'Hey, glad you’re here.', 'A little moment whenever you’re ready.'],
    gamified: ['A SMALL CHECK-IN', 'Keep your little world growing.', 'Complete this moment to grow your grove.'],
    workout: ['A SMALL CHECK-IN', 'Ready when you are.', 'A little exercise, at your pace.'],
  };
  let activeMode = 'friendly';
  let activeTheme = 'light';
  let activeState = 'reminder';
  const plannerShots = {
    friendly: {
      light: { src: '/screenshots/flowwell-friendly-planner.png?v=20261030-1030day', alt: 'FlowWell day planner in Friendly light mode, showing a weekly plan, daily summary, and routine list' },
      dark: { src: '/screenshots/flowwell-friendly-planner-dark.png?v=20261030-1030day', alt: 'FlowWell day planner in Friendly dark mode, showing a weekly plan, daily summary, and routine list' },
    },
    gamified: {
      light: { src: '/screenshots/flowwell-gamified-planner.png?v=20261030-1030day', alt: 'FlowWell day planner in Gamified light mode, showing a weekly plan, daily summary, and growth progress' },
      dark: { src: '/screenshots/flowwell-gamified-planner-dark.png?v=20261030-1030day', alt: 'FlowWell day planner in Gamified dark mode, showing a weekly plan, daily summary, and growth progress' },
    },
    workout: {
      light: { src: '/screenshots/flowwell-workout-planner.png?v=20261030-1030day', alt: 'FlowWell day planner in Workout light mode, showing a weekly plan, exercise summary, and routines' },
      dark: { src: '/screenshots/flowwell-workout-planner-dark.png?v=20261030-1030day', alt: 'FlowWell day planner in Workout dark mode, showing a weekly plan, exercise summary, and routines' },
    },
  };

  function setHeroMode(mode) {
    const image = document.querySelector('#planner-shot');
    const visual = image?.closest('.hero-visual');
    const shot = plannerShots[mode]?.[activeTheme];
    if (!image || !visual || !shot) return;
    activeMode = mode;
    visual.dataset.mode = mode;
    document.querySelectorAll('.shot-mode').forEach((button) => {
      const selected = button.dataset.shotMode === mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const label = document.querySelector('#shot-mode-name');
    if (label) label.textContent = `${mode[0].toUpperCase()}${mode.slice(1)} · ${activeTheme[0].toUpperCase()}${activeTheme.slice(1)}`;
    const openButton = document.querySelector('.product-shot-open');
    if (openButton) openButton.setAttribute('aria-label', `Enlarge ${mode} ${activeTheme} mode planner screenshot`);
    const lightboxImage = document.querySelector('#planner-shot-large');
    const lightbox = document.querySelector('#planner-lightbox');
    if (lightbox) lightbox.dataset.theme = activeTheme;
    if (lightboxImage) {
      lightboxImage.src = shot.src;
      lightboxImage.alt = shot.alt;
    }
    const lightboxCaption = document.querySelector('#shot-dialog-caption');
    if (lightboxCaption) lightboxCaption.textContent = `${label?.textContent || mode} mode · Original extension screenshot`;
    if (image.getAttribute('src') === shot.src) return;
    if (reducedMotion) {
      image.src = shot.src;
      image.alt = shot.alt;
      return;
    }
    image.classList.add('shot-changing');
    window.setTimeout(() => {
      const nextImage = new Image();
      nextImage.onload = () => {
        image.src = shot.src;
        image.alt = shot.alt;
        requestAnimationFrame(() => image.classList.remove('shot-changing'));
      };
      nextImage.onerror = () => image.classList.remove('shot-changing');
      nextImage.src = shot.src;
    }, 140);
  }

  function setHeroTheme(theme) {
    if (!plannerShots[activeMode]?.[theme]) return;
    activeTheme = theme;
    const visual = document.querySelector('.hero-visual');
    if (visual) visual.dataset.theme = theme;
    document.querySelectorAll('.shot-theme').forEach((button) => {
      const selected = button.dataset.shotTheme === theme;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    setHeroMode(activeMode);
  }


  function iconMarkup(name, mode = activeMode, size = 14) {
    const iconSet = window.FlowWellIcons;
    if (!iconSet) return '';
    const original = iconSet.icons[mode]?.[name] || iconSet.icons.ui[name];
    if (!original) return '';
    const svg = original.replace('<svg ', `<svg width="${size}" height="${size}" `);
    return `<span class="fw-product-icon" aria-hidden="true">${svg}</span>`;
  }

  function hydrateProductIcons() {
    document.querySelectorAll('.sequence-icon').forEach((node) => { node.innerHTML = iconMarkup(node.dataset.icon || 'custom', activeMode, 15); });
    document.querySelectorAll('.mood-mark').forEach((node) => { node.innerHTML = iconMarkup('mood', activeMode, 19); });
    document.querySelectorAll('.privacy-mark span').forEach((node) => { node.innerHTML = iconMarkup('mood', activeMode, 27); });
    document.querySelectorAll('.routine-icon').forEach((node) => {
      const activity = node.classList.contains('mint') ? 'hydration' : node.classList.contains('peach') ? 'meditation' : 'supplement';
      node.innerHTML = iconMarkup(activity, activeMode, 17);
    });
    document.querySelectorAll('.routine-list li span').forEach((node, index) => {
      node.innerHTML = iconMarkup(['meditation', 'workout', 'custom'][index] || 'custom', activeMode, 14);
    });
    document.querySelectorAll('.agenda-dot').forEach((node, index) => {
      node.className = 'agenda-product-icon';
      node.innerHTML = iconMarkup(index === 0 ? 'hydration' : 'focus', activeMode, 14);
    });
    document.querySelectorAll('.agenda-row strong').forEach((node) => { node.innerHTML = iconMarkup('check', activeMode, 13); });
    document.querySelectorAll('.summary-stats div').forEach((stat, index) => {
      const label = stat.querySelector('span');
      if (label) label.innerHTML = `${iconMarkup(['focus', 'workout', 'meditation'][index] || 'custom', activeMode, 13)} ${label.textContent.trim()}`;
    });
    document.querySelectorAll('.calendar-head span').forEach((node) => { node.innerHTML = `<i class="calendar-direction left">${iconMarkup('chevron', activeMode, 12)}</i><i class="calendar-direction right">${iconMarkup('chevron', activeMode, 12)}</i>`; });
    document.querySelectorAll('.back-link').forEach((node) => { node.innerHTML = `${iconMarkup('chevron', activeMode, 13)} Back to FlowWell`; node.classList.add('icon-back-link'); });
    const takeALook = document.querySelector('.hero-actions .text-link span');
    if (takeALook && takeALook.textContent.trim() === '↓') takeALook.innerHTML = iconMarkup('chevron', activeMode, 12);
    document.querySelectorAll('.chip-icon').forEach((node) => { node.innerHTML = iconMarkup('clock', activeMode, 16); });
    document.querySelectorAll('.chip-check').forEach((node) => { node.innerHTML = iconMarkup('check', activeMode, 15); });
    document.querySelectorAll('.routine-spark,.ticker i,.install-flower,.install-spark-field>span').forEach((node) => { node.innerHTML = iconMarkup('sparkle', activeMode, 18); });
    document.querySelectorAll('.plant-ornament').forEach((node) => { node.innerHTML = iconMarkup('mood', 'gamified', 30); });
    document.querySelectorAll('.faq-list summary span,.help-content summary span').forEach((node) => { node.innerHTML = iconMarkup('plus', activeMode, 14); });
    document.querySelectorAll('.routine-add').forEach((node) => { node.innerHTML = `${iconMarkup('plus', activeMode, 13)} &nbsp; Add a routine`; });
    document.querySelectorAll('.personality-check').forEach((node) => {
      const mode = node.closest('[data-personality]')?.dataset.personality || activeMode;
      if (mode === activeMode) node.closest('[data-personality]')?.classList.add('selected-personality');
      node.innerHTML = iconMarkup(node.closest('[data-personality]')?.classList.contains('selected-personality') ? 'check' : 'plus', mode, 12);
    });
    document.querySelectorAll('span').forEach((node) => {
      if (node.children.length === 0 && node.textContent.trim() === '↗') node.innerHTML = iconMarkup('arrow', activeMode, 12);
    });
  }

  function setNotchMode(mode) {
    activeMode = mode;
    setHeroMode(mode);
    document.querySelectorAll('.notch-demo').forEach((notch) => {
      notch.classList.remove('friendly', 'gamified', 'workout');
      notch.classList.add(mode);
      const logo = notch.querySelector('.notch-capsule img');
      if (logo) logo.src = `/icon/flowwell-${mode}.svg`;
    });
    applyState(activeState);
    hydrateProductIcons();
    document.querySelectorAll('[data-personality]').forEach((card) => {
      card.classList.toggle('selected-personality', card.dataset.personality === mode);
      const check = card.querySelector('.personality-check');
      if (check) check.innerHTML = iconMarkup(card.dataset.personality === mode ? 'check' : 'plus', card.dataset.personality, 12);
    });
  }

  function applyState(stateName) {
    activeState = stateName;
    const state = states[stateName];
    document.querySelectorAll('.notch-demo').forEach((notch) => {
      notch.classList.remove('state-enter');
      void notch.offsetWidth;
      notch.classList.add('state-enter');
      window.setTimeout(() => notch.classList.remove('state-enter'), 520);
    });
    document.querySelectorAll('.state-btn').forEach((button) => {
      const selected = button.dataset.state === stateName;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const mode = modeText[activeMode];
    document.querySelectorAll('.notch-demo').forEach((notch) => {
      const expanded = notch.querySelector('.notch-details');
      const capsule = notch.querySelector('.notch-capsule');
      notch.classList.toggle('collapsed', !state.expanded);
      notch.classList.toggle('focus-preview', state.focus);
      if (expanded) expanded.hidden = false;
      if (expanded) expanded.setAttribute('aria-hidden', String(!state.expanded));
      if (capsule) capsule.setAttribute('aria-expanded', String(state.expanded));
      setText(notch, '.notch-title b', state.title);
      setText(notch, '.notch-title small', state.subtitle);
      setText(notch, '.n-overline', state.overline);
      setText(notch, '.n-greeting', state.focus ? state.greeting : mode[1]);
      const categoryLabel = state.focus ? 'FOCUS SESSION' : (activeMode === 'workout' ? 'EXERCISE' : 'MOVEMENT');
      setHtml(notch, '.n-category', `${iconMarkup(state.focus ? 'focus' : 'workout', activeMode, 12)} <span>${categoryLabel}</span>`);
      setText(notch, '.n-time', state.time);
      setText(notch, '.n-reminder-title', state.reminder);
      setText(notch, '.n-prompt', state.focus ? state.prompt : (activeMode === 'friendly' ? state.prompt : mode[2]));
      setHtml(notch, '.n-actions span:first-child', state.action.includes('✓') ? `Finish ${iconMarkup('check', activeMode, 12)}` : state.action);
      setText(notch, '.notch-foot span', state.footer);
      setHtml(notch, '.notch-foot b', `Plan your day&nbsp; ${iconMarkup('arrow', activeMode, 12)}`);
      const chevron = notch.querySelector('.notch-chevron');
      if (chevron) chevron.innerHTML = iconMarkup('chevron', activeMode, 12);
      setText(notch, '.n-actions span:nth-child(2)', state.focus ? 'Finish session' : 'Skip');
    });
    const hero = document.querySelector('#notch-demo');
    if (hero) {
      const msg = state.focus ? 'A moment to focus' : 'A little stretch';
      hero.classList.toggle('collapsed', !state.expanded);
      hero.classList.toggle('focus-preview', state.focus);
      setText(hero, '#notch-title', msg);
      setText(hero, '#notch-subtitle', state.subtitle);
      setText(hero, '.notch-greeting b', state.focus ? state.greeting : mode[1]);
      setText(hero, '.reminder-preview>b', msg);
      setText(hero, '.reminder-preview p', state.focus ? state.prompt : mode[2]);
      setText(hero, '.notch-foot span', state.footer);
      setText(hero, '.reminder-meta span:last-child', state.time);
      setText(hero, '.notch-actions span:first-child', state.action);
      setText(hero, '.notch-actions span:nth-child(2)', state.focus ? 'Finish session' : 'Skip');
      const categoryLabel = state.focus ? 'FOCUS SESSION' : (activeMode === 'workout' ? 'EXERCISE' : 'MOVEMENT');
      setHtml(hero, '.reminder-meta span:first-child', `${iconMarkup(state.focus ? 'focus' : 'workout', activeMode, 12)} <span>${categoryLabel}</span>`);
      setHtml(hero, '.notch-actions span:first-child', state.action.includes('✓') ? `Finish ${iconMarkup('check', activeMode, 12)}` : state.action);
      setHtml(hero, '.notch-foot b', `Plan your day&nbsp; ${iconMarkup('arrow', activeMode, 12)}`);
      const chevron = hero.querySelector('.notch-chevron');
      if (chevron) chevron.innerHTML = iconMarkup('chevron', activeMode, 12);
    }
  }

  function setText(root, selector, value) {
    const node = root.querySelector(selector);
    if (node) node.textContent = value;
  }
  function setHtml(root, selector, value) {
    const node = root.querySelector(selector);
    if (node) node.innerHTML = value;
  }

  document.querySelectorAll('.state-btn').forEach((button) => button.addEventListener('click', () => applyState(button.dataset.state)));
  const plannerDialog = document.querySelector('#planner-lightbox');
  const plannerOpen = document.querySelector('.product-shot-open');
  if (plannerDialog && plannerOpen) {
    plannerOpen.addEventListener('click', () => plannerDialog.showModal());
    plannerDialog.querySelector('.shot-dialog-close')?.addEventListener('click', () => plannerDialog.close());
    plannerDialog.addEventListener('click', (event) => { if (event.target === plannerDialog) plannerDialog.close(); });
  }
  document.querySelectorAll('.shot-mode').forEach((button) => button.addEventListener('click', () => setNotchMode(button.dataset.shotMode)));
  document.querySelectorAll('.shot-theme').forEach((button) => button.addEventListener('click', () => setHeroTheme(button.dataset.shotTheme)));
  document.querySelectorAll('.personality-select').forEach((button) => button.addEventListener('click', () => {
    setNotchMode(button.dataset.mode);
    document.querySelector('#notch-demo')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    document.querySelector('.notch-section')?.classList.add('mode-previewed');
  }));
  document.querySelectorAll('.notch-capsule').forEach((button) => {
    if (button.closest('#interactive-notch')) button.addEventListener('click', () => {
      const notch = button.closest('.notch-demo');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      notch.classList.toggle('collapsed', isExpanded);
      button.setAttribute('aria-expanded', String(!isExpanded));
    });
  });
  hydrateProductIcons();
  applyState('reminder');
})();
