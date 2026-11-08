# Shopware Changelog-App

Such-App für die täglich geprüften Shopware-Changelogs (Entwickler-, Projektmanager- und Vertriebs-Sicht inkl. Slack-/Teams-/Blog-Texten). Die Daten werden **live aus diesem Repo** geladen (GitHub Contents API) — neue Releases erscheinen automatisch, ohne dass die App angepasst werden muss.

## Varianten

### Variante A — Single-File-App (`app/index.html`) · empfohlen zum schnellen Nutzen

Einfach `app/index.html` herunterladen und im Browser öffnen (Doppelklick genügt).

- Reagiert auf Datei-Öffnen via `file://`, kein Build, kein npm, kein Server nötig.
- React wird per CDN (unpkg) geladen → Internetverbindung erforderlich.
- **v1.2:** komplett ohne Babel/JSX (reines `React.createElement`). Behebt den Fehler `Cannot use import statement outside a module`, der durch Babel standalone in der Datei-os-Version auftrat.

### Variante B — Vite-Projekt (`app/vite/`) · für echtes Hosting

Vollwertiges React-Quellprojekt für einen Produktions-Build:

```bash
cd app/vite
npm install
npm run build      # erzeugt dist/
npm run preview    # lokaler Test
```

Das `dist/`-Verzeichnis ist komplett statisch (React wird mitgebündelt, kein CDN nötig) und kann auf jeden Webserver, Netlify, Vercel etc. gelegt werden. `base: "./"` im `vite.config.js` macht den Build pfadrelativ, er funktioniert also auch in Subpfaden.

Hinweis: ES-Module funktionieren nicht via `file://` — die gebaute Vite-Variante läuft nur über echtes Hosting (http/https). Für „einfach öffnen“ Variante A nehmen.

## Datenabruf & Rate-Limits

Die App lädt `data/index.json` und alle Einträge über `https://raw.githubusercontent.com/avhulst/shopware-changelogs/main/...` (GitHubs CDN). Seit das Repo öffentlich ist, braucht es **keinen GitHub-Token mehr**.

Wichtig: Bewusst wird nicht die GitHub-Contents-API (`api.github.com`) verwendet. Diese erlaubt ohne Token nur 60 Anfragen pro Stunde und IP — bei 14 Dateien pro App-Laden war das Limit nach wenigen Reloads erschöpft (Fehlerbild: `GitHub API 403`). `raw.githubusercontent.com` hat CORS freigegeben (`access-control-allow-origin: *`) und dieses harte Limit nicht; zusätzlich cached es Dateien kurz (`cache-control: max-age=300`).

Würde das Repo wieder privat, funktioniert `raw.githubusercontent.com` nicht mehr — dann auf die Contents-API mit Token umstellen (siehe Git-Historik dieser Datei).

## GitHub Pages & CI-Deployment

Seit App v1.2 (08.11.2026) liegt unter `.github/workflows/deploy-app.yml` eine GitHub-Actions-CI. Bei jedem Push auf `main` (Änderungen unter `app/vite/**` oder am Workflow selbst) sowie per Hand (`workflow_dispatch`):

1. Node 22 + `npm install` im Ordner `app/vite`
2. `npm run build` → statisches `dist/` (React gebündelt, kein CDN)
3. Deploy des `dist/` auf **GitHub Pages** (`actions/deploy-pages@v4`, moderner Artefakt-Flow statt alter `gh-pages`-Branch)

Die App liegt danach unter `https://avhulst.github.io/shopware-changelogs/`. Der Build nutzt `base: "./"` im `vite.config.js`, deshalb funktioniert das Artefakt auch pfadrelativ auf Pages.

**Wichtig bei privatem Repo:** GitHub Pages ist für private Repos ein kostenpflichtiges Feature (Pro/Team/Enterprise). Solange das Repo privat ist, schlägt der Deploy-Job fehl. Zwei Optionen:

- Repo auf **public** stellen → Pages + CI laufen ohne Zusatzkosten, und die App braucht dann auch keinen GitHub-Token mehr (die öffentliche Contents-API ist ohne Token abrufbar; die Changelog-Daten sind ohnehin nicht sensibel, da die Persona-Texte ohnehin in Slack/Teams/Blog verteilt werden).
- Bei **Plan-Upgrade** (Pages für private Repos) oder Deploy auf ein anderes Ziel (Netlify/Vercel/eigener Server): der Build-Job bleibt gleich, nur der Deploy-Schritt lässt sich leicht umstellen.
