import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  icon: Icon,
  disabled = false,
  placeholder = 'Select option',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, minWidth: 160 });
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const minW = Math.max(160, rect.width);
      let left = rect.left;
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
    if (isOpen) updatePosition();
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

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex((opt) => (typeof opt === 'object' ? opt.value : opt) === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < options.length) {
        const item = options[focusedIndex];
        handleSelect(typeof item === 'object' ? item.value : item);
      }
    }
  };

  const selectedItem = options.find((opt) => (typeof opt === 'object' ? opt.value : opt) === value);
  const displayLabel = selectedItem
    ? typeof selectedItem === 'object'
      ? selectedItem.label
      : selectedItem
    : value || placeholder;

  return (
    <div className={`custom-select-wrap ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={`custom-select ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {Icon && <Icon size={14} className="custom-select__icon" />}
        <span className="custom-select__label">{displayLabel}</span>
        <ChevronDown size={14} className={`custom-select__chevron ${isOpen ? 'is-open' : ''}`} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={listRef}
            className="custom-select__dropdown"
            role="listbox"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${dropdownPosition.minWidth}px`,
              zIndex: 9999,
            }}
          >
            {options.map((opt, idx) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = optVal === value;
              const isFocused = idx === focusedIndex;

              return (
                <button
                  key={optVal}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select__option ${isSelected ? 'is-selected' : ''} ${isFocused ? 'is-focused' : ''}`}
                  onClick={() => handleSelect(optVal)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                >
                  <span>{optLabel}</span>
                  {isSelected && <Check size={14} className="custom-select__check" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
