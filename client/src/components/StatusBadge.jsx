export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge ${key}`}>{status || '—'}</span>;
}
