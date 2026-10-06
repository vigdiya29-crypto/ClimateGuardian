import { Calendar } from 'lucide-react';
import './DateSelector.css';

export default function DateSelector({ value, onChange, label = 'Date' }) {
  return (
    <label className="date-selector">
      <Calendar size={15} className="date-selector__icon" />
      <span className="date-selector__label">{label}</span>
      <input type="date" value={value} onChange={(e) => onChange?.(e.target.value)} />
    </label>
  );
}
