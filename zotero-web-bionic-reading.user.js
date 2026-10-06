// ==UserScript==
// @name         Zotero Web Bionic Reading
// @namespace    https://github.com/luascfl/zotero-web-bionic-reading
// @version      1.0.2
// @description  Applies Bionic Reading-style emphasis to Zotero Web PDF text
// @author       Lucas Camilo Carvalho
// @icon         https://www.zotero.org/support/_media/logo/zotero_512x512x32.png
// @match        https://www.zotero.org/static/*/reader/*
// @match        https://zotero.org/static/*/reader/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js
// @downloadURL  https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js
// ==/UserScript==

(function () {
    'use strict';

    const PREFIX = '[Zotero Bionic Reading]';

    console.log(`${PREFIX} Script loaded:`, location.href);

    if (!location.href.includes('/reader/pdf/web/viewer.html')) {
        console.log(`${PREFIX} Ignored document: no PDF viewer in URL`);
        return;
    }

    function emphasizeText(text) {
        return text.replace(/\S+/g, word => {
            const letters = [...word];
            const split = Math.ceil(letters.length * 0.45);
            const beginning = letters.slice(0, split).join('');
            const ending = letters.slice(split).join('');
            return `<b>${beginning}</b>${ending}`;
        });
    }

    function processTextLayer(layer) {
        if (layer.dataset.bionicProcessed === 'true') return;

        const spans = layer.querySelectorAll('span');
        if (!spans.length) return;

        let count = 0;

        spans.forEach(span => {
            if (span.dataset.bionicProcessed === 'true') return;

            const text = span.textContent;
            if (!text || !text.trim() || text.length < 2) return;

            span.innerHTML = emphasizeText(text);
            span.dataset.bionicProcessed = 'true';
            count++;
        });

        if (count > 0) {
            layer.dataset.bionicProcessed = 'true';
            console.log(`${PREFIX} Processed text layer: ${count} spans`);
        }
    }

    function scanTextLayers() {
        document.querySelectorAll('.textLayer').forEach(processTextLayer);
    }

    const observer = new MutationObserver(scanTextLayers);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    scanTextLayers();
    console.log(`${PREFIX} Text-layer observer installed`);
})();
