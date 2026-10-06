import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item} className="breadcrumbs__item">
          {i > 0 && <ChevronRight size={13} className="breadcrumbs__chevron" />}
          <span className={i === items.length - 1 ? 'is-current' : ''}>{item}</span>
        </span>
      ))}
    </nav>
  );
}
