(function () {
  'use strict';

  var container = document.getElementById('gallery-list');
  var lightbox = document.querySelector('.lightbox');
  if (!container) return;

  var events = [];
  var pagination = document.getElementById('gallery-pagination');
  var pageSize = 9;
  var currentPage = 1;
  var eventIndex = 0;
  var imageIndex = 0;
  var imageBox = lightbox && lightbox.querySelector('[data-lb-image]');
  var titleBox = lightbox && lightbox.querySelector('[data-lb-title]');
  var captionBox = lightbox && lightbox.querySelector('[data-lb-cap]');
  var dateBox = lightbox && lightbox.querySelector('[data-lb-date]');
  var counterBox = lightbox && lightbox.querySelector('[data-lb-counter]');
  var previousButton = lightbox && lightbox.querySelector('.lightbox__nav--prev');
  var nextButton = lightbox && lightbox.querySelector('.lightbox__nav--next');
  var heicWorker = null;
  var heicTimeout = null;

  function stopHeic() {
    if (heicWorker) heicWorker.terminate();
    heicWorker = null;
    clearTimeout(heicTimeout);
  }

  function stopMedia() {
    stopHeic();
    var video = imageBox && imageBox.querySelector('video');
    if (video) video.pause();
  }

  function isVideo(path) {
    return /\.mp4$/i.test(path);
  }

  function mediaCount(event) {
    var videos = event.images.filter(isVideo).length;
    var photos = event.images.length - videos;
    var counts = [];
    if (photos) counts.push(photos + (photos === 1 ? ' photo' : ' photos'));
    if (videos) counts.push(videos + (videos === 1 ? ' video' : ' videos'));
    return counts.join(' · ');
  }

  function unavailable(url) {
    imageBox.innerHTML = '<div class="lightbox__unavailable"><p>This media could not be previewed.</p>' +
      '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">Open original file</a></div>';
  }

  function showHeic(url, label) {
    imageBox.innerHTML = '<div class="lightbox__unavailable" role="status">Loading photo…</div>';
    var worker;
    function failed() {
      if (heicWorker !== worker) return;
      stopHeic();
      unavailable(url);
    }
    try {
      worker = new Worker('assets/heic-worker.js?v=20261105-1');
      heicWorker = worker;
      worker.onmessage = function (event) {
        if (heicWorker !== worker) return;
        if (event.data.error) return failed();
        try {
          var canvas = document.createElement('canvas');
          canvas.width = event.data.width;
          canvas.height = event.data.height;
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', label);
          canvas.getContext('2d').putImageData(new ImageData(event.data.pixels, canvas.width, canvas.height), 0, 0);
          imageBox.replaceChildren(canvas);
          stopHeic();
        } catch (error) { failed(); }
      };
      worker.onerror = failed;
      heicTimeout = setTimeout(failed, 30000);
      worker.postMessage({ url: new URL(url, document.baseURI).href });
    } catch (error) {
      stopHeic();
      unavailable(url);
    }
  }

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
    return 'images/gallery/' + path.normalize('NFC').split('/').map(encodeURIComponent).join('/');
  }

  function card(event, index) {
    var parts = titleParts(event.title);
    var opening = lightbox
      ? '<button class="gitem" type="button" data-gallery-index="' + index + '"'
      : '<a class="gitem" href="gallery.html"';
    var closing = lightbox ? '</button>' : '</a>';
    return opening + ' aria-label="Open gallery: ' + escapeHtml(parts.title) + '">' +
      '<span class="gitem__media">' +
        '<img src="' + imageUrl(event.images[0]) + '" alt="' + escapeHtml(parts.title) + '" loading="lazy">' +
        '<span class="gitem__count">' + mediaCount(event) + '</span>' +
      '</span>' +
      '<span class="gitem__date">' + escapeHtml(parts.date) + '</span>' +
      '<span class="gitem__title">' + escapeHtml(parts.title) + '</span>' +
      '<span class="gitem__cap">View event photos' + (event.images.some(isVideo) ? ' and videos' : '') + '</span>' +
    closing;
  }

  function showImage() {
    stopMedia();
    var event = events[eventIndex];
    var parts = titleParts(event.title);
    var count = event.images.length;
    var url = imageUrl(event.images[imageIndex]);
    var label = parts.title + (isVideo(event.images[imageIndex]) ? ' video ' : ' photo ') + (imageIndex + 1);
    if (isVideo(event.images[imageIndex])) {
      var video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', label);
      video.onerror = function () {
        if (video.parentNode === imageBox) unavailable(url);
      };
      imageBox.replaceChildren(video);
      video.src = url;
    } else if (/\.(heic|heif)$/i.test(event.images[imageIndex])) {
      showHeic(url, label);
    } else {
      var img = document.createElement('img');
      img.alt = label;
      img.onerror = function () {
        if (img.parentNode === imageBox) unavailable(url);
      };
      imageBox.replaceChildren(img);
      img.src = url;
    }
    titleBox.textContent = parts.title;
    captionBox.textContent = mediaCount(event);
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
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox || event.target.closest('.lightbox__close')) stopMedia();
    });
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
      if (event.key === 'Escape') stopMedia();
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });
  }

  function renderPage() {
    var start = pagination ? (currentPage - 1) * pageSize : 0;
    var pageEvents = pagination ? events.slice(start, start + pageSize) : events;
    container.innerHTML = pageEvents.map(function (event, index) {
      return card(event, start + index);
    }).join('');
    if (!pagination) return;
    var totalPages = Math.ceil(events.length / pageSize);
    pagination.hidden = totalPages <= 1;
    var buttons = '<button type="button" data-page="' + (currentPage - 1) + '"' +
      (currentPage === 1 ? ' disabled' : '') + ' aria-label="Previous page">←</button>';
    for (var page = 1; page <= totalPages; page++) {
      buttons += '<button type="button" data-page="' + page + '" aria-label="Page ' + page + '"' +
        (page === currentPage ? ' class="is-active" aria-current="page"' : '') + '>' + page + '</button>';
    }
    buttons += '<button type="button" data-page="' + (currentPage + 1) + '"' +
      (currentPage === totalPages ? ' disabled' : '') + ' aria-label="Next page">→</button>';
    pagination.innerHTML = buttons;
  }

  if (pagination) {
    pagination.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      var page = Number(button.dataset.page);
      if (page === currentPage || page < 1 || page > Math.ceil(events.length / pageSize)) return;
      currentPage = page;
      renderPage();
      container.focus({ preventScroll: true });
      container.scrollIntoView({ block: 'start' });
    });
  }

  function render(data) {
    events = (data.events || []).slice();
    var limit = parseInt(container.getAttribute('data-gallery-limit'), 10);
    if (limit > 0) events = events.slice(0, limit);
    if (!events.length) return;
    container.classList.remove('gallery--empty');
    currentPage = 1;
    renderPage();
  }

  fetch('gallery.json', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(render)
    .catch(function () {
      container.innerHTML = '<p class="gallery__error">Gallery could not be loaded.' +
        (window.location.protocol === 'file:' ? ' Please open this website through a local or web server so gallery.json can be loaded.' : '') + '</p>';
    });
})();
