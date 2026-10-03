import { X } from 'lucide-react';
export default function Modal({ open, title, onClose, children, width='640px' }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal" style={{maxWidth:width}}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
      <div className="modal-body">{children}</div>
    </div>
  </div>;
}
