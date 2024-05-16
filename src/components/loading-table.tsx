import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Plus } from "lucide-react";

export default function LoadingTable({
  title,
  subTitle,
  placeholder,
  isButton = true,
  header
}: {
  title: string,
  subTitle: string,
  placeholder: string,
  isButton?: boolean,
  header: string[]
}) {
  return (
    <div>
      <div className="my-4 flex justify-between">
        <div className="">
          <h1 className='text-2xl font-bold tracking-tight'>
            {title}
          </h1>
          <p className='text-muted-foreground'>
            {subTitle}
          </p>
        </div>
        <div className="">
          {isButton && <Button size="sm">
            <Plus size={18} className="mr-1" />
            Tambah
          </Button>}
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className="space-y-4">
          <div className='flex items-center justify-between'>
            <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
              <Input
                placeholder={placeholder}
                className='h-8 w-[150px] lg:w-[250px]'
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-8 lg:flex text-xs"
            >
              <MixerHorizontalIcon className="mr-2 h-4 w-4" />
              View
            </Button>
          </div>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow >
                  {header.map((header, i) => {
                    return (
                      <TableHead key={i} >
                        {header}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                  <TableRow key={v}>
                    <TableCell
                      colSpan={10}
                    >
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}