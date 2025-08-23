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

// Column Filter Component
interface ColumnFilterProps {
  column: any;
  table: TableType<any>;
}

function ColumnFilter({ column, table }: ColumnFilterProps) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = React.useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  return typeof firstValue === 'number' ? (
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
  ) : (
    <Input
      placeholder={`Buscar...`}
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
  onImport?: () => void;
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(table.getFilteredRowModel().rows.map(r => r.original))}
                  className="h-9"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              )}
              {onImport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onImport}
                  className="h-9"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
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
                    <ColumnFilter column={column} table={table} />
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {enableSorting && header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-2 h-8 data-[state=open]:bg-accent"
                              onClick={() => header.column.toggleSorting()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
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
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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

        {/* Pagination */}
        {enablePagination && !isLoading && table.getRowModel().rows?.length > 0 && (
          <EnhancedPagination
            table={table}
            pageSizeOptions={pageSizeOptions}
            showPageSizeSelector={true}
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
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="-ml-2 h-8"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

// Export helper types
export type { ColumnDef } from '@tanstack/react-table';
