(function () {
  'use strict';

  var headerTarget = document.querySelector('[data-site-header]');
  var footerTarget = document.querySelector('[data-site-footer]');

  if (headerTarget) {
    headerTarget.outerHTML = `
<header class="header is-solid" data-solid>
  <div class="header__inner">
    <a href="index.html" class="logo"><img class="logo__mark" src="images/logo/snu_logo.png"
      alt="Seoul National University"><span>SDCL<small>SNU Chemistry</small></span></a>
    <nav class="nav" aria-label="Main menu">
      <div class="nav__item"><a class="nav__link" href="index.html" data-page="index.html">Home</a></div>
      <div class="nav__item"><a class="nav__link" href="about.html" data-page="about.html">Contact</a></div>
      <div class="nav__item"><a class="nav__link" href="members.html" data-page="members.html">Member</a><div
        class="nav__sub"><a href="members.html#professor">Professor</a><a
        href="members.html#postdocs">Members</a><a href="members.html#alumni">Alumni</a></div></div>
      <div class="nav__item"><a class="nav__link" href="research.html" data-page="research.html">Research</a><div
        class="nav__sub"><a href="research01.html">Self-Driving
        Laboratory</a><a href="research02.html">Inverse Design by AI</a><a href="research03.html">Catalyst Design</a><a
        href="research04.html">ReaxFF</a></div></div>
      <div class="nav__item"><a class="nav__link" href="publications.html"
        data-page="publications.html">Publication</a></div>
      <div class="nav__item"><a class="nav__link" href="news.html" data-page="news.html">Board</a><div
        class="nav__sub"><a href="news.html">News</a><a href="gallery.html">Gallery</a></div></div>
    </nav>
    <div class="header__cta"><a class="pill" href="index.html#join">Join us</a><button class="burger"
      aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button></div>
  </div>
</header>
<div class="mnav" id="mnav">
  <div class="mnav__group"><a class="mnav__head" href="about.html">Contact</a></div>
  <div class="mnav__group"><button class="mnav__head">Member <span class="plus">+</span></button><div
    class="mnav__list"><a href="members.html#professor">Professor</a><a
    href="members.html#postdocs">Members</a><a href="members.html#alumni">Alumni</a></div></div>
  <div class="mnav__group"><button class="mnav__head">Research <span class="plus">+</span></button><div
    class="mnav__list"><a href="research01.html">Self-Driving
    Laboratory</a><a href="research02.html">Inverse Design by AI</a><a href="research03.html">Catalyst Design</a><a
    href="research04.html">ReaxFF</a></div></div>
  <div class="mnav__group"><button class="mnav__head">Publication <span class="plus">+</span></button><div
    class="mnav__list"><a href="publications.html">All Publications</a></div></div>
  <div class="mnav__group"><button class="mnav__head">Board <span class="plus">+</span></button><div
    class="mnav__list"><a href="news.html">News</a><a href="gallery.html">Gallery</a></div></div>
  <p class="mnav__foot">SEOUL NATIONAL UNIVERSITY<br>DEPARTMENT OF CHEMISTRY</p>
</div>`;
  }

  if (footerTarget) {
    footerTarget.outerHTML = `
<footer class="footer"><div class="wrap">
  <div class="footer__top">
    <div><p class="footer__mark">Self-Driving Chemistry <em>Laboratory</em></p><p class="footer__addr">Department of
      Chemistry, Seoul National University<br>Building 503, 3F · Professor’s Office 322 · Student Office 330<br>Laboratories
      302 &amp; 303 · Tel. 02-880-6649</p></div>
    <div><h5>Menu</h5><div class="footer__links"><a href="about.html">Contact</a><a href="members.html">Members</a><a
      href="research.html">Research</a><a href="publications.html">Publication</a><a href="news.html">News</a><a
      href="gallery.html">Gallery</a></div></div>
    <div><h5>Links</h5><div class="footer__links"><a href="https://chem.snu.ac.kr" target="_blank" rel="noopener">Dept.
      of Chemistry ↗</a><a href="https://scholar.google.com/citations?user=TJYC22YAAAAJ&amp;hl=ko&amp;oi=ao"
      target="_blank" rel="noopener">Google Scholar ↗</a></div><a class="btn" href="index.html#join"
      style="margin-top:26px">Join us <span aria-hidden="true">→</span></a></div>
  </div>
  <div class="footer__bottom"><span>© 2026 Self-Driving Chemistry Laboratory, Seoul National University. All rights
    reserved.</span><span>Last updated 2026.08</span></div>
</div></footer>`;
  }
})();
