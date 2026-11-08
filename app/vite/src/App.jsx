import React from "react";
import { Search, Lock, AlertTriangle, RefreshCw, ExternalLink, Moon, Sun, Package, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { cn } from "./lib/utils";

const REPO_OWNER = "avhulst";
const REPO_NAME = "shopware-changelogs";
const BRANCH = "main";

const PERSONAS = [
  { key: "entwickler", label: "Entwickler" },
  { key: "projektmanager", label: "Projekt-Manager" },
  { key: "vertrieb", label: "Vertrieb" },
];
const CHANNELS = [
  { key: "slack", label: "Slack" },
  { key: "teams", label: "Teams" },
  { key: "blog", label: "Blog" },
];

async function fetchJson(path) {
  // raw.githubusercontent.com statt api.github.com: kein 60-req/h-API-Rate-Limit,
  // CORS erlaubt, fuer oeffentliche Repos kein Token noetig.
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} (${path})`);
  return res.json();
}

function entryHay(e, withChannels) {
  const parts = [e.version, e.kurztitel, e.type];
  const hf = e.highlights || {};
  [...(hf.criticalFixes || []), ...(hf.features || [])].forEach((c) =>
    parts.push(c.title || "", c.summary || "")
  );
  if (hf.core) parts.push(...hf.core);
  PERSONAS.forEach((p) => {
    const pv = (e.personas || {})[p.key];
    if (pv) parts.push(...(pv.punkte || pv));
  });
  if (withChannels) {
    CHANNELS.forEach((c) => {
      const cv = (e.channels || {})[c.key];
      if (cv) parts.push(cv.titel || "", cv.text || "");
    });
  }
  return parts.join(" ").toLowerCase();
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function App() {
  const [entries, setEntries] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [persona, setPersona] = React.useState("entwickler");
  const [channel, setChannel] = React.useState("slack");
  const [selected, setSelected] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const idx = await fetchJson("data/index.json");
      const kurz = {};
      idx.entries.forEach((e) => { kurz[e.version] = e.kurztitel || ""; });
      const list = await Promise.all(idx.entries.map((e) => fetchJson(e.file)));
      list.forEach((e) => { if (!e.kurztitel && kurz[e.version]) e.kurztitel = kurz[e.version]; });
      list.sort((a, b) =>
        a.releasedAt !== b.releasedAt ? (a.releasedAt < b.releasedAt ? 1 : -1) : (a.version < b.version ? 1 : -1)
      );
      setEntries(list);
      setError(null);
      setSelected(list.length ? list[0].version : null);
    } catch (err) {
      setError(String(err && err.message) || String(err));
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const q = query.trim().toLowerCase();
  const filtered = React.useMemo(
    () => (entries || []).filter((e) => !q || entryHay(e, true).includes(q)),
    [entries, q]
  );

  const entry = React.useMemo(() => {
    if (!entries) return null;
    const found = entries.find((e) => e.version === selected);
    return found || filtered[0] || null;
  }, [entries, selected, filtered]);

  const matchCount = (e) => {
    if (!q) return 0;
    const m = entryHay(e, true).match(new RegExp(escapeRe(q), "gi"));
    return m ? m.length : 0;
  };

  const pv = entry && entry.personas && entry.personas[persona];
  const punkte = pv ? (pv.punkte || pv) : [];
  const cv = entry && entry.channels && entry.channels[channel];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Kopfzeile */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              Shopware Changelog-Suche
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Trassd{entries ? ` · ${entries.length} Einträge` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={load} aria-label="Neu laden" title="Neu laden">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Fehler / Token */}
        {error && (
          <Card className="mb-6 border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Daten konnten nicht geladen werden
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={load}>
                <RefreshCw className="h-4 w-4" /> Erneut versuchen
              </Button>
            </CardContent>
          </Card>
        )}

        {!entries && !error && (
          <Card className="mb-6">
            <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" /> Lade Daten aus {REPO_OWNER}/{REPO_NAME} …
            </CardContent>
          </Card>
        )}

        {entries && (
          <>
            {/* Suche */}
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suchen, z. B. CSP, ZUGFeRD, MCP, ProductBackInStockEvent …"
              />
            </div>

            {/* Release-Pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              {filtered.map((e) => (
                <button
                  key={e.version}
                  onClick={() => setSelected(e.version)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                    entry && entry.version === e.version
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  )}
                >
                  v{e.version}
                  <span className="text-xs opacity-70">{e.releasedAt}</span>
                  {query.trim() ? (
                    <span className={cn(
                      "rounded px-1 text-xs",
                      entry && entry.version === e.version ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                      {matchCount(e)}
                    </span>
                  ) : null}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">Kein Eintrag gefunden. Suchbegriff ändern.</p>
              )}
            </div>

            {entry && (
              <>
                {/* Release-Karte */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-3">
                      <CardTitle className="text-xl">Shopware {entry.version}</CardTitle>
                      {entry.type === "security" ? (
                        <Badge variant="destructive" className="gap-1">
                          <Lock className="h-3 w-3" /> security
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Package className="h-3 w-3" /> {entry.type}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      veröffentlicht {entry.releasedAt} · geprüft {entry.checkedAt}
                    </CardDescription>
                    {entry.kurztitel && (
                      <p className="mt-2 flex items-start gap-1.5 text-sm font-medium">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {entry.kurztitel}
                      </p>
                    )}
                  </CardHeader>
                  {(entry.sources || []).length > 0 && (
                    <CardContent className="flex flex-wrap gap-x-4 gap-y-1">
                      {entry.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {s.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </CardContent>
                  )}
                </Card>

                {/* Persona-Tabs */}
                <Tabs value={persona} onValueChange={setPersona} className="mb-6">
                  <TabsList>
                    {PERSONAS.map((p) => (
                      <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value={persona}>
                    <Card>
                      <CardContent className="p-6">
                        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                          {punkte.map((pkt, i) => <li key={i}>{pkt}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Kanal-Tabs */}
                <Tabs value={channel} onValueChange={setChannel}>
                  <TabsList>
                    {CHANNELS.map((c) => (
                      <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value={channel}>
                    <Card>
                      <CardContent className="p-6">
                        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                          {cv ? cv.text : ""}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}

            <footer className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="h-3 w-3" />
              Quelle: github.com/{REPO_OWNER}/{REPO_NAME} (live) · Tägliche Prüfung um 08:00 (Europe/Berlin)
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
