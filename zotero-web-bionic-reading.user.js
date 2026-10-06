// ==UserScript==
// @name         Zotero Web Bionic Reading
// @namespace    https://github.com/luascfl/zotero-web-bionic-reading
// @version      1.0.0
// @description  Applies Bionic Reading-style emphasis to PDF text rendered in Zotero Web
// @author       Lucas Camilo Carvalho
// @match        https://www.zotero.org/*
// @match        https://zotero.org/*
// @match        https://*.zotero.org/*
// @updateURL    https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js
// @downloadURL  https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const LOG_PREFIX = '[Zotero Bionic Reading]';

  console.log(LOG_PREFIX, 'Script loaded:', location.href);

  if (!location.href.includes('viewer.html')) {
    console.log(LOG_PREFIX, 'Ignored document: no viewer.html in URL');
    return;
  }

  if (window.__zoteroBionicInstalled) {
    console.log(LOG_PREFIX, 'Interceptor already installed');
    return;
  }

  window.__zoteroBionicInstalled = true;

  const originalFillText =
    CanvasRenderingContext2D.prototype.fillText;

  window.__zoteroBionicOriginalFillText = originalFillText;

  let wordStarted = true;
  let highlightedCharacters = 0;

  function isWhitespace(text) {
    return /^\s*$/.test(text);
  }

  CanvasRenderingContext2D.prototype.fillText = function(
    text,
    x,
    y,
    maxWidth
  ) {
    if (typeof text !== 'string') {
      return originalFillText.call(
        this,
        text,
        x,
        y,
        maxWidth
      );
    }

    this.save();

    if (isWhitespace(text)) {
      wordStarted = true;
      highlightedCharacters = 0;
    } else {
      if (wordStarted) {
        wordStarted = false;
        highlightedCharacters = 0;
      }

      const highlightLimit = 2;

      if (highlightedCharacters < highlightLimit) {
        this.font = this.font.replace(
          /^(\s*)(\d+(?:\.\d+)?px)/i,
          '$1bold $2'
        );

        highlightedCharacters += text.length;
      }
    }

    const result = originalFillText.call(
      this,
      text,
      x,
      y,
      maxWidth
    );

    this.restore();
    return result;
  };

  console.log(LOG_PREFIX, 'Canvas interceptor installed');
})();
