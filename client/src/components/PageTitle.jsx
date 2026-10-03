export default function PageTitle({ eyebrow, title, subtitle, action }) {
  return <div className="page-title-row"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}
