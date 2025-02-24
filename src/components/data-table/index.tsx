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
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './pagination'
import { type DataTableFacetedFilterProps, DataTableToolbar, type DataTableToolbarFilterProps } from './toolbar'
import { CheckboxToolbar } from './checkbox-toolbar'

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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
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
    getExpandedRowModel: getExpandedRowModel()
  })

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
                      <TableCell colSpan={row.getVisibleCells().length}>
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
          <TableFooter>
            {table.getFooterGroups().map(footerGroup => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableFooter>
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

//  1286
//  1297
//  1298/
//  1432/
//  1582
//  1583
//  1584
//  1699/
//  1700
//  1701
//  1702
//  1703
//  1704
//  1705
// akhir
//  1658
//  1684

// residen
//  43
//  128
//  129
//  130
//  131
//  132
//  133
//  134
//  135
//  136
//  137
//  138
//  139
//  140
//  141
//  160
//  161
//  162
//  163
//  164
//  165
//  166
//  167
//  168
//  169
//  170
//  171
//  172
//  173
//  174
//  175
//  176
//  177
//  178
//  179
//  180
//  181
//  182
//  183
//  184

// sd
//  57
//  93
//  94
//  95
//  96
//  97
//  98
//  99
//  100
//  101
//  102
//  103
//  104
//  105
//  106
//  107
//  704