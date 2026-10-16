export const statuses = ['new', 'contacted', 'confirmed', 'declined', 'cancelled'] as const;
export type Status = typeof statuses[number];
export type Preorder = {
  id: string; reference_code: string; created_at: string; full_name: string;
  email: string; phone: string | null; country_city: string; version_label: string;
  quantity: number; notes: string | null; status: Status;
};
export const columns = ['reference_code', 'created_at', 'full_name', 'email', 'phone', 'country_city', 'version_label', 'quantity', 'notes', 'status'] as const;
export const labels = ['Riferimento', 'Data', 'Nome', 'Email', 'Telefono', 'Città / paese', 'Versione', 'Quantità', 'Note', 'Stato'];
export function selectRows(rows: Preorder[], status: string, version: string, search: string, sort: typeof columns[number], ascending: boolean) {
  const query = search.trim().toLocaleLowerCase('it');
  return rows.filter(row => (!status || row.status === status) && (!version || row.version_label === version) &&
    (!query || columns.some(key => String(row[key] ?? '').toLocaleLowerCase('it').includes(query))))
    .sort((a, b) => (ascending ? 1 : -1) * (sort === 'quantity' ? a.quantity - b.quantity :
      String(a[sort] ?? '').localeCompare(String(b[sort] ?? ''), 'it', { numeric: true })));
}
export function toCsv(rows: Preorder[]) {
  const cell = (value: unknown) => {
    let text = String(value ?? '');
    // Neutralize spreadsheet formula injection, including leading whitespace.
    // eslint-disable-next-line no-control-regex -- reject control-prefixed formulas in exported cells
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return '\ufeff' + [labels.map(cell).join(';'), ...rows.map(row => columns.map(key => cell(row[key])).join(';'))].join('\r\n');
}
