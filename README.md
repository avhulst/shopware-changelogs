# Shopware-Changelog-System

Tägliche Prüfung der Shopware-Changelogs, Zusammenfassung in Deutsch für verschiedene Zielgruppen und Kanäle. Daten liegen versioniert in diesem Repo; die React-App macht die Einträge durchsuchbar.

## Struktur

```
├── README.md            # Dieses Dokument
├── WORKFLOW.md          # Anleitung für den täglichen Prüflauf
├── data/
│   ├── index.json       # Index aller Einträge
│   └── YYYY-MM-DD-vX.Y.Z.W.json   # Eintrag pro Release
├── release-info/        # Original-Abschnitte aus RELEASE_INFO-X.Y.md pro Release
├── personas/            # Deutsche Zusammenfassungen pro Zielgruppe
│   ├── entwickler/
│   ├── projektmanager/
│   └── vertrieb/
├── kanaele/             # Kanal-Formate, kopierfertig
│   ├── slack/
│   ├── teams/
│   └── blog/
└── app/                 # React-App (Suche über alle Einträge)
```

## Datenmodell (data/*.json)

Jeder Eintrag enthält `version`, `releasedAt`, `checkedAt`, `type` (patch/minor/major), `sources` (GitHub-Release-URL, RELEASE_INFO-URL mit Anker, Changelog-URL), `releaseInfo` (Verweis auf `release-info/`, Bereichsliste, Anzahl Einzeländerungen), `highlights` (`criticalFixes[]`, `features[]`, `core[]`), `personas` (`entwickler`, `projektmanager`, `vertrieb`) und `channels` (`slack`, `teams`, `blog`).

## Quellen

1. **GitHub Releases** (`shopware/shopware`) - primäre Quelle, vollständige Release Notes
2. **RELEASE_INFO-X.Y.md** (`shopware/shopware`, pro Release-Tag) - vertiefte Release-Info mit Bereichen (Core, API, Administration, Storefront, App system); Abschnitt pro Release wird unter `release-info/` archiviert und fließt in die Persona-Zusammenfassungen ein
3. **changelog.shopware.com** - blockiert aktuell automatisierten Zugriff; manuell prüfen oder via Websuche

## Zielgruppen

| Persona | Fokus |
|---|---|
| Entwickler | Breaking Changes, Deprecations, Events, Feature-Flags, Migration, MCP/API |
| Projektmanager | Update-Aufwand, Projektrisiken, Test-Empfehlungen |
| Vertrieb | Argumente für Updates, verkaufbare Features, Kundennutzen |

## Kanäle

- **Slack**: kurzes mrkdwn-Format mit Bullets und Links
- **Teams**: ausführlicheres Markdown-Format
- **Blog**: vollständiger Artikel-Entwurf (vor Veröffentlichung Andreas freigeben lassen)

## React-App

Die React-App in `app/` bietet Volltextsuche, Filter nach Persona und Version. Sie wird als Mistral-App (React) betrieben; der Datenstand entspricht dem Repo-Stand.
