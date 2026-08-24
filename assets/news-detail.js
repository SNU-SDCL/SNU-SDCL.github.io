(function () {
  'use strict';

  var article = document.getElementById('news-detail');
  if (!article) return;

  var date = new URLSearchParams(window.location.search).get('date');

  function splitTitle(title) {
    var match = String(title || '').match(/^\s*\[([^\]]+)\]\s*(.*)$/);
    return match ? { dateLabel: match[1], text: match[2] } : { dateLabel: '', text: title || '' };
  }

  function formatDate(dateLabel, fallback) {
    var value = dateLabel || fallback || '';
    var match = String(value).match(/^(\d{4})[.-](\d{1,2})(?:[.-](\d{1,2}))?$/);
    if (!match) return value;

    var months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    var month = months[Number(match[2]) - 1];
    if (!month) return value;
    return match[3] ? month + ' ' + Number(match[3]) + ', ' + match[1] : month + ' ' + match[1];
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

  function showError() {
    article.innerHTML = '<p class="news-detail__error">The requested news article could not be found.</p>';
  }

  function fitLongTitle(element) {
    element.classList.remove('news-detail__title--single');
    element.style.fontSize = '';

    if (window.innerWidth < 900) return;

    element.classList.add('news-detail__title--single');
    var size = Math.min(parseFloat(window.getComputedStyle(element).fontSize), 34);
    element.style.fontSize = size + 'px';

    while (element.scrollWidth > element.clientWidth && size > 18) {
      size -= 1;
      element.style.fontSize = size + 'px';
    }

    if (element.scrollWidth > element.clientWidth) {
      element.classList.remove('news-detail__title--single');
      element.style.fontSize = '';
    }
  }

  fetch('news.json')
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      var news = Array.isArray(data) ? data : (data.news || []);
      var item = news.find(function (entry) { return String(entry.date) === String(date); });
      if (!item) return showError();

      var title = splitTitle(item.title);
      var titleElement = article.querySelector('.news-detail__title');
      document.title = title.text + ' | SDCL News';
      article.querySelector('.news-detail__date').textContent = formatDate(title.dateLabel, item.date);
      article.querySelector('.news-detail__category').textContent = item.category || '';
      titleElement.textContent = title.text;
      fitLongTitle(titleElement);
      window.addEventListener('resize', function () { fitLongTitle(titleElement); });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { fitLongTitle(titleElement); });
      }
      article.querySelector('.news-detail__body').textContent = item.description || '';

      var sourceUrl = externalUrl(item.url);
      var pdf = pdfUrl(item.url);
      if (sourceUrl) {
        var source = document.createElement('a');
        source.className = 'btn news-detail__source';
        source.href = sourceUrl;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.textContent = 'Read original article ↗';
        article.appendChild(source);
      }

      var images = imageSources(item.image);
      if (images.length) {
        var gallery = document.createElement('div');
        gallery.className = 'news-detail__gallery' + (images.length === 1 ? ' news-detail__gallery--single' : '');
        images.forEach(function (src, index) {
          var media = document.createElement('figure');
          var image = document.createElement('img');
          media.className = 'news-detail__media';
          image.src = src;
          image.alt = (item.title || 'News image') + (images.length > 1 ? ' (' + (index + 1) + ')' : '');
          media.appendChild(image);
          gallery.appendChild(media);
        });
        article.querySelector('.news-detail__body').before(gallery);
      }

      var videoId = youtubeFromImage(item.image);
      if (videoId) {
        var video = document.createElement('div');
        var player = document.createElement('iframe');
        video.className = 'news-detail__video';
        player.src = 'https://www.youtube-nocookie.com/embed/' + videoId;
        player.title = item.title || 'YouTube video';
        player.loading = 'lazy';
        player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        player.allowFullscreen = true;
        video.appendChild(player);
        article.querySelector('.news-detail__body').before(video);
      }

      if (pdf) {
        var documentViewer = document.createElement('section');
        var documentFrame = document.createElement('iframe');
        var documentLink = document.createElement('a');
        documentViewer.className = 'news-detail__document';
        documentFrame.src = pdf;
        documentFrame.title = (item.title || 'News document') + ' PDF';
        documentLink.className = 'btn news-detail__document-link';
        documentLink.href = pdf;
        documentLink.target = '_blank';
        documentLink.rel = 'noopener';
        documentLink.textContent = 'Open PDF in a new tab ↗';
        documentViewer.appendChild(documentFrame);
        documentViewer.appendChild(documentLink);
        article.querySelector('.news-detail__body').before(documentViewer);
      }
    })
    .catch(showError);
})();
