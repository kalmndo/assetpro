"use client"
import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
  type Row,
  getExpandedRowModel,
  ExpandedState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableFacetedFilterProps, DataTableToolbar, DataTableToolbarFilterProps } from '@/components/data-table/toolbar'
import { DataTablePagination } from '@/components/data-table/pagination'
import { CheckboxToolbar } from '@/components/data-table/checkbox-toolbar'


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  facetedFilter?: DataTableFacetedFilterProps[]
  filter?: DataTableToolbarFilterProps
  defaultFilters?: { id: string, value: string | string[] }[]
  columnVisibilityDefaultState?: VisibilityState
  checkboxToolbarActions?: { title: string, desc: string, handleAction(table: any): void }[]
  isPagintation?: boolean
  rowSelection?: RowSelectionState
  setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
  getRowCanExpand?: (row: Row<TData>) => boolean
  getIsRowExpanded?: ((row: Row<TData>) => boolean) | undefined
}

export function DataTable<TData, TValue>({
  columns,
  data,
  facetedFilter,
  filter,
  defaultFilters = [],
  columnVisibilityDefaultState = {},
  checkboxToolbarActions,
  isPagintation = true,
  rowSelection = {},
  setRowSelection,
  renderSubComponent,
  getRowCanExpand,
  getIsRowExpanded,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(columnVisibilityDefaultState)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(defaultFilters)
  const [sorting, setSorting] = React.useState<SortingState>([])
  // const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      // expanded
    },
    // @ts-ignore
    // getSubRows: (row) => row.children,
    // onExpandedChange: setExpanded,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowCanExpand,
    getIsRowExpanded,
    getExpandedRowModel: getExpandedRowModel(),
  })

  console.log("table", table.getRowModel().rows)

  return (
    <div className='space-y-4'>
      {filter && <DataTableToolbar table={table} filter={filter} facetedFilter={facetedFilter} />}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment
                  key={row.id}
                >
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
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
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getAllCells().length}>
                        {renderSubComponent?.({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isPagintation && <DataTablePagination table={table} />}
      {checkboxToolbarActions &&
        <CheckboxToolbar
          table={table}
          count={table.getFilteredSelectedRowModel().rows.length}
          actions={checkboxToolbarActions}
        />
      }
    </div>
  )
}
