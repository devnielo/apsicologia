"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  placeholder = "Introduce la fecha de nacimiento",
  className,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date())
  
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse()
  
  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(currentMonth.getFullYear(), parseInt(monthIndex), 1)
    setCurrentMonth(newMonth)
  }
  
  const handleYearChange = (year: string) => {
    const newMonth = new Date(parseInt(year), currentMonth.getMonth(), 1)
    setCurrentMonth(newMonth)
  }
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal border-input hover:bg-accent hover:text-accent-foreground px-3 gap-2",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 opacity-50" />
          <span className="text-sm whitespace-nowrap">
            {date ? format(date, "dd/MM/yyyy", { locale: es }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border shadow-md rounded-lg">
        <div className="p-3 space-y-3">
          {/* Custom Header with Month/Year Selects */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2 flex-1 justify-center">
              <Select
                value={currentMonth.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8 w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={currentMonth.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Calendar Grid */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={es}
            showOutsideDays={false}
            className="rounded-lg border-0"
            classNames={{
              nav: "hidden", // Hide default navigation
              caption: "hidden", // Hide default caption
            }}
          />
        </div>
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