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

## GitHub-Token (weil das Repo privat ist)

Die App ruft `https://api.github.com/repos/avhulst/shopware-changelogs/contents/...` ab. Bei privatem Repo braucht der Browser einen **fine-grained GitHub-Token** mit reinem Leserecht (Contents: Read-only) auf dieses Repo:

- Token-Eingabefeld erscheint in der App automatisch, wenn der Abruf mit 404 fehlschlägt.
- Alternativ: Token einmalig per URL übergeben: `index.html?token=DEIN_TOKEN` (wird dann in `localStorage` als `ghToken` gehalten) oder direkt in den Browser-DevTools setzen: `localStorage.setItem("ghToken","…")`.
- Der Token verlässt den Browser nicht — er wird nur für die GitHub-API-Anfragen genutzt.

## GitHub Pages & CI-Deployment

Seit App v1.2 (08.11.2026) liegt unter `.github/workflows/deploy-app.yml` eine GitHub-Actions-CI. Bei jedem Push auf `main` (Änderungen unter `app/vite/**` oder am Workflow selbst) sowie per Hand (`workflow_dispatch`):

1. Node 22 + `npm install` im Ordner `app/vite`
2. `npm run build` → statisches `dist/` (React gebündelt, kein CDN)
3. Deploy des `dist/` auf **GitHub Pages** (`actions/deploy-pages@v4`, moderner Artefakt-Flow statt alter `gh-pages`-Branch)

Die App liegt danach unter `https://avhulst.github.io/shopware-changelogs/`. Der Build nutzt `base: "./"` im `vite.config.js`, deshalb funktioniert das Artefakt auch pfadrelativ auf Pages.

**Wichtig bei privatem Repo:** GitHub Pages ist für private Repos ein kostenpflichtiges Feature (Pro/Team/Enterprise). Solange das Repo privat ist, schlägt der Deploy-Job fehl. Zwei Optionen:

- Repo auf **public** stellen → Pages + CI laufen ohne Zusatzkosten, und die App braucht dann auch keinen GitHub-Token mehr (die öffentliche Contents-API ist ohne Token abrufbar; die Changelog-Daten sind ohnehin nicht sensibel, da die Persona-Texte ohnehin in Slack/Teams/Blog verteilt werden).
- Bei **Plan-Upgrade** (Pages für private Repos) oder Deploy auf ein anderes Ziel (Netlify/Vercel/eigener Server): der Build-Job bleibt gleich, nur der Deploy-Schritt lässt sich leicht umstellen.
