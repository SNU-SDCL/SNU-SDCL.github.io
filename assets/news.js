(function () {
  'use strict';

  var container = document.getElementById('news-list');
  if (!container) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function splitTitle(title) {
    var match = String(title || '').match(/^\s*\[([^\]]+)\]\s*(.*)$/);
    return match ? { date: match[1], text: match[2] } : { date: '', text: title || '' };
  }

  function excerpt(text, max) {
    var clean = String(text || '').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  function imageSources(image) {
    var values = Array.isArray(image) ? image : [image];
    return values.map(function (value) {
      var src = value && typeof value === 'object' ? value.src : value;
      return String(src || '').trim();
    }).filter(function (src) { return src && !/\/$/.test(src) && !youtubeId(src); });
  }

  function youtubeId(value) {
    var match = String(value || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/i);
    return match ? match[1] : '';
  }

  function youtubeFromImage(image) {
    var values = Array.isArray(image) ? image : [image];
    for (var i = 0; i < values.length; i += 1) {
      var value = values[i] && typeof values[i] === 'object' ? values[i].src : values[i];
      var id = youtubeId(value);
      if (id) return id;
    }
    return '';
  }

  function externalUrl(url) {
    var value = String(url || '').trim();
    return /^https?:\/\//i.test(value) ? value : '';
  }

  function pdfUrl(url) {
    var value = String(url || '').trim();
    return /\.pdf(?:[?#].*)?$/i.test(value) && !/^(?:javascript|data):/i.test(value) ? value : '';
  }

  function fitNewsTitles() {
    var titles = container.querySelectorAll('.news__title');
    titles.forEach(function (title) {
      title.classList.remove('news__title--single');
      title.style.fontSize = '';

      if (window.innerWidth < 900 || container.classList.contains('news--archive')) return;

      title.classList.add('news__title--single');
      var size = parseFloat(window.getComputedStyle(title).fontSize);
      title.style.fontSize = size + 'px';

      while (title.scrollWidth > title.clientWidth - 24 && size > 15) {
        size -= 1;
        title.style.fontSize = size + 'px';
      }

      if (title.scrollWidth > title.clientWidth - 24) {
        title.classList.remove('news__title--single');
        title.style.fontSize = '';
      }
    });
  }

  function newsRow(item) {
    var parts = splitTitle(item.title);
    var images = imageSources(item.image);
    var videoId = youtubeFromImage(item.image);
    var thumbnail = String(item.thumbnail || '').trim();
    var image = thumbnail || images[0] || (videoId ? 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg' : '');
    var detailUrl = 'news-detail.html?date=' + encodeURIComponent(item.date || parts.date);
    var sourceUrl = externalUrl(item.url);
    var pdf = pdfUrl(item.url);
    var opensSource = sourceUrl && !videoId;
    var href = opensSource ? sourceUrl : detailUrl;
    var linkAttributes = opensSource ? ' target="_blank" rel="noopener noreferrer"' : '';
    var action = videoId ? 'Watch ▶' : (pdf ? 'PDF ↗' : (sourceUrl ? 'Source ↗' : 'View ↗'));
    var ariaLabel = opensSource ? 'Open original source: ' : 'Open news article: ';
    return '<a class="news__row" href="' + escapeHtml(href) + '"' + linkAttributes +
      ' aria-label="' + ariaLabel + escapeHtml(parts.text) + '">' +
      '<span class="news__thumb' + (image ? '' : ' news__thumb--empty') + (videoId ? ' news__thumb--video' : '') + '" aria-hidden="true">' +
        (image ? '<img src="' + escapeHtml(image) + '" alt="">' : '') +
      '</span>' +
      '<span class="news__date">' + escapeHtml(parts.date) + '</span>' +
      '<span>' +
        '<span class="news__title">' + escapeHtml(parts.text) + '</span>' +
        '<span class="news__excerpt">' + escapeHtml(excerpt(item.description, 240)) + '</span>' +
      '</span>' +
      '<span class="news__cat">' + escapeHtml(item.category || '') + '<small>' + action + '</small></span>' +
    '</a>';
  }

  fetch('news.json')
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      var news = Array.isArray(data) ? data : (data.news || []);
      news.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      var limit = parseInt(container.getAttribute('data-news-limit'), 10);
      if (limit > 0) news = news.slice(0, limit);
      if (!news.length) return;
      container.classList.remove('news--empty');
      container.innerHTML = news.map(newsRow).join('');
      fitNewsTitles();
      window.addEventListener('resize', fitNewsTitles);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(fitNewsTitles);
      }
    })
    .catch(function () {
      container.innerHTML = '<div class="news__row news__row--placeholder">' +
        '<span class="news__thumb" aria-hidden="true"></span>' +
        '<span class="news__date">Error</span>' +
        '<span><span class="news__title">News could not be loaded</span>' +
        '<span class="news__excerpt">Please open this website through a local or web server so news.json can be loaded.</span></span>' +
        '<span class="news__cat"></span></div>';
    });
})();
