"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Search, X, LoaderIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface DataTableProps<TData, TValue> {
  // Core — required
  columns: ColumnDef<TData, TValue>[]
  data:    TData[]

  // Search — optional
  // Pass the accessorKey of the column you want to filter by
  // e.g. searchKey="name" will filter the name column
  searchKey?:         string
  searchPlaceholder?: string

  // Loading state
  loading?: boolean

  // Pagination
  pageSize?: number          // default 10
}

// ─────────────────────────────────────────────────────────────
// DataTable
//
// Reusable shell. Write once, use on every page.
// Powered by TanStack Table — sorting, filtering, pagination
// all built in. You never configure this again.
//
// The only thing that changes per page is:
//   - columns  (what columns to show and how to render them)
//   - data     (the rows)
//
// Usage:
//   <DataTable
//     columns={categoryColumns}
//     data={categories}
//     searchKey="name"
//   />
// ─────────────────────────────────────────────────────────────
export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  loading = false,
  pageSize = 8,
}: DataTableProps<TData, TValue>) {

  const [sorting,          setSorting]          = React.useState<SortingState>([])
  const [columnFilters,    setColumnFilters]    = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    // ── Row models ──────────────────────────────────────────
    // Each model is a plugin. Only add what you need.
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // ── State handlers ──────────────────────────────────────
    onSortingChange:          setSorting,
    onColumnFiltersChange:    setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // ── Initial config ──────────────────────────────────────
    initialState: {
      pagination: { pageSize },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  // ── Derived values ────────────────────────────────────────
  const currentPage  = table.getState().pagination.pageIndex + 1
  const totalPages   = table.getPageCount()
  const filteredRows = table.getFilteredRowModel().rows.length
  const totalRows    = data.length
  const isFiltered   = columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ─────────────────────────────────────── */}
      {searchKey && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder={searchPlaceholder ?? `Search...`}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn(searchKey)?.setFilterValue(e.target.value)
              }
              className="pl-9 pr-9"
            />
            {/* Clear search button */}
            {isFiltered && (
              <button
                onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtered result count */}
          {isFiltered && (
            <span className="text-sm text-muted-foreground">
              {filteredRows} of {totalRows} results
            </span>
          )}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-md border">
        <Table>

          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {/* Loading state */}
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  <Spinner className="size-8 mx-auto"/>
                </TableCell>
              </TableRow>

            ) : table.getRowModel().rows.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {isFiltered ? "No results match your search." : "No records found."}
                </TableCell>
              </TableRow>

            ) : (
              // Data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </div>

      {/* ── Pagination ──────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
            <span className="ml-2 text-muted-foreground/60">
              ({filteredRows} rows)
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 gap-1.5"
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 gap-1.5"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}