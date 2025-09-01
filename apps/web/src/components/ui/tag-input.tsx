'use client'

import * as React from 'react'
import { X, Plus } from 'lucide-react'
import { Badge } from './badge'
import { Input } from './input'
import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  suggestions?: string[]
  maxTags?: number
  className?: string
  disabled?: boolean
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Añadir...",
  suggestions = [],
  maxTags,
  className,
  disabled = false
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !value.includes(trimmedTag)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, trimmedTag])
        setInputValue('')
        setIsOpen(false)
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      handleAddTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault()
      handleRemoveTag(value[value.length - 1])
    }
  }

  const filteredSuggestions = suggestions.filter(suggestion => 
    !value.includes(suggestion) && 
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Input section */}
      {!disabled && (!maxTags || value.length < maxTags) && (
        <div className="flex gap-2">
          {suggestions.length > 0 ? (
            // With suggestions - use Command/Popover
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    onFocus={() => setIsOpen(true)}
                    className="flex-1 h-8"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    value={inputValue}
                    onValueChange={setInputValue}
                    placeholder="Buscar o escribir nuevo..."
                  />
                  <CommandList>
                    {filteredSuggestions.length > 0 && (
                      <CommandGroup heading="Sugerencias">
                        {filteredSuggestions.slice(0, 8).map((suggestion) => (
                          <CommandItem
                            key={suggestion}
                            onSelect={() => handleAddTag(suggestion)}
                            className="cursor-pointer"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {suggestion}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {inputValue && !suggestions.includes(inputValue) && (
                      <CommandGroup heading="Crear nuevo">
                        <CommandItem
                          onSelect={() => handleAddTag(inputValue)}
                          className="cursor-pointer"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Añadir "{inputValue}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                    {filteredSuggestions.length === 0 && !inputValue && (
                      <CommandEmpty>Sin sugerencias</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            // Without suggestions - simple input
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 h-8"
            />
          )}
          
          {inputValue && (
            <Button
              type="button"
              onClick={() => handleAddTag(inputValue)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Display current tags below input */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs px-1.5 py-0.5 h-5 hover:bg-secondary/80 transition-colors"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Max tags indicator */}
      {maxTags && (
        <p className="text-xs text-muted-foreground mt-1">
          {value.length} / {maxTags} elementos
        </p>
      )}
    </div>
  )
}
