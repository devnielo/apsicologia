'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface BadgeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  predefinedOptions: string[];
  placeholder?: string;
  className?: string;
  searchPlaceholder?: string;
}

export function BadgeSelector({ 
  value, 
  onChange, 
  predefinedOptions, 
  placeholder = 'Agregar elemento',
  className,
  searchPlaceholder = 'Buscar opciones...'
}: BadgeSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: string) => {
    if (item && !value.includes(item)) {
      onChange([...value, item]);
    }
  };

  const removeItem = (item: string) => {
    onChange(value.filter(v => v !== item));
  };

  const addCustomItem = () => {
    if (customInput.trim()) {
      addItem(customInput.trim());
      setCustomInput('');
    }
  };

  const availableOptions = useMemo(() => {
    return predefinedOptions
      .filter(option => !value.includes(option))
      .filter(option => 
        searchTerm === '' || 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [predefinedOptions, value, searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomItem();
    }
  };

  const handleAddCustom = () => {
    addCustomItem();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected badges */}
      <div className="flex flex-wrap gap-1 min-h-[40px] items-start content-start">
        {value.map((item, index) => (
          <Badge key={index} variant="default" className="text-xs">
            {item}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item)}
              className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Add button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            {placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            {/* Search input for predefined options */}
            {predefinedOptions.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            )}

            {/* Input for custom values */}
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="flex-1 h-8 text-xs"
              />
              <Button
                onClick={handleAddCustom}
                size="sm"
                className="h-8 w-8 p-0"
                disabled={!customInput.trim()}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Predefined options */}
            {availableOptions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  {searchTerm ? `Resultados para "${searchTerm}"` : 'Opciones disponibles:'}
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {availableOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(option)}
                      className="h-6 text-xs px-2 py-1 hover:bg-primary hover:text-primary-foreground"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {searchTerm && availableOptions.length === 0 && (
              <div className="text-xs text-muted-foreground italic">
                No se encontraron opciones para "{searchTerm}"
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
