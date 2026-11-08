# React-App: Shopware Changelog-Suche (hostbare Variante)

Eigenständige, hostbare App (`index.html`). Sie lädt ihre Daten **live** per GitHub-API aus diesem Repo: `data/index.json` und die dort referenzierten Einträge. Kein Datenpflege-Aufwand in der App selbst - der Canvas-App-Datenbestand muss nicht mehr aktualisiert werden.

## Lokal testen

Einfach `app/index.html` im Browser öffnen. Da das Repo privat ist, wird ein GitHub-Token benötigt (Status 404 ohne Token): bei einem Ladefehler erscheint ein Token-Feld. Der Token wird nur im `localStorage` des Browsers gespeichert.

Alternative per URL: `index.html?token=<TOKEN>` (Vorsicht: landet in Logs/History - das Eingabefeld ist vorzuziehen).

## Token-Anforderungen

- Fine-grained Personal Access Token, nur Leserecht (Contents: Read) auf `avhulst/shopware-changelogs`.
- Niemals committen oder im Klartext teilen.

## Hosting

- **GitHub Pages** funktioniert nur bei öffentlichen Repos (private Pages erfordern einen kostenpflichtigen Plan). Wird das Repo auf Public gestellt, reicht `index.html` ohne Token.
- Alternativ: beliebiges statisches Hosting (Netlify, Vercel, eigener Webserver); die App braucht keine Build-Pipeline.

## Struktur

- `app/index.html` - komplette App (React via CDN, Babel Standalone), Styling inline, keine weiteren Dateien nötig.
- Die Persona- und Kanal-Ansichten entsprechen dem Datenmodell aus `data/*.json` (personas.punkte, channels.slack/teams/blog.text).
