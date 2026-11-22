/* =========================================================
   devToolsCusco — main.js
   Contrato con el HTML (IDs, data-*, clases): ver metas.md → “Notas de auditoría 1.1”.
   Módulos:
     1. Menú móvil con transición
     2. Header inteligente (oculta al bajar, aparece al subir)
     3. Sombra del header al hacer scroll
     4. Año dinámico en footer
     5. Contadores animados (sección Impacto)
     6. Reveal on scroll (IntersectionObserver)
     7. Tarjetas con tilt + cursor spotlight
     8. Back-to-top flotante
     9. Scroll suave con compensación de navbar + active link
   Todo respeta `prefers-reduced-motion`.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. MENÚ MÓVIL con transición
     ========================================================= */
  const toggleBtn  = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('icon-open');
  const iconClose  = document.getElementById('icon-close');

  if (toggleBtn && mobileMenu) {
    const openMenu = () => {
      mobileMenu.classList.remove('hidden');
      // Fuerza un reflow para que la transición se dispare
      void mobileMenu.offsetHeight;
      mobileMenu.classList.add('is-open');
      document.getElementById('site-header')?.classList.add('is-menu-open');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Cerrar menú');
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      document.getElementById('site-header')?.classList.remove('is-menu-open');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Abrir menú');

      // Aplica display:none cuando termina la transición. Se usa setTimeout (y no
      // transitionend) para que también funcione con prefers-reduced-motion.
      setTimeout(() => {
        if (!mobileMenu.classList.contains('is-open')) mobileMenu.classList.add('hidden');
      }, prefersReduced ? 0 : 360);
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Cierra menú si se redimensiona a desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && mobileMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Cierra con la tecla Esc y devuelve el foco al botón
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });

    // Cierra al tocar/hacer clic fuera del header
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('is-open') && !e.target.closest('#site-header')) {
        closeMenu();
      }
    });
  }

  /* =========================================================
     2 + 3. HEADER INTELIGENTE + SOMBRA
     ========================================================= */
  const header = document.getElementById('site-header');
  if (header) {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      // Sombra suave tras 8px
      header.classList.toggle('is-scrolled', y > 8);

      // Ocultar al bajar (pasado 200px), mostrar al subir — nunca con el menú móvil abierto (A4)
      const menuOpen = mobileMenu && mobileMenu.classList.contains('is-open');
      if (y > lastScrollY && y > 200 && !menuOpen && !header.querySelector(':focus-visible')) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }

      lastScrollY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Si un enlace del header recibe foco con Tab estando oculto, se vuelve a mostrar
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  }

  /* =========================================================
     4. AÑO DINÁMICO
     ========================================================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
    /* =========================================================
     5. CONTADORES ANIMADOS
     ========================================================= */
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target   = parseInt(el.dataset.count, 10);
      const suffix   = el.dataset.suffix || '';
      const duration = 1600;
      const start    = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      counters.forEach((el) => {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
    } else {
      // El HTML trae el valor final (para quien no tenga JS); aquí se reinicia a 0 para animarlo
      counters.forEach((el) => { el.textContent = '0'; });

      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  /* =========================================================
     6. REVEAL ON SCROLL
     ========================================================= */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || '0', 10);
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* =========================================================
     7. TILT 3D + CURSOR SPOTLIGHT
     ========================================================= */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  if (tiltCards.length && !prefersReduced && window.matchMedia('(hover: hover)').matches) {
    const MAX_TILT = 4; // grados (sutil: las tarjetas son grandes)

    tiltCards.forEach((card) => {
      let rafId = null;

      const handleMove = (e) => {
        // No inclinar tarjetas que aún no se han revelado (siguen con opacity 0)
        if (card.hasAttribute('data-reveal') && !card.classList.contains('is-visible')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normaliza a -0.5 ... 0.5
        const px = (x / rect.width) - 0.5;
        const py = (y / rect.height) - 0.5;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          // translateY(-4px) = "lift" al hacer hover (antes lo hacía hover:-translate-y-1 de Tailwind y chocaba con este transform)
          card.style.transform =
            `perspective(900px) translateY(-4px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg)`;
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
        });
      };

      const handleEnter = () => card.classList.add('is-hovered');
      const handleLeave = () => {
        card.classList.remove('is-hovered');
        card.style.transform = '';
        if (rafId) cancelAnimationFrame(rafId);
      };

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mouseleave', handleLeave);
    });
  }
    /* =========================================================
     8. BACK TO TOP
     ========================================================= */
  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
      // El botón se oculta al llegar arriba: movemos el foco al logo para no perderlo
      document.querySelector('#site-header a')?.focus({ preventScroll: true });
    });
  }

  /* =========================================================
     9. SCROLL SUAVE + COMPENSACIÓN NAVBAR + ACTIVE LINK
     ========================================================= */
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const navbarHeight = header ? header.offsetHeight : 0;

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '') return;
    // El skip-link usa el salto nativo para que el foco del teclado siga al destino
    if (link.classList.contains('ds-skip-link')) return;

    link.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight + 1;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  // Enlace activo: solo los enlaces del header (desktop + móvil), no CTAs ni footer (corrige A3)
  const headerLinks = document.querySelectorAll('#site-header a[href^="#"]');

  if (headerLinks.length && 'IntersectionObserver' in window) {
    const sectionMap = new Map();
    headerLinks.forEach((link) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#') || id === '#') return;
      const section = document.querySelector(id);
      if (section) {
        if (!sectionMap.has(section)) sectionMap.set(section, []);
        sectionMap.get(section).push(link);
      }
    });

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const links = sectionMap.get(entry.target);
          if (!links) return;
          links.forEach((link) => {
            if (entry.isIntersecting) {
              link.classList.add('is-active');
              link.setAttribute('aria-current', 'true');
            } else {
              link.classList.remove('is-active');
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: `-${navbarHeight + 20}px 0px -60% 0px`, threshold: 0 }
    );

    sectionMap.forEach((_, section) => activeObserver.observe(section));
  }

}); // ← cierre del DOMContentLoaded