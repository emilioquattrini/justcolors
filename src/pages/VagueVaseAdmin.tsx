import { useEffect, useRef, useState } from 'react';
import { adminClient as db } from '../lib/adminClient';
import { columns, labels, selectRows, statuses, toCsv } from '../lib/preorders';
import type { Preorder, Status } from '../lib/preorders';
import './VagueVaseAdmin.css';

export default function VagueVaseAdmin() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rows, setRows] = useState<Preorder[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupPassword, setSetupPassword] = useState(new URLSearchParams(window.location.search).get('admin-auth') === '1');
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState('');
  const [version, setVersion] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<typeof columns[number]>('created_at');
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(0);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    let checkId = 0;
    async function check() {
      const requestId = ++checkId;
      const { data } = await db.auth.getUser();
      const { data: allowed, error } = data.user ? await db.rpc('justcolors_is_preorder_admin') : { data: false, error: null };
      if (active && requestId === checkId) {
        const permitted = allowed === true && !error;
        setAuthorized(permitted); setChecking(false);
        if (!permitted) { setRows([]); generation.current++; }
      }
    }
    void check();
    const { data: { subscription } } = db.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') { checkId++; generation.current++; setRows([]); setAuthorized(false); }
      else setTimeout(() => { if (active) void check(); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!authorized) return;
    void load();
    // Authorization changes invalidate any in-flight request.
  }, [authorized]);
  async function load() {
    const current = generation.current;
    setBusy(true); setError('');
    try {
      const all: Preorder[] = [];
      // Fetch every page: never silently truncate KPIs or CSV at the API limit.
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db.from('justcolors_vaguevase_preorders')
          .select('id,' + columns.join(',')).order('created_at').order('id').range(offset, offset + 499);
        if (error) throw error;
        if (current !== generation.current) return;
        const batch = data as unknown as Preorder[];
        all.push(...batch);
        if (batch.length < 500) break;
      }
      setRows(all);
    } catch { if (current === generation.current) { setRows([]); setError('Impossibile caricare le prenotazioni. Verifica la sessione e riprova.'); } }
    finally { if (current === generation.current) setBusy(false); }
  }
  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
    setPassword(''); setBusy(false);
    setError(error ? 'Accesso non riuscito. Verifica email e password.' : 'Se non visualizzi la dashboard, questo account non è autorizzato.');
  }
  async function logout() {
    generation.current++; setRows([]); setAuthorized(false);
    await db.auth.signOut({ scope: 'local' });
  }
  async function resetPassword() {
    if (!email.trim()) { setError('Inserisci prima la tua email.'); return; }
    setBusy(true); setError(''); setNotice('');
    const { error } = await db.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}${window.location.pathname}?admin-auth=1` });
    setBusy(false);
    if (error) setError('Invio non riuscito. Riprova più tardi.');
    else setNotice('Se l’account esiste, riceverai un’email per impostare la password.');
  }
  async function savePassword(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const { error } = await db.auth.updateUser({ password });
    setBusy(false); setPassword('');
    if (error) setError('Password non aggiornata. Usa almeno 12 caratteri e riprova, oppure richiedi un nuovo link.');
    else { setSetupPassword(false); window.history.replaceState(null, '', `${window.location.pathname}#/admin/preorders`); }
  }
  async function update(row: Preorder, next: Status) {
    if (next === row.status || saving) return;
    const current = generation.current;
    setSaving(row.id); setError('');
    const { data, error } = await db.from('justcolors_vaguevase_preorders').update({ status: next })
      .eq('id', row.id).eq('status', row.status).select('id,status').single();
    if (current === generation.current) {
      if (error || !data) setError('Stato non salvato: la prenotazione potrebbe essere cambiata. Aggiorna e riprova.');
      else setRows(previous => previous.map(item => item.id === row.id ? { ...item, status: next } : item));
      setSaving(null);
    }
  }
  function exportCsv() {
    const url = URL.createObjectURL(new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `vaguevase-preorders-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const filtered = selectRows(rows, status, version, search, sort, ascending);
  const lastPage = Math.max(0, Math.ceil(filtered.length / 25) - 1);
  const currentPage = Math.min(page, lastPage);
  return <main className="vv-admin">
    <header><div><p className="va-brand">JUSTCOLORS</p><h1>VagueVase <span>Admin</span></h1></div>{authorized && <button onClick={() => void logout()}>Esci</button>}</header>
    {checking ? <p role="status">Verifica accesso…</p> : !authorized ? <form className="va-login" onSubmit={login}>
      <h2>Gestione pre-order</h2><p>Accesso riservato a Emilio e Chiara. Usa il tuo account personale Supabase Auth.</p>
      <label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busy}>{busy ? 'Accesso…' : 'Accedi'}</button>
      <button type="button" disabled={busy} onClick={() => void resetPassword()}>Imposta / recupera password</button>
      {notice && <p role="status">{notice}</p>}
      <p>Accesso su invito. Se il link è scaduto, inserisci l’email e richiedine uno nuovo.</p>
      {error && <p role="alert">{error}</p>}
    </form> : setupPassword ? <form className="va-login" onSubmit={savePassword}>
      <h2>Imposta la tua password</h2><p>Scegli una password personale di almeno 12 caratteri.</p>
      <label>Nuova password<input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busy}>{busy ? 'Salvataggio…' : 'Salva password'}</button>{error && <p role="alert">{error}</p>}
    </form> : <>
      <section className="va-kpis" aria-label="Riepilogo completo">
        {[['Prenotazioni', rows.length], ['Quantità totale', rows.reduce((sum, row) => sum + row.quantity, 0)], ...statuses.map(s => [s, rows.filter(row => row.status === s).length])].map(([label, value]) => <article key={label}><span>{label}</span><strong>{busy ? '…' : value}</strong></article>)}
      </section>
      <p>I KPI si riferiscono a tutte le prenotazioni. Filtri ed export si applicano all’elenco.</p>
      <section className="va-controls" aria-label="Filtri prenotazioni">
        <label>Cerca<input type="search" placeholder="Nome, email, riferimento, note…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label>
        <label>Stato<select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}><option value="">Tutti gli stati</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
        <label>Versione<select value={version} onChange={e => { setVersion(e.target.value); setPage(0); }}><option value="">Tutte le versioni</option>{[...new Set(rows.map(row => row.version_label))].sort().map(v => <option key={v}>{v}</option>)}</select></label>
        <button disabled={busy || !!saving} onClick={() => void load()}>Aggiorna</button><button disabled={busy || !filtered.length} onClick={exportCsv}>Esporta CSV ({filtered.length})</button>
      </section>
      {error && <p role="alert" className="va-error">{error}</p>}
      <p role="status" aria-live="polite">{busy ? 'Caricamento…' : `${filtered.length} prenotazioni trovate`}{saving && ' · Salvataggio…'}</p>
      <div className="va-table" tabIndex={0} role="region" aria-label="Elenco prenotazioni, scorrimento orizzontale"><table>
        <thead><tr>{columns.map((key, i) => <th key={key} aria-sort={sort === key ? ascending ? 'ascending' : 'descending' : 'none'}><button onClick={() => { setSort(key); setAscending(sort === key ? !ascending : true); setPage(0); }}>{labels[i]} {sort === key ? ascending ? '↑' : '↓' : '↕'}</button></th>)}</tr></thead>
        <tbody>{filtered.slice(currentPage * 25, (currentPage + 1) * 25).map(row => <tr key={row.id}>{columns.map(key => <td key={key}>{key === 'status' ? <select aria-label={`Stato ${row.reference_code}`} disabled={!!saving || busy} value={row.status} onChange={e => void update(row, e.target.value as Status)}>{statuses.map(s => <option key={s}>{s}</option>)}</select> : key === 'created_at' ? new Date(row.created_at).toLocaleString('it-IT', { timeZone: 'Europe/Rome' }) : row[key] ?? '—'}</td>)}</tr>)}</tbody>
      </table>{!busy && !filtered.length && <p className="va-empty">Nessuna prenotazione corrisponde ai filtri.</p>}</div>
      <nav className="va-pagination" aria-label="Pagine elenco"><button disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Precedente</button><span>Pagina {currentPage + 1} di {lastPage + 1}</span><button disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>Successiva</button></nav>
    </>}
  </main>;
}
