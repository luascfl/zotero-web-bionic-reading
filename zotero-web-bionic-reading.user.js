// ==UserScript==
// @name         Bionic Reading no Zotero Web Canvas
// @namespace    zotero-web-bionic-canvas
// @version      1.0.3
// @description  Aplica Bionic Reading ao texto renderizado no PDF do Zotero Web
// @author       Lucas Camilo Carvalho
// @icon         https://www.zotero.org/support/_media/logo/zotero_512x512x32.png
// @match        https://www.zotero.org/*
// @match        https://zotero.org/*
// @match        https://*.zotero.org/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js
// @downloadURL  https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js
// ==/UserScript==

(() => {
  'use strict';

  const LOG = '[BIONIC-CANVAS]';

  console.log(LOG, 'script carregado', location.href);

  if (!location.href.includes('viewer.html')) {
    console.log(LOG, 'documento ignorado');
    return;
  }

  if (window.__bionicCanvasInstalled) {
    console.log(LOG, 'interceptor já instalado');
    return;
  }

  window.__bionicCanvasInstalled = true;

  const originalFillText =
    CanvasRenderingContext2D.prototype.fillText;

  window.__bionicOriginalFillText = originalFillText;

  let inicioDaPalavra = true;
  let letrasDestacadas = 0;

  function ehEspaco(texto) {
    return /^\s*$/.test(texto);
  }

  CanvasRenderingContext2D.prototype.fillText = function(
    texto,
    x,
    y,
    largura
  ) {
    if (typeof texto !== 'string') {
      return originalFillText.call(this, texto, x, y, largura);
    }

    this.save();

    if (ehEspaco(texto)) {
      inicioDaPalavra = true;
      letrasDestacadas = 0;
    } else {
      if (inicioDaPalavra) {
        inicioDaPalavra = false;
        letrasDestacadas = 0;
      }

      const limite = 2;

      if (letrasDestacadas < limite) {
        const fonteOriginal = this.font;

        this.font = fonteOriginal.replace(
          /^(\s*)(\d+(?:\.\d+)?px)/i,
          '$1bold $2'
        );

        letrasDestacadas += texto.length;
      }
    }

    const resultado = originalFillText.call(
      this,
      texto,
      x,
      y,
      largura
    );

    this.restore();

    return resultado;
  };

  console.log(LOG, 'interceptor instalado');
})();
