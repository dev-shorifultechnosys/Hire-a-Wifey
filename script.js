/* ========================================================================== 
   Hire a Wifey — Homepage interactions
   Vanilla JavaScript only. No framework and no third-party dependency.
   ========================================================================== */

(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const toast = document.getElementById('toast');
  const form = document.getElementById('enquiryForm');
  const formMessage = document.getElementById('formMessage');
  const enquiryType = document.getElementById('enquiryType');
  const faqMore = document.getElementById('faqMore');

  /* ------------------------------------------------------------------------
     Footer year + subtle sticky-header state
     ------------------------------------------------------------------------ */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* The persistent mobile CTA appears after the visitor has moved beyond the
     first hero actions. This keeps the opening screen uncluttered while still
     making booking available throughout the rest of the long landing page. */
  const mobileBook = document.querySelector('.mobile-book');
  const setMobileBookState = () => {
    if (!mobileBook) return;
    const shouldShow = window.innerWidth <= 680 && window.scrollY > 520;
    mobileBook.classList.toggle('is-visible', shouldShow);
  };

  setMobileBookState();
  window.addEventListener('scroll', setMobileBookState, { passive: true });
  window.addEventListener('resize', setMobileBookState);

  /* ------------------------------------------------------------------------
     Accessible mobile navigation
     ------------------------------------------------------------------------ */
  if (menuButton && mobileMenu) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
      body.style.overflow = '';
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.hidden = isOpen;
      body.style.overflow = isOpen ? '' : 'hidden';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ------------------------------------------------------------------------
     Prototype-only toast for booking / recruitment links.
     When the site is placed inside WordPress these URLs will resolve normally.
     ------------------------------------------------------------------------ */
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  };

  document.querySelectorAll('a[href="/booking/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (window.location.protocol === 'file:') {
        event.preventDefault();
        showToast('Booking CTA is ready to connect to the client’s Booking Page.');
      }
    });
  });

  document.querySelectorAll('a[href="/recruitment/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (window.location.protocol === 'file:') {
        event.preventDefault();
        showToast('Recruitment CTA is ready to connect to the Recruitment Page.');
      }
    });
  });

  /* ------------------------------------------------------------------------
     Build-your-visit checklist
     This is deliberately simple and illustrative — not a booking form.
     ------------------------------------------------------------------------ */
  const tasks = [...document.querySelectorAll('.task')];
  const taskCount = document.getElementById('taskCount');
  const taskProgress = document.getElementById('taskProgress');

  const updateTasks = () => {
    if (!tasks.length) return;

    const checked = tasks.filter((task) => task.querySelector('input').checked).length;

    tasks.forEach((task) => {
      const input = task.querySelector('input');
      task.classList.toggle('active', input.checked);
    });

    if (taskCount) taskCount.textContent = String(checked);
    if (taskProgress) taskProgress.style.width = `${(checked / tasks.length) * 100}%`;
  };

  tasks.forEach((task) => {
    task.querySelector('input').addEventListener('change', updateTasks);
  });
  updateTasks();

  /* ------------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.faq-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const expanded = button.getAttribute('aria-expanded') === 'true';

      item.classList.toggle('open', !expanded);
      button.setAttribute('aria-expanded', String(!expanded));
    });
  });

  /* Show the full set of brief-supplied FAQs only when the visitor asks for it. */
  if (faqMore) {
    faqMore.addEventListener('click', () => {
      const expanded = faqMore.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;

      document.querySelectorAll('.faq-extra').forEach((item) => {
        item.classList.toggle('is-revealed', nextState);
      });

      faqMore.setAttribute('aria-expanded', String(nextState));
      faqMore.textContent = nextState ? 'Show Fewer Questions' : 'Show All Questions';
    });
  }

  /* FAQ category filtering. If a category is selected we temporarily reveal
     all questions in that category so filtering never appears incomplete. */
  document.querySelectorAll('.faq-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.faq-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });

      const filter = tab.dataset.filter;
      const showAllQuestions = faqMore?.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-item').forEach((item) => {
        const categoryMatch = filter === 'all' || item.dataset.cat === filter;
        const isCore = item.dataset.priority === 'core';
        const shouldShow = categoryMatch && (filter !== 'all' || showAllQuestions || isCore);

        item.hidden = !shouldShow;

        if (filter !== 'all' && categoryMatch) {
          item.classList.add('is-revealed');
        } else if (filter === 'all' && !showAllQuestions && item.classList.contains('faq-extra')) {
          item.classList.remove('is-revealed');
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     NDIS / DVA enquiry links preselect the relevant enquiry type.
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-enquiry-type]').forEach((link) => {
    link.addEventListener('click', () => {
      const desired = link.dataset.enquiryType;
      if (!enquiryType) return;

      const matchingOption = [...enquiryType.options].find((option) => {
        return option.value === desired || option.text === desired;
      });

      if (matchingOption) enquiryType.value = matchingOption.value;
    });
  });

  /* ------------------------------------------------------------------------
     Front-end form demo validation.
     Replace this submit handler with the WordPress form action later.
     ------------------------------------------------------------------------ */
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      formMessage.className = 'form-message';
      formMessage.textContent = '';

      const requiredFields = [...form.querySelectorAll('[required]')];
      let firstInvalid = null;

      requiredFields.forEach((field) => {
        const invalid = !field.value.trim();
        field.classList.toggle('invalid', invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      const email = form.querySelector('input[type="email"]');
      if (email && email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
        email.classList.add('invalid');
        if (!firstInvalid) firstInvalid = email;
      }

      if (firstInvalid) {
        formMessage.classList.add('error');
        formMessage.textContent = 'Please complete the required fields before sending your enquiry.';
        firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      const subject = encodeURIComponent('Hire a Wifey website enquiry — ' + (data.get('name') || 'Website visitor'));
      const body = encodeURIComponent(
        'Name: ' + (data.get('name') || '') + '\n' +
        'Mobile: ' + (data.get('phone') || '') + '\n' +
        'Email: ' + (data.get('email') || '') + '\n' +
        'Suburb: ' + (data.get('suburb') || '') + '\n' +
        'Enquiry: ' + (data.get('type') || '') + '\n' +
        'Preferred contact: ' + (data.get('contact') || '') + '\n\n' +
        'Message:\n' + (data.get('message') || '')
      );
      formMessage.classList.add('success');
      formMessage.textContent = 'Your email app is opening with the enquiry details. The WordPress version sends this form directly through the website.';
      window.location.href = 'mailto:admin@hireawifeyaustralia.com.au?subject=' + subject + '&body=' + body;
    });

    form.querySelectorAll('input,select,textarea').forEach((field) => {
      field.addEventListener('input', () => field.classList.remove('invalid'));
      field.addEventListener('change', () => field.classList.remove('invalid'));
    });
  }



  /* ------------------------------------------------------------------------
     Footer social placeholders + lightweight message helper
     These stay dependency-free for the static contest prototype. Replace the
     placeholder social URLs with the client's real profiles at handoff.
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-social-placeholder]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast(`${link.dataset.socialPlaceholder} link is ready to connect at handoff.`);
    });
  });

  /* Native details/summary powers the message helper, so it still works even
     when a cache/minifier delays JavaScript. JS only closes it after choosing
     the enquiry anchor or after clicking elsewhere. */
  const liveMessage = document.getElementById('liveMessage');
  const liveEnquiryLink = document.querySelector('.live-enquiry-link');

  if (liveMessage && liveMessage.tagName.toLowerCase() === 'details') {
    if (liveEnquiryLink) {
      liveEnquiryLink.addEventListener('click', function () {
        liveMessage.removeAttribute('open');
      });
    }
    document.addEventListener('click', function (event) {
      if (!liveMessage.hasAttribute('open')) return;
      if (!liveMessage.contains(event.target)) liveMessage.removeAttribute('open');
    });
  }

  /* ------------------------------------------------------------------------
     Lightweight reveal animation. Content remains visible when motion is
     reduced or IntersectionObserver is unavailable.
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
