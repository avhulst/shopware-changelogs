import React, { useCallback, useEffect, useMemo, useState } from "react";

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

function getToken() {
  try {
    return localStorage.getItem("ghToken") || new URLSearchParams(location.search).get("token") || "";
  } catch {
    return "";
  }
}

async function fetchJson(path) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${BRANCH}`;
  const headers = { Accept: "application/vnd.github.raw+json" };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} (${path})`);
  return res.json();
}

function entryHay(e, withChannels) {
  const parts = [e.version, e.kurztitel, e.type];
  for (const c of e.highlights?.criticalFixes || []) parts.push(c.title || "", c.summary || "");
  for (const c of e.highlights?.features || []) parts.push(c.title || "", c.summary || "");
  if (e.highlights?.core) parts.push(...e.highlights.core);
  for (const p of PERSONAS) {
    const pv = e.personas?.[p.key];
    if (pv) parts.push(...(pv.punkte || pv));
  }
  if (withChannels) {
    for (const c of CHANNELS) {
      const cv = e.channels?.[c.key];
      if (cv) parts.push(cv.titel || "", cv.text || "");
    }
  }
  return parts.join(" ").toLowerCase();
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function App() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [persona, setPersona] = useState("entwickler");
  const [channel, setChannel] = useState("slack");
  const [selected, setSelected] = useState(null);
  const [tokenInput, setTokenInput] = useState("");

  const load = useCallback(async () => {
    try {
      const idx = await fetchJson("data/index.json");
      const kurz = Object.fromEntries(idx.entries.map((e) => [e.version, e.kurztitel || ""]));
      const list = await Promise.all(idx.entries.map((e) => fetchJson(e.file)));
      for (const e of list) if (!e.kurztitel && kurz[e.version]) e.kurztitel = kurz[e.version];
      list.sort((a, b) =>
        a.releasedAt !== b.releasedAt
          ? (a.releasedAt < b.releasedAt ? 1 : -1)
          : (a.version < b.version ? 1 : -1)
      );
      setEntries(list);
      setError(null);
      setSelected(list.length ? list[0].version : null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveToken = () => {
    const v = tokenInput.trim();
    try {
      if (v) localStorage.setItem("ghToken", v);
      else localStorage.removeItem("ghToken");
    } catch {}
    setTokenInput("");
    load();
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (entries || []).filter((e) => !q || entryHay(e, true).includes(q)),
    [entries, q]
  );

  const entry = useMemo(() => {
    if (!entries) return null;
    return entries.find((e) => e.version === selected) || filtered[0] || null;
  }, [entries, selected, filtered]);

  const matchCount = (e) => {
    if (!q) return 0;
    const m = entryHay(e, true).match(new RegExp(escapeRe(q), "gi"));
    return m ? m.length : 0;
  };

  if (error) {
    return (
      <div className="wrap">
        <div className="status error">
          <p><strong>Daten konnten nicht geladen werden:</strong> {error}</p>
          <p>Das Repo ist privat. Bei Status 404: fehlender oder ungültiger GitHub-Token (fine-grained, nur Leserecht auf dieses Repo). Der Token wird nur lokal im Browser (localStorage) gespeichert.</p>
          <input className="token" type="password" placeholder="GitHub-Token (read-only)" value={tokenInput} onChange={(ev) => setTokenInput(ev.target.value)} />
          <button className="pill" style={{ marginLeft: 8 }} onClick={saveToken}>Speichern &amp; neu laden</button>
        </div>
      </div>
    );
  }

  if (!entries) return <div className="wrap"><div className="status">Lade Daten aus {REPO_OWNER}/{REPO_NAME} …</div></div>;

  const pv = entry?.personas?.[persona];
  const punkte = pv ? (pv.punkte || pv) : [];
  const cv = entry?.channels?.[channel];

  return (
    <div className="wrap">
      <h1><span className="dot" />Shopware Changelog-Suche</h1>
      <div className="sub">Trassd · {entries.length} Einträge · Datenbestand: {entries.map((e) => e.version).join(", ")}</div>

      <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Suchen, z.B. CSP, ZUGFeRD, MCP, ProductBackInStockEvent …" />

      <div className="pills">
        {filtered.map((e) => (
          <button key={e.version} className={"pill" + (entry && entry.version === e.version ? " active" : "")} onClick={() => setSelected(e.version)}>
            v{e.version}<span className="date">{e.releasedAt}</span>
            {query.trim() ? <span className="count">{matchCount(e)}</span> : null}
          </button>
        ))}
        {filtered.length === 0 && <span className="empty">Kein Eintrag gefunden. Suchbegriff ändern.</span>}
      </div>

      {entry && (
        <>
          <div className="card">
            <h2>Shopware {entry.version}</h2>
            <span className={"badge" + (entry.type === "security" ? " security" : "")}>
              {entry.type === "security" ? "\uD83D\uDD12 security" : entry.type}
            </span>
            <div className="meta">veröffentlicht {entry.releasedAt} · geprüft {entry.checkedAt}</div>
            <div className="kurz">{entry.kurztitel || ""}</div>
            {(entry.sources || []).map((s, i) => (
              <div key={i} style={{ fontSize: 13, marginTop: 2 }}>
                <a href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>
              </div>
            ))}
          </div>

          <div className="tabs">
            {PERSONAS.map((p) => (
              <button key={p.key} className={"tab" + (persona === p.key ? " active" : "")} onClick={() => setPersona(p.key)}>{p.label}</button>
            ))}
          </div>
          <div className="panel">
            <ul className="punkte">
              {punkte.map((pkt, i) => <li key={i}>{pkt}</li>)}
            </ul>
          </div>

          <div className="tabs">
            {CHANNELS.map((c) => (
              <button key={c.key} className={"tab" + (channel === c.key ? " activeDark" : "")} onClick={() => setChannel(c.key)}>{c.label}</button>
            ))}
          </div>
          <div className="panel">
            <pre className="kanal">{cv ? cv.text : ""}</pre>
          </div>
        </>
      )}

      <footer>
        Quelle: github.com/{REPO_OWNER}/{REPO_NAME} (live) · Tägliche Prüfung um 08:00 (Europe/Berlin) · Bei privatem Repo erscheint ein Token-Feld (Status 404)
      </footer>
    </div>
  );
}
