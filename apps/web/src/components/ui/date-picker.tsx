"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

interface DateRangePickerProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal border-input hover:bg-accent hover:text-accent-foreground",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border shadow-md rounded-lg">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          locale={es}
          initialFocus
          className="rounded-lg border-0"
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Seleccionar rango de fechas",
  className,
}: DateRangePickerProps) {
  const [internalRange, setInternalRange] = React.useState<DateRange | undefined>(dateRange)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setInternalRange(dateRange)
  }, [dateRange])

  const handleApply = () => {
    onDateRangeChange?.(internalRange)
    setIsOpen(false)
  }

  const handleClear = () => {
    setInternalRange(undefined)
    onDateRangeChange?.(undefined)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal border-input hover:bg-accent hover:text-accent-foreground",
            !internalRange?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalRange?.from ? (
            internalRange.to ? (
              `${format(internalRange.from, "dd/MM/yyyy", { locale: es })} - ${format(internalRange.to, "dd/MM/yyyy", { locale: es })}`
            ) : (
              format(internalRange.from, "dd/MM/yyyy", { locale: es })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border shadow-md rounded-lg" align="start">
        <Calendar
          mode="range"
          selected={internalRange}
          onSelect={(range) => {
            setInternalRange(range)
          }}
          defaultMonth={internalRange?.from || new Date()}
          numberOfMonths={2}
          locale={es}
          initialFocus
          className="rounded-lg border-0"
        />
        <div className="p-3 border-t border-border flex gap-2">
          {internalRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1"
            >
              Limpiar
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}