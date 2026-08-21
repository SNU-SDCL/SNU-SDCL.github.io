(function () {
  'use strict';

  var list = document.getElementById('publications-list');
  var summary = document.getElementById('publication-summary');
  var filters = document.querySelector('.filters[data-dynamic]');
  var search = document.getElementById('publication-search');
  var pagination = document.getElementById('publication-pagination');
  if (!list || !summary || !filters || !pagination) return;

  var publications = [];
  var activeYear = 'all';
  var currentPage = 1;
  var pageSize = 10;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parseReference(reference) {
    var text = String(reference || '').trim();
    var straightOpen = text.indexOf('"');
    var curlyOpen = text.indexOf('“');
    var firstQuote = straightOpen < 0 ? curlyOpen : (curlyOpen < 0 ? straightOpen : Math.min(straightOpen, curlyOpen));
    var titleTail = text.slice(firstQuote + 1);
    var citationBoundary = titleTail.match(/["”]\s*,/);
    var straightClose = text.indexOf('"', firstQuote + 1);
    var curlyClose = text.indexOf('”', firstQuote + 1);
    var fallbackClose = straightClose < 0
      ? curlyClose
      : (curlyClose < 0 ? straightClose : Math.min(straightClose, curlyClose));
    var lastQuote = citationBoundary ? firstQuote + 1 + citationBoundary.index : fallbackClose;
    if (firstQuote < 0 || lastQuote <= firstQuote) {
      return { authors: '', title: text, journal: '', details: '' };
    }

    var authors = text.slice(0, firstQuote).replace(/[\s,]+$/, '');
    var title = text.slice(firstQuote + 1, lastQuote);
    var citation = text.slice(lastQuote + 1)
      .replace(/\s*\(\s*†\s*(?:Equally contributed|Equal contribution)\s*\)\s*\.?/gi, '')
      .replace(/^[\s,]+/, '')
      .replace(/[\s.]+$/, '');
    var submittedParts = citation.match(/^(Submitted)(?:[,.]\s*)?(.*)$/i);
    var citationParts = citation.match(
      /^(.*?)(?:,\s*|\s+)(?=(?:(?:\d+(?:\s*[-–]\s*\d+)*)\s*\(\d{4}\)|\(\d{4}\)(?=\s+\d)|Accepted\b))(.*)$/i
    );
    var journal = submittedParts ? submittedParts[1] : (citationParts ? citationParts[1].trim() : citation);
    var details = submittedParts ? submittedParts[2].trim() : (citationParts ? citationParts[2].trim() : '');

    journal = journal.replace(/[\s,.]+$/, '');
    details = details.replace(/^[\s,.]+|[\s.]+$/g, '');

    return { authors: authors, title: title, journal: journal, details: details };
  }

  function formatAuthors(authors) {
    var normalized = String(authors || '')
      .replace(/,\s*([*†])/g, '$1,')
      .replace(/,\s*$/, '');

    return escapeHtml(normalized)
      .replace(/S\. S\. Han/g, '<strong>S. S. Han</strong>')
      .replace(/([*†])/g, '<sup class="author-mark" aria-hidden="true">$1</sup>');
  }

  function publicationCard(item, position) {
    var parsed = parseReference(item.reference);
    var year = String(item.year || 'Other');
    var doi = String(item.doi || '').trim();
    var articleUrl = String(item.url || '').trim();
    var number = String(publications.length - position).padStart(3, '0');
    var status = year === 'Submitted' ? 'Submitted' : year;
    var destination = articleUrl || (doi ? 'https://doi.org/' + doi : '');
    var link = destination
      ? '<a class="pub__doi" href="' + escapeHtml(destination) +
        '" target="_blank" rel="noopener">View paper <span aria-hidden="true">↗</span></a>'
      : '<span class="pub__status">Link unavailable</span>';

    return '<article class="pub" data-year="' + escapeHtml(year) + '" data-search="' +
      escapeHtml((item.reference || '').toLowerCase()) + '">' +
      '<span class="pub__no">' + number + '</span>' +
      '<div class="pub__content">' +
        '<div class="pub__meta"><span class="pub__badge">' + escapeHtml(status) +
          '</span><span>' + escapeHtml(item.index || '') + '</span></div>' +
        '<h3 class="pub__title">' + escapeHtml(parsed.title) + '</h3>' +
        (parsed.authors ? '<p class="pub__authors">' + formatAuthors(parsed.authors) + '</p>' : '') +
        '<p class="pub__journal"><em>' + escapeHtml(parsed.journal) + (parsed.details ? ',' : '') + '</em>' +
          (parsed.details ? '<span class="vol">' + escapeHtml(parsed.details) + '</span>' : '') + '</p>' +
      '</div>' +
      '<div class="pub__side"><span class="pub__year">' + escapeHtml(year) + '</span>' + link + '</div>' +
    '</article>';
  }

  function renderFilters() {
    var counts = {};
    var years = [];
    publications.forEach(function (item) {
      var year = String(item.year || 'Other');
      if (!counts[year]) years.push(year);
      counts[year] = (counts[year] || 0) + 1;
    });

    filters.innerHTML = '<button data-filter="all" class="is-active">All <span>' +
      publications.length + '</span></button>' +
      years.map(function (year) {
        return '<button data-filter="' + escapeHtml(year) + '">' + escapeHtml(year) +
          ' <span>' + counts[year] + '</span></button>';
      }).join('');
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      pagination.hidden = true;
      pagination.innerHTML = '';
      return;
    }

    var pages = [];
    for (var page = 1; page <= totalPages; page += 1) {
      pages.push(
        '<button type="button" data-page="' + page + '"' +
        (page === currentPage ? ' class="is-active" aria-current="page"' : '') +
        ' aria-label="Page ' + page + '">' + page + '</button>'
      );
    }

    pagination.innerHTML =
      '<button type="button" class="pagination-arrow" data-page="' + (currentPage - 1) + '"' +
        (currentPage === 1 ? ' disabled' : '') + ' aria-label="Previous page">←</button>' +
      pages.join('') +
      '<button type="button" class="pagination-arrow" data-page="' + (currentPage + 1) + '"' +
        (currentPage === totalPages ? ' disabled' : '') + ' aria-label="Next page">→</button>';
    pagination.hidden = false;
  }

  function applyFilters() {
    var query = search ? search.value.trim().toLowerCase() : '';
    var matchingRows = [];

    list.querySelectorAll('.pub').forEach(function (row) {
      var yearMatches = activeYear === 'all' || row.dataset.year === activeYear;
      var textMatches = !query || (row.dataset.search || '').indexOf(query) >= 0;
      if (yearMatches && textMatches) matchingRows.push(row);
      row.hidden = true;
    });

    var totalResults = matchingRows.length;
    var totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * pageSize;
    var end = Math.min(start + pageSize, totalResults);
    matchingRows.slice(start, end).forEach(function (row) {
      row.hidden = false;
    });

    var range = totalResults ? (start + 1) + '–' + end : '0';
    summary.innerHTML = '<strong>' + range + '</strong> of ' + totalResults +
      ' publication' + (totalResults === 1 ? '' : 's') +
      (activeYear === 'all' ? '' : ' in <b>' + escapeHtml(activeYear) + '</b>');
    renderPagination(totalPages);
  }

  filters.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-filter]');
    if (!button) return;
    activeYear = button.dataset.filter;
    currentPage = 1;
    filters.querySelectorAll('button').forEach(function (item) {
      item.classList.toggle('is-active', item === button);
    });
    applyFilters();
  });

  pagination.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    currentPage = Number(button.dataset.page);
    applyFilters();
  });

  if (search) {
    search.addEventListener('input', function () {
      currentPage = 1;
      applyFilters();
    });
  }

  fetch('publications.json')
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      publications = Array.isArray(data) ? data : (data.publications || []);
      renderFilters();
      list.innerHTML = publications.map(publicationCard).join('');
      applyFilters();
    })
    .catch(function () {
      summary.textContent = 'Publications could not be loaded.';
      pagination.hidden = true;
      list.innerHTML = '<div class="publication-error">Please open this website through a local or web server ' +
        'so publications.json can be loaded.</div>';
    });
})();
