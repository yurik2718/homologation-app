import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./DataTablePagination"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderMobileCard?: (item: TData) => React.ReactNode
  searchColumn?: string
  searchValue?: string
  toolbarContent?: React.ReactNode
  onRowClick?: (item: TData) => void
  pageSize?: number
  showPagination?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderMobileCard,
  searchColumn,
  searchValue,
  toolbarContent,
  onRowClick,
  pageSize = 10,
  showPagination = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter: searchColumn ? searchValue : undefined,
    },
    globalFilterFn: searchColumn
      ? (row, _columnId, filterValue) => {
          const val = row.getValue(searchColumn)
          return String(val ?? "")
            .toLowerCase()
            .includes(String(filterValue ?? "").toLowerCase())
        }
      : undefined,
    initialState: {
      pagination: { pageSize },
    },
  })

  const filteredRows = table.getFilteredRowModel().rows

  return (
    <div className="space-y-2">
      {toolbarContent}

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  —
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      {renderMobileCard && (
        <div className="md:hidden space-y-2">
          {filteredRows.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">—</p>
          ) : (
            filteredRows.map((row) => (
              <div key={row.id}>{renderMobileCard(row.original)}</div>
            ))
          )}
        </div>
      )}

      {showPagination && data.length > pageSize && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
}
