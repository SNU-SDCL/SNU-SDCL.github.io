/* ══════════════════════════════════════════════════════════════
   Lab Website — 공통 스크립트
   (헤더 / 모바일 메뉴 / 스크롤 등장 / 갤러리 라이트박스 / 논문 필터)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. 헤더: 스크롤하면 배경이 생김 ───────────────────── */
  var header = document.querySelector('.header');
  var progress = document.querySelector('.progress');
  // 메인이 아닌 페이지는 처음부터 solid
  var alwaysSolid = header && header.hasAttribute('data-solid');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-solid', alwaysSolid || y > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── 2. 모바일 메뉴 ─────────────────────────────────────── */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');

  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('is-open');
      document.documentElement.classList.toggle('is-menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', String(open));
      if (open && header) header.classList.add('is-solid');
      else onScroll();
    });

    // 아코디언
    mnav.querySelectorAll('.mnav__head').forEach(function (head) {
      head.addEventListener('click', function () {
        var group = head.closest('.mnav__group');
        var isOpen = group.classList.contains('is-open');
        mnav.querySelectorAll('.mnav__group').forEach(function (g) {
          g.classList.remove('is-open');
        });
        if (!isOpen) group.classList.add('is-open');
      });
    });

    // 링크를 누르면 닫기
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('.mnav__list a')) {
        mnav.classList.remove('is-open');
        document.documentElement.classList.remove('is-menu-open');
        document.body.style.overflow = '';
        onScroll();
      }
    });
  }

  // ESC 로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (mnav && mnav.classList.contains('is-open')) {
      mnav.classList.remove('is-open');
      document.documentElement.classList.remove('is-menu-open');
      document.body.style.overflow = '';
      onScroll();
    }
    closeLightbox();
  });

  /* ── 3. 스크롤 등장 ─────────────────────────────────────── */
  var rvItems = document.querySelectorAll('[data-rv]');
  if (reduce || !('IntersectionObserver' in window)) {
    rvItems.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    rvItems.forEach(function (el) {
      // 같은 부모 안에서 순서대로 살짝 지연시켜 계단식으로 등장
      var delay = parseInt(el.getAttribute('data-rv'), 10);
      if (!isNaN(delay)) el.style.transitionDelay = delay + 'ms';
      io.observe(el);
    });
  }

  /* ── 4. 갤러리 라이트박스 ───────────────────────────────── */
  var lightbox = document.querySelector('.lightbox');

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (lightbox) {
    var lbFrame = lightbox.querySelector('.lightbox__frame');
    var lbTitle = lightbox.querySelector('[data-lb-title]');
    var lbCap = lightbox.querySelector('[data-lb-cap]');
    var lbDate = lightbox.querySelector('[data-lb-date]');

    document.querySelectorAll('.gitem').forEach(function (item) {
      item.addEventListener('click', function () {
        var media = item.querySelector('.gitem__media > *');
        lbFrame.innerHTML = '';
        if (media) lbFrame.appendChild(media.cloneNode(true));
        if (lbTitle) lbTitle.textContent = item.dataset.title || '';
        if (lbCap) lbCap.textContent = item.dataset.cap || '';
        if (lbDate) lbDate.textContent = item.dataset.date || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('.lightbox__close')) closeLightbox();
    });
  }

  /* ── 5. 논문 연도 필터 ──────────────────────────────────── */
  var filterBar = document.querySelector('.filters');
  if (filterBar && !filterBar.hasAttribute('data-dynamic')) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      var key = btn.dataset.filter;
      document.querySelectorAll('.pub').forEach(function (row) {
        var show = key === 'all' || row.dataset.year === key;
        row.style.display = show ? '' : 'none';
      });
    });
  }

  /* ── 6. 현재 메뉴 표시 ──────────────────────────────────── */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link[data-page]').forEach(function (a) {
    var isResearchDetail = /^research0[1-4]\.html$/.test(here) && a.dataset.page === 'research.html';
    var isBoardPage = here === 'gallery.html' && a.dataset.page === 'news.html';
    if (a.dataset.page === here || isResearchDetail || isBoardPage) a.classList.add('is-active');
  });
})();
