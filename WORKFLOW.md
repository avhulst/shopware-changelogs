# Täglicher Prüflauf: Shopware-Changelog

Anleitung für Agent-Läufe (z. B. über den geplanten Tages-Task) und manuelle Ausführung.

## 1. Prüfen

1. `github_app.get_latest_release` für `shopware/shopware` aufrufen.
2. Wenn `tag_name` bereits als Eintrag in `data/index.json` existiert: Lauf beenden, kein neuer Eintrag (ggf. `checkedAt` aktualisieren, wenn sich `updated_at` geändert hat).
3. **RELEASE_INFO einbeziehen:** `RELEASE_INFO-X.Y.md` (X.Y = die zwei ersten Stellen der Version) via `github_app.get_file_contents` mit `ref: refs/tags/vX.Y.Z.W` laden. Die Datei enthält alle Releases der Minor-Linie; den Abschnitt der neuen Version herausschneiden (von `# X.Y.Z.W` bis zur nächsten `# X.Y.`-Überschrift). Der Abschnitt ist die wichtigste Quelle für vertiefte, wertvollere Zusammenfassungen (Bereiche: Critical Fixes, Features, Core, API, Administration, Storefront, App system).
4. Zusätzlich über Websuche prüfen, ob es Ankündigungen gibt, die nicht im GitHub-Release stehen (changelog.shopware.com blockiert direkten automatisierten Zugriff).
5. Bei neuem Release: `body` des Releases UND den RELEASE_INFO-Abschnitt vollständig auswerten.

## 2. Eintrag erstellen

1. Neue Datei `data/YYYY-MM-DD-vX.Y.Z.W.json` gemäß Datenmodell im README erstellen:
   - `sources`: GitHub-Release-URL + RELEASE_INFO-URL (mit Anker des Abschnitts) + Changelog-URL
   - `releaseInfo`: Verweis auf die archivierte Abschnittsdatei, Bereichsliste, Anzahl Einzeländerungen
   - `highlights` aus Release-Notes UND RELEASE_INFO (deutsch zusammengefasst)
   - `personas.entwickler`: Breaking Changes, Deprecations, neue Events/Flags, Migrationshinweise, MCP-/API-Themen aus der RELEASE_INFO
   - `personas.projektmanager`: Update-Aufwand, Risiken, Test-Empfehlungen, Planungshinweise
   - `personas.vertrieb`: Update-Argumente, verkaufbare Features, Kundennutzen
   - `channels.slack` (mrkdwn, kurz), `channels.teams` (Markdown, ausführlicher), `channels.blog` (Artikel-Entwurf, Deutsch)
2. RELEASE_INFO-Abschnitt als Original unter `release-info/YYYY-MM-DD-vX.Y.Z.W.md` archivieren (mit Quellzeile oben).
3. Persona-Texte zusätzlich als Markdown nach `personas/<gruppe>/YYYY-MM-DD-vX.Y.Z.W.md`, Kanal-Texte nach `kanaele/<kanal>/YYYY-MM-DD-vX.Y.Z.W.md` schreiben.
4. `data/index.json` ergänzen (neuer Eintrag mit `file`-Verweis).
5. Alles in einem Commit via `github_app.push_files` nach `avhulst/shopware-changelogs`, Branch `main`, pushen.

## 3. Verteilen

- **Slack** (Connector verbunden, seit 08.11.2026): Slack-Text aus `kanaele/slack/YYYY-MM-DD-vX.Y.Z.W.md` bzw. `channels.slack.text` mit `slack.send_message` in den Channel **#shopware** posten (channel_id `C06T2M66TK6`, Workspace a-dev-team). Mrkdwn-Links `<URL|Text>` vorher ins Markdown-Format `[Text](URL)` umwandeln. Am Ende eine Zeile mit Link zur Changelog-App `https://avhulst.github.io/shopware-changelogs/` anhängen.
- **Teams**: nur wenn der Connector verbunden ist, `channels.teams.text` posten.
- **Blog**: `channels.blog.text` als Entwurf an Andreas übergeben, nicht ungefragt veröffentlichen.
- Ist ein Connector nicht verbunden: Repo-Update trotzdem durchführen und in der Antwort darauf hinweisen.

## 4. React-App

Kein Datenpflege-Aufwand: Die App wird bei Push auf `app/vite/**` automatisch von GitHub Actions gebaut und auf GitHub Pages deployt (`.github/workflows/deploy-app.yml`, URL: https://avhulst.github.io/shopware-changelogs/). Die App lädt `data/index.json` und alle Einträge live per GitHub-API, neue Einträge erscheinen also auch ohne Rebuild automatisch. Nur bei Datenmodell- oder UI-Änderungen ist `app/vite/src/App.jsx` anzupassen (der Deploy folgt dann automatisch). Die Single-File-Variante `app/index.html` (kein Babel, direkt öffnen) parallel pflegen, wenn `app/index.html` selbst geändert wird.

## Ton & Sprache

- Alles auf Deutsch, sachlich, ohne Marketing-Floskeln (außer Persona vertrieb/blog).
- Fachbegriffe und Code-Bezeichner (Klassennamen, Flags, Dateipfade) in Originalsprache belassen.
- Bei(patch/minor/major) entsprechend gewichten: bei Patch-Releases kurze Persona-Texte, bei Minor/Major ausführlich.
- Auf CRA-Relevanz achten (z. B. LTS-/Support-Zeiträume, Sicherheitslücken betonen).
- Punkte, die nur aus der RELEASE_INFO stammen, mit "(aus RELEASE_INFO)" kennzeichnen.
