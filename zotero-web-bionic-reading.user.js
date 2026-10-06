// ==UserScript==
// @name         Bionic Reading no Zotero Web Canvas
// @namespace    zotero-web-bionic-canvas
// @version      1.0.4
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

  // Mantém um estado independente para cada canvas.
  const estadosPorCanvas = new WeakMap();

  function obterEstado(contexto) {
    let estado = estadosPorCanvas.get(contexto);

    if (!estado) {
      estado = {
        inicioDaPalavra: true,
        letrasDestacadas: 0
      };

      estadosPorCanvas.set(contexto, estado);
    }

    return estado;
  }

  function ehEspaco(texto) {
    return /^\s*$/.test(texto);
  }

  function fonteComNegrito(fonte) {
    if (typeof fonte !== 'string' || !fonte.trim()) {
      return fonte;
    }

    // Evita adicionar bold duas vezes.
    if (/\bbold\b/i.test(fonte)) {
      return fonte;
    }

    /*
     * Adiciona bold sem analisar o nome da fonte.
     *
     * Exemplos aceitos:
     *   10px serif
     *   9.8px sans-serif
     *   normal 10px "g_d0_f1"
     *   italic 9px monospace
     */
    return `bold ${fonte}`;
  }

  CanvasRenderingContext2D.prototype.fillText = function(
    texto,
    x,
    y,
    largura
  ) {
    if (typeof texto !== 'string') {
      return originalFillText.call(
        this,
        texto,
        x,
        y,
        largura
      );
    }

    const estado = obterEstado(this);

    this.save();

    if (ehEspaco(texto)) {
      estado.inicioDaPalavra = true;
      estado.letrasDestacadas = 0;
    } else {
      if (estado.inicioDaPalavra) {
        estado.inicioDaPalavra = false;
        estado.letrasDestacadas = 0;
      }

      /*
       * Destaca os dois primeiros caracteres de cada palavra.
       * Como o PDF.js normalmente chama fillText caractere por caractere,
       * o estado é acumulado até atingir esse limite.
       */
      const limite = 2;

      if (estado.letrasDestacadas < limite) {
        this.font = fonteComNegrito(this.font);
        estado.letrasDestacadas += texto.length;
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
