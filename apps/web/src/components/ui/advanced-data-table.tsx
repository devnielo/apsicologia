'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  Table as TableType,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  Settings2,
  Download,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, FileText, FileSpreadsheet } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

// Enhanced Pagination Component
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EnhancedPaginationProps {
  table: TableType<any>;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemsInfo?: boolean;
}

function EnhancedPagination({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSizeSelector = true,
  showItemsInfo = true,
}: EnhancedPaginationProps) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const rowCount = table.getFilteredRowModel().rows.length;
  
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
      {showItemsInfo && (
        <div className="text-sm text-muted-foreground">
          {rowCount > 0 ? (
            <>
              Mostrando {startItem} - {endItem} de {rowCount} registros
            </>
          ) : (
            'No hay registros'
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2"
          >
            Primera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2"
          >
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">
              Página {pageIndex + 1} de {pageCount || 1}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            Siguiente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2"
          >
            Última
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Column Filter Component
export type FilterType = 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'daterange';

export interface ColumnFilterConfig {
  type: FilterType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  dateFormat?: string;
}

interface ColumnFilterProps {
  column: any;
  table: TableType<any>;
  config?: ColumnFilterConfig;
}

function ColumnFilter({ column, table, config }: ColumnFilterProps) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  // Auto-detect filter type if not specified
  const filterType = config?.type || (typeof firstValue === 'number' ? 'number' : 'text');

  // Generate unique values for select filters
  const sortedUniqueValues = React.useMemo(() => {
    if (filterType === 'select' || filterType === 'multiselect') {
      if (config?.options) {
        return config.options;
      }
      return Array.from(column.getFacetedUniqueValues().keys())
        .sort()
        .map(value => ({ label: String(value), value: String(value) }));
    }
    return [];
  }, [column.getFacetedUniqueValues(), config?.options, filterType]);

  // Text filter
  if (filterType === 'text') {
    return (
      <Input
        placeholder={config?.placeholder || 'Buscar...'}
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="h-8"
      />
    );
  }

  // Number range filter
  if (filterType === 'number') {
    return (
      <div className="flex space-x-2">
        <Input
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(e) =>
            column.setFilterValue((old: [number, number]) => [
              e.target.value,
              old?.[1],
            ])
          }
          placeholder="Min"
          className="w-20 h-8"
        />
        <Input
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(e) =>
            column.setFilterValue((old: [number, number]) => [
              old?.[0],
              e.target.value,
            ])
          }
          placeholder="Max"
          className="w-20 h-8"
        />
      </div>
    );
  }

  // Single select filter
  if (filterType === 'select') {
    return (
      <Select
        value={columnFilterValue as string || ''}
        onValueChange={(value) => column.setFilterValue(value === 'all' ? '' : value)}
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder={config?.placeholder || 'Seleccionar...'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {sortedUniqueValues.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Multi-select filter
  if (filterType === 'multiselect') {
    const selectedValues = (columnFilterValue as string[]) || [];
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[150px] justify-start"
          >
            {selectedValues.length > 0 ? (
              <Badge variant="secondary" className="mr-1">
                {selectedValues.length}
              </Badge>
            ) : (
              config?.placeholder || 'Seleccionar...'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-3" align="start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedValues.length === sortedUniqueValues.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    column.setFilterValue(sortedUniqueValues.map(v => v.value));
                  } else {
                    column.setFilterValue([]);
                  }
                }}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Seleccionar todo
              </label>
            </div>
            <div className="border-t pt-2 space-y-2 max-h-32 overflow-y-auto">
              {sortedUniqueValues.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        column.setFilterValue([...selectedValues, option.value]);
                      } else {
                        column.setFilterValue(selectedValues.filter(v => v !== option.value));
                      }
                    }}
                  />
                  <label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Boolean filter
  if (filterType === 'boolean') {
    return (
      <Select
        value={columnFilterValue as string || ''}
        onValueChange={(value) => column.setFilterValue(value === 'all' ? '' : value === 'true')}
      >
        <SelectTrigger className="h-8 w-[100px]">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Sí</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // Date filter
  if (filterType === 'date') {
    const [date, setDate] = React.useState<Date | undefined>(
      columnFilterValue ? new Date(columnFilterValue as string) : undefined
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[150px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'P', { locale: es }) : 'Seleccionar fecha'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              column.setFilterValue(newDate ? newDate.toISOString().split('T')[0] : '');
            }}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Date range filter
  if (filterType === 'daterange') {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
      columnFilterValue ? columnFilterValue as DateRange : undefined
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 w-[200px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                `${format(dateRange.from, 'P', { locale: es })} - ${format(dateRange.to, 'P', { locale: es })}`
              ) : (
                format(dateRange.from, 'P', { locale: es })
              )
            ) : (
              'Rango de fechas'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              column.setFilterValue(range);
            }}
            locale={es}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Fallback to text filter
  return (
    <Input
      placeholder="Buscar..."
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="h-8"
    />
  );
}

// Main Advanced DataTable Component
export interface AdvancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Search
  searchKey?: string;
  searchPlaceholder?: string;
  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  enableGlobalFilter?: boolean;
  // Column Filter Configurations
  columnFilterConfigs?: Record<string, ColumnFilterConfig>;
  // Responsive
  enableMobileView?: boolean;
  mobileBreakpoint?: number;
  compactMode?: boolean;
  // Pagination
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  // Styling
  className?: string;
  tableClassName?: string;
  // Callbacks
  onRowClick?: (row: Row<TData>) => void;
  onSelectionChange?: (selectedRows: Row<TData>[]) => void;
  onExport?: (data: TData[]) => void;
  onImport?: (data: TData[]) => void;
  // Loading & Empty states
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  // Toolbar
  showToolbar?: boolean;
  toolbarActions?: React.ReactNode;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Buscar...',
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enablePagination = true,
  enableGlobalFilter = true,
  columnFilterConfigs = {},
  enableMobileView = true,
  mobileBreakpoint = 768,
  compactMode = false,
  pageSizeOptions = [10, 20, 30, 50, 100],
  defaultPageSize = 10,
  className,
  tableClassName,
  onRowClick,
  onSelectionChange,
  onExport,
  onImport,
  isLoading = false,
  emptyMessage = 'No se encontraron resultados',
  emptyIcon,
  showToolbar = true,
  toolbarActions,
}: AdvancedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [showColumnFilters, setShowColumnFilters] = React.useState(false);
  const [isMobileView, setIsMobileView] = React.useState(false);

  // Mobile responsiveness hook
  React.useEffect(() => {
    if (!enableMobileView) return;

    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < mobileBreakpoint);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [enableMobileView, mobileBreakpoint]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: defaultPageSize,
      },
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onSelectionChange) {
        const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        onSelectionChange(selectedRows);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Global Search */}
              {enableGlobalFilter && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-8 h-9 w-[250px]"
                  />
                  {globalFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-9 px-2"
                      onClick={() => setGlobalFilter('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Column Filters Toggle */}
              {enableFiltering && (
                <Button
                  variant={showColumnFilters ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setShowColumnFilters(!showColumnFilters)}
                  className="h-9"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {columnFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {columnFilters.length}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Custom Actions */}
              {toolbarActions}
            </div>

            <div className="flex items-center gap-2">
              {/* Selection Info */}
              {enableRowSelection && selectedRowsCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedRowsCount} de {totalRowsCount} seleccionados
                </div>
              )}

              {/* Export/Import */}
              {onExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      onClick={() => {
                        const data = selectedRowsCount > 0 && enableRowSelection 
                          ? table.getSelectedRowModel().rows.map(r => r.original)
                          : table.getFilteredRowModel().rows.map(r => r.original);
                        exportToCSV(data, columns, { format: 'csv', filename: 'export' });
                        onExport(data);
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      CSV
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      onClick={() => {
                        const data = selectedRowsCount > 0 && enableRowSelection 
                          ? table.getSelectedRowModel().rows.map(r => r.original)
                          : table.getFilteredRowModel().rows.map(r => r.original);
                        exportToJSON(data, { format: 'json', filename: 'export' });
                        onExport(data);
                      }}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      JSON
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      onClick={() => {
                        const data = selectedRowsCount > 0 && enableRowSelection 
                          ? table.getSelectedRowModel().rows.map(r => r.original)
                          : table.getFilteredRowModel().rows.map(r => r.original);
                        exportToExcel(data, columns, { format: 'excel', filename: 'export' });
                        onExport(data);
                      }}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {onImport && (
                <div>
                  <input
                    type="file"
                    accept=".csv,.json"
                    style={{ display: 'none' }}
                    id="file-import"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      try {
                        let data;
                        if (file.name.endsWith('.json')) {
                          data = await importFromJSON(file);
                        } else if (file.name.endsWith('.csv')) {
                          data = await importFromCSV(file);
                        } else {
                          throw new Error('Formato de archivo no soportado');
                        }
                        onImport(data as TData[]);
                      } catch (error) {
                        console.error('Error importing file:', error);
                        // You could show a toast notification here
                      }
                      e.target.value = ''; // Reset input
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-import')?.click()}
                    className="h-9"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </Button>
                </div>
              )}

              {/* Column Visibility */}
              {enableColumnVisibility && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Columnas
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Column Filters */}
          {showColumnFilters && enableFiltering && (
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
              {table.getAllColumns().map((column) => {
                if (!column.getCanFilter()) return null;
                
                return (
                  <div key={column.id} className="flex flex-col gap-1">
                    <label className="text-xs font-medium capitalize">
                      {column.id}
                    </label>
                    <ColumnFilter 
                      column={column} 
                      table={table} 
                      config={columnFilterConfigs[column.id]}
                    />
                  </div>
                );
              })}
              {columnFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setColumnFilters([])}
                  className="h-8 self-end"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className={cn('rounded-lg border bg-card overflow-hidden', tableClassName)}>
        {/* Mobile Card View */}
        {isMobileView ? (
          <div className="divide-y">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
              </div>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 space-y-2',
                    row.getIsSelected() && 'bg-muted/50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const header = table.getHeaderGroups()[0]?.headers[index];
                    const headerContent = header ? flexRender(header.column.columnDef.header, header.getContext()) : '';
                    
                    return (
                      <div key={cell.id} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground min-w-0 flex-1 mr-2">
                          {typeof headerContent === 'string' ? headerContent : cell.column.id}
                        </span>
                        <span className="text-sm text-right min-w-0 flex-1">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      </div>
                    );
                  })}
                  {enableRowSelection && (
                    <div className="pt-2 border-t">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                        aria-label="Seleccionar fila"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                {emptyIcon || <Search className="h-8 w-8 text-muted-foreground" />}
                <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className={cn(
                        "font-semibold",
                        compactMode && "px-2 py-1"
                      )}>
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1">
                            {enableSorting && header.column.getCanSort() ? (
                              <div className="w-full">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </div>
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'hover:bg-muted/50',
                        onRowClick && 'cursor-pointer',
                        compactMode && 'h-10'
                      )}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cn(
                          compactMode && "px-2 py-1 text-sm"
                        )}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        {emptyIcon || <Search className="h-8 w-8 text-muted-foreground" />}
                        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {enablePagination && !isLoading && table.getRowModel().rows?.length > 0 && (
          <EnhancedPagination
            table={table}
            pageSizeOptions={pageSizeOptions}
            showPageSizeSelector={!isMobileView}
            showItemsInfo={true}
          />
        )}
      </div>
    </div>
  );
}

// Helper to create sortable column header
export function createSortableHeader(title: string) {
  return ({ column }: any) => (
    <div
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="flex items-center cursor-pointer select-none"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </div>
  );
}

// Export/Import Utilities
export type ExportFormat = 'csv' | 'json' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
}

// CSV Export Function
export function exportToCSV<T>(data: T[], columns: any[], options: ExportOptions = { format: 'csv' }) {
  const { filename = 'export', includeHeaders = true } = options;
  
  // Get visible columns only
  const visibleColumns = columns.filter(col => col.accessorKey);
  
  let csvContent = '';
  
  // Add headers
  if (includeHeaders) {
    const headers = visibleColumns.map(col => {
      const header = col.header;
      if (typeof header === 'string') return header;
      if (typeof header === 'function') return col.accessorKey;
      return col.accessorKey;
    });
    csvContent += headers.join(',') + '\n';
  }
  
  // Add data rows
  data.forEach(row => {
    const values = visibleColumns.map(col => {
      const value = (row as any)[col.accessorKey];
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvContent += values.join(',') + '\n';
  });
  
  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// JSON Export Function
export function exportToJSON<T>(data: T[], options: ExportOptions = { format: 'json' }) {
  const { filename = 'export' } = options;
  
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Excel Export Function (basic XLSX)
export function exportToExcel<T>(data: T[], columns: any[], options: ExportOptions = { format: 'excel' }) {
  // For now, we'll export as CSV with .xlsx extension
  // In a full implementation, you'd use a library like xlsx or exceljs
  const { filename = 'export' } = options;
  exportToCSV(data, columns, { ...options, filename });
}

// Import from JSON
export function importFromJSON<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          resolve(Array.isArray(data) ? data : [data]);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      } catch (error) {
        reject(new Error('Formato JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

// Import from CSV
export function importFromCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const lines = result.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            resolve([]);
            return;
          }
          
          // Parse headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          // Parse data rows
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          
          resolve(data);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      } catch (error) {
        reject(new Error('Formato CSV inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

// Export helper types
export type { ColumnDef } from '@tanstack/react-table';
