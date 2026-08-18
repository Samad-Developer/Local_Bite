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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data:    TData[]

  searchKey?:         string
  searchPlaceholder?: string

  loading?: boolean

  pageSize?: number

  toolbar?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  loading = false,
  pageSize = 8,
  toolbar,
}: DataTableProps<TData, TValue>) {

  const [sorting,          setSorting]          = React.useState<SortingState>([])
  const [columnFilters,    setColumnFilters]    = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange:          setSorting,
    onColumnFiltersChange:    setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: { pageSize },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const currentPage  = table.getState().pagination.pageIndex + 1
  const totalPages   = table.getPageCount()
  const filteredRows = table.getFilteredRowModel().rows.length
  const totalRows    = data.length
  const isFiltered   = columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4">

      {(searchKey || toolbar) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchKey && (
            <div className="relative flex-1 min-w-[12rem] max-w-sm">
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
              {isFiltered && (
                <button
                  onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {isFiltered && (
            <span className="text-sm text-muted-foreground">
              {filteredRows} of {totalRows} results
            </span>
          )}

          {toolbar && <div className="ml-auto">{toolbar}</div>}
        </div>
      )}

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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {isFiltered ? "No results match your search." : "No records found."}
                </TableCell>
              </TableRow>

            ) : (
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
