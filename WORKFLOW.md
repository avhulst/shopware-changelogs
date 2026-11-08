# Täglicher Prüflauf: Shopware-Changelog

Anleitung für Agent-Läufe (z. B. über den geplanten Tages-Task) und manuelle Ausführung.

## 1. Prüfen

1. `github_app.get_latest_release` für `shopware/shopware` aufrufen.
2. Wenn `tag_name` bereits als Eintrag in `data/index.json` existiert: Lauf beenden, kein neuer Eintrag (ggf. `checkedAt` aktualisieren, wenn sich `updated_at` geändert hat).
3. Zusätzlich über Websuche prüfen, ob es Ankündigungen gibt, die nicht im GitHub-Release stehen (changelog.shopware.com blockiert direkten automatisierten Zugriff).
4. Bei neuem Release: `body` des Releases vollständig auswerten (Abschnitte: Critical Fixes, Features, Core, Changelog).

## 2. Eintrag erstellen

1. Neue Datei `data/YYYY-MM-DD-vX.Y.Z.W.json` gemäß Datenmodell im README erstellen (Highlights, drei Persona-Texte, drei Kanal-Texte, alles auf Deutsch).
2. Persona-Texte zusätzlich als Markdown nach `personas/<gruppe>/YYYY-MM-DD-vX.Y.Z.W.md`, Kanal-Texte nach `kanaele/<kanal>/YYYY-MM-DD-vX.Y.Z.W.md` schreiben.
3. `data/index.json` ergänzen.
4. Alles in einem Commit via `github_app.push_files` nach `avhulst/shopware-changelogs`, Branch `main`, pushen.
5. React-App-Datenbestand aktualisieren (Eintrag in die App-Daten übernehmen).

## 3. Verteilen

- **Slack**: `channels.slack.text` in den vereinbarten Kanal posten (Slack-Connector).
- **Teams**: `channels.teams.text` in den vereinbarten Kanal posten (Teams-Connector).
- **Blog**: `channels.blog.text` als Entwurf an Andreas übergeben, nicht ungefragt veröffentlichen.
- Sind die Connectoren nicht verbunden: nur Repo-Update, in der Antwort darauf hinweisen.

## Ton & Sprache

- Alles auf Deutsch, sachlich, ohne Marketing-Floskeln (außer Persona vertrieb/blog).
- Fachbegriffe und Code-Bezeichner (Klassennamen, Flags, Dateipfade) in Originalsprache belassen.
- Patch kurz, Minor/Major ausführlich zusammenfassen.
- Auf CRA-Relevanz achten (LTS-/Support-Zeiträume, Sicherheitslücken betonen).
