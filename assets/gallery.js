(function () {
  'use strict';

  var container = document.getElementById('gallery-list');
  var lightbox = document.querySelector('.lightbox');
  if (!container) return;

  var events = [];
  var eventIndex = 0;
  var imageIndex = 0;
  var imageBox = lightbox && lightbox.querySelector('[data-lb-image]');
  var titleBox = lightbox && lightbox.querySelector('[data-lb-title]');
  var captionBox = lightbox && lightbox.querySelector('[data-lb-cap]');
  var dateBox = lightbox && lightbox.querySelector('[data-lb-date]');
  var counterBox = lightbox && lightbox.querySelector('[data-lb-counter]');
  var previousButton = lightbox && lightbox.querySelector('.lightbox__nav--prev');
  var nextButton = lightbox && lightbox.querySelector('.lightbox__nav--next');

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function titleParts(title) {
    var bracketed = String(title || '').match(/^\s*\[([^\]]+)\]\s*(.*)$/);
    if (bracketed) {
      var dateMatch = bracketed[1].match(/^(\d{4})[. -](\d{1,2})$/);
      var date = dateMatch ? dateMatch[1] + ('0' + dateMatch[2]).slice(-2) : bracketed[1];
      return { date: date, title: bracketed[2] };
    }
    var year = String(title || '').match(/^(\d{4})\s+(.*)$/);
    return year ? { date: year[1], title: year[2] } : { date: '', title: title || '' };
  }

  function imageUrl(path) {
    return 'images/gallery/' + path.split('/').map(encodeURIComponent).join('/');
  }

  function card(event, index) {
    var parts = titleParts(event.title);
    var count = event.images.length;
    var opening = lightbox
      ? '<button class="gitem" type="button" data-gallery-index="' + index + '"'
      : '<a class="gitem" href="gallery.html"';
    var closing = lightbox ? '</button>' : '</a>';
    return opening + ' aria-label="Open gallery: ' + escapeHtml(parts.title) + '">' +
      '<span class="gitem__media">' +
        '<img src="' + imageUrl(event.images[0]) + '" alt="' + escapeHtml(parts.title) + '" loading="lazy">' +
        '<span class="gitem__count">' + count + (count === 1 ? ' photo' : ' photos') + '</span>' +
      '</span>' +
      '<span class="gitem__date">' + escapeHtml(parts.date) + '</span>' +
      '<span class="gitem__title">' + escapeHtml(parts.title) + '</span>' +
      '<span class="gitem__cap">View event photos</span>' +
    closing;
  }

  function showImage() {
    var event = events[eventIndex];
    var parts = titleParts(event.title);
    var count = event.images.length;
    imageBox.innerHTML = '<img src="' + imageUrl(event.images[imageIndex]) + '" alt="' +
      escapeHtml(parts.title + ' photo ' + (imageIndex + 1)) + '">';
    titleBox.textContent = parts.title;
    captionBox.textContent = count + (count === 1 ? ' photo' : ' photos');
    dateBox.textContent = parts.date;
    counterBox.textContent = (imageIndex + 1) + ' / ' + count;
    previousButton.hidden = count < 2;
    nextButton.hidden = count < 2;
  }

  function openEvent(index) {
    eventIndex = index;
    imageIndex = 0;
    showImage();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function move(direction) {
    var count = events[eventIndex].images.length;
    imageIndex = (imageIndex + direction + count) % count;
    showImage();
  }

  if (lightbox) {
    container.addEventListener('click', function (event) {
      var cardElement = event.target.closest('[data-gallery-index]');
      if (cardElement) openEvent(Number(cardElement.dataset.galleryIndex));
    });
    previousButton.addEventListener('click', function (event) {
      event.stopPropagation();
      move(-1);
    });
    nextButton.addEventListener('click', function (event) {
      event.stopPropagation();
      move(1);
    });
    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });
  }

  function render(data) {
    events = (data.events || []).slice().reverse();
    var limit = parseInt(container.getAttribute('data-gallery-limit'), 10);
    if (limit > 0) events = events.slice(0, limit);
    if (!events.length) return;
    container.classList.remove('gallery--empty');
    container.innerHTML = events.map(card).join('');
  }

  if (window.GALLERY_EVENTS) {
    render(window.GALLERY_EVENTS);
  } else {
    fetch('gallery.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(render)
      .catch(function () {
        container.innerHTML = '<p class="gallery__error">Gallery could not be loaded.</p>';
      });
  }
})();
