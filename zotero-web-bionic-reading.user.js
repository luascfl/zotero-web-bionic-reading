// ==UserScript==
// @name         Bionic Reading no Zotero Web Canvas
// @namespace    zotero-web-bionic-canvas
// @version      1.0.5
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

  const originalStrokeText =
    CanvasRenderingContext2D.prototype.strokeText;

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

  function deveDestacar(contexto, texto) {
    if (typeof texto !== 'string') {
      return false;
    }

    const estado = obterEstado(contexto);

    if (ehEspaco(texto)) {
      estado.inicioDaPalavra = true;
      estado.letrasDestacadas = 0;
      return false;
    }

    if (estado.inicioDaPalavra) {
      estado.inicioDaPalavra = false;
      estado.letrasDestacadas = 0;
    }

    const limite = 2;

    if (estado.letrasDestacadas >= limite) {
      return false;
    }

    estado.letrasDestacadas += texto.length;
    return true;
  }

  function deslocamentoParaFonte(contexto) {
    const tamanho = Number.parseFloat(contexto.font);

    if (!Number.isFinite(tamanho) || tamanho <= 0) {
      return 0.35;
    }

    return Math.max(0.25, Math.min(0.8, tamanho * 0.035));
  }

  CanvasRenderingContext2D.prototype.fillText = function(
    texto,
    x,
    y,
    largura
  ) {
    const destacar = deveDestacar(this, texto);

    if (!destacar) {
      return originalFillText.call(
        this,
        texto,
        x,
        y,
        largura
      );
    }

    const deslocamento = deslocamentoParaFonte(this);

    originalFillText.call(
      this,
      texto,
      x,
      y,
      largura
    );

    originalFillText.call(
      this,
      texto,
      x + deslocamento,
      y,
      largura
    );
  };

  CanvasRenderingContext2D.prototype.strokeText = function(
    texto,
    x,
    y,
    largura
  ) {
    const destacar = deveDestacar(this, texto);

    if (!destacar) {
      return originalStrokeText.call(
        this,
        texto,
        x,
        y,
        largura
      );
    }

    const deslocamento = deslocamentoParaFonte(this);

    originalStrokeText.call(
      this,
      texto,
      x,
      y,
      largura
    );

    originalStrokeText.call(
      this,
      texto,
      x + deslocamento,
      y,
      largura
    );
  };

  console.log(LOG, 'interceptores fillText e strokeText instalados');
})();
