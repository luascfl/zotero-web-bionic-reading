# Zotero Web Bionic Reading

A Tampermonkey userscript that applies a Bionic Reading-style emphasis to text rendered by the PDF.js canvas in Zotero Web.

## Features

- Applies emphasis directly while PDF text is rendered.
- Works with the Zotero Web PDF reader.
- Uses the first characters of each word as visual fixation points.
- Can be updated automatically through GitHub's raw file URL.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the raw userscript file:
   [Install the userscript](https://raw.githubusercontent.com/luascfl/zotero-web-bionic-reading/main/zotero-web-bionic-reading.user.js)
3. Tampermonkey will open the installation page.
4. Click **Install**.
5. Open a PDF in Zotero Web and reload the PDF viewer.

## Manual installation

Create a new Tampermonkey script and paste the contents of [`zotero-web-bionic-reading.user.js`](./zotero-web-bionic-reading.user.js).

## How it works

The Zotero Web reader renders visible PDF text on an HTML canvas. The normal text layer is mainly used for selection and is transparent. This userscript wraps `CanvasRenderingContext2D.prototype.fillText()` and applies a bold font to the first characters of words before they are drawn.

## Limitations

- The script depends on Zotero Web's current PDF.js rendering implementation.
- PDF files with unusual font mappings may not be processed perfectly.
- The script may need adjustments after changes to the Zotero Web reader.
- Reload the page to disable the interceptor for the current tab.

## License

MIT