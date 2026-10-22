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
  let activeState = 'reminder';

  function iconMarkup(name, mode = activeMode, size = 14) {
    const iconSet = window.FlowWellIcons;
    if (!iconSet) return '';
    const original = iconSet.icons[mode]?.[name] || iconSet.icons.ui[name];
    if (!original) return '';
    const svg = original.replace('<svg ', `<svg width="${size}" height="${size}" `);
    return `<span class="fw-product-icon" aria-hidden="true">${svg}</span>`;
  }

  function hydrateProductIcons() {
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
    document.querySelectorAll('.routine-spark,.ticker i,.install-flower').forEach((node) => { node.innerHTML = iconMarkup('sparkle', activeMode, 18); });
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
      if (state.focus) {
        setText(notch, '.n-actions span:nth-child(2)', 'Finish session');
        const third = notch.querySelector('.n-actions span:nth-child(3)');
        if (third) third.hidden = true;
      } else {
        setText(notch, '.n-actions span:nth-child(2)', '15m');
        const third = notch.querySelector('.n-actions span:nth-child(3)');
        if (third) third.hidden = false;
      }
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
