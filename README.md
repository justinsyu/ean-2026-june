# EAN 2026 Abstract Archive

Static GitHub Pages archive for abstracts from the 12th Congress of the European Academy of Neurology - Geneva 2026.

## Build data

```powershell
python scripts\build_site_data.py
```

The builder reads `ENE_v33_iS1_Congress_Abstract_Book.pdf` and writes:

- `ean_2026_abstracts_analysis_ready.json`: full downloadable JSON.
- `assets/data/abstracts-index.json`: minified browser index used by the archive and Intelligence pages.

## Preview locally

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.
