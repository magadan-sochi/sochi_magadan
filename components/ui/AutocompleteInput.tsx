import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input.tsx';
import { X } from 'lucide-react';

interface AutocompleteInputProps {
  label: string;
  options: string[];
  selectedItems: Set<string>;
  onSelectItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
}

const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  options,
  selectedItems,
  onSelectItem,
  onRemoveItem,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = inputValue
    ? options.filter(
        option =>
          !selectedItems.has(option) &&
          option.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleSelect = (item: string) => {
    onSelectItem(item);
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        type="text"
        placeholder={label}
        value={inputValue}
        onChange={e => {
            setInputValue(e.target.value);
            setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-secondary border border-border rounded-md shadow-lg max-h-60 overflow-y-auto no-scrollbar">
          <ul className="py-1">
            {filteredOptions.slice(0, 10).map(option => ( // Limit to 10 suggestions for performance
              <li
                key={option}
                className="px-3 py-2 text-sm text-foreground hover:bg-accent cursor-pointer"
                onMouseDown={() => handleSelect(option)} // Use onMouseDown to prevent blur event from firing first
              >
                {capitalizeFirstLetter(option)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3 min-h-[2.5rem]">
        {Array.from(selectedItems).map(item => (
          <div key={item} className="flex items-center bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full animate-in fade-in-50">
            <span>{capitalizeFirstLetter(item)}</span>
            <button onClick={() => onRemoveItem(item)} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-primary/80 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
