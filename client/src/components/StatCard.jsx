export default function StatCard({ label, value, tone='teal', detail }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}></div><div className="stat-content"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div></div>;
}
