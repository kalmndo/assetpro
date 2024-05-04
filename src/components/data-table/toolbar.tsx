import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'

import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './view-options'
import { DataTableFacetedFilter } from './faceted-filter'
import { Fragment } from 'react'

// import { priorities, statuses } from '../data/data'
// import { DataTableFacetedFilter } from './data-table-faceted-filter'

export type DataTableToolbarFilterProps = {
  column: string
  placeholder: string
}

export type DataTableFacetedFilterProps = {
  column: string
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  facetedFilter?: DataTableFacetedFilterProps[]
  filter: DataTableToolbarFilterProps
}

export function DataTableToolbar<TData>({
  table,
  facetedFilter,
  filter
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={filter.placeholder}
          value={(table.getColumn(filter.column)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(filter.column)?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />

        <div className='flex gap-x-2'>
          {facetedFilter?.map(({ options, column, title }, index) => (
            <Fragment key={index}>
              {table.getColumn(column) && (
                <DataTableFacetedFilter
                  column={table.getColumn(column)}
                  title={title}
                  options={options}
                />
              )}
            </Fragment>
          ))}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
