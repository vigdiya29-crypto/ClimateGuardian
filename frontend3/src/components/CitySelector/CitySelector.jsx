import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { INDIAN_CITIES } from '../../data/placeholderData';
import './CitySelector.css';

/**
 * Custom dark-themed City Selector component matching the dashboard aesthetics.
 * Uses React Portal to mount the dropdown to document.body, eliminating any
 * clipping from parent cards, overflow:hidden, or stacking context issues.
 *
 * API INTEGRATION: onChange(city) triggers a re-fetch of
 * GET /api/aqi/current?city= and related endpoints.
 */
export default function CitySelector({ value, onChange, cities = INDIAN_CITIES }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, minWidth: 165 });
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  // Calculate and update dropdown coordinates relative to viewport
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const minW = Math.max(165, rect.width);
      let left = rect.left;
      // Prevent horizontal overflow off the screen
      if (left + minW > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - minW - 12);
      }
      setDropdownPosition({
        top: rect.bottom + 6,
        left,
        minWidth: minW,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleWindowChange = () => updatePosition();
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    function handleClickOutside(event) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        listRef.current &&
        !listRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (city) => {
    onChange?.(city);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        const idx = cities.indexOf(value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < cities.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : cities.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < cities.length) {
        handleSelect(cities[focusedIndex]);
      }
    }
  };

  return (
    <div className="city-selector-wrap">
      <button
        ref={buttonRef}
        type="button"
        className={`city-selector ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select City"
      >
        <MapPin size={15} className="city-selector__icon" />
        <span className="city-selector__current">{value || cities[0]}</span>
        <ChevronDown size={14} className={`city-selector__chevron ${isOpen ? 'is-open' : ''}`} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={listRef}
            className="city-selector__dropdown"
            role="listbox"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${dropdownPosition.minWidth}px`,
              zIndex: 9999,
            }}
          >
            {cities.map((city, idx) => {
              const isSelected = city === value;
              const isFocused = idx === focusedIndex;
              return (
                <button
                  key={city}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`city-selector__option ${isSelected ? 'is-selected' : ''} ${isFocused ? 'is-focused' : ''}`}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                >
                  <span>{city}</span>
                  {isSelected && <Check size={14} className="city-selector__check" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
