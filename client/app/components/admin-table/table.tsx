"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filtering
  const filteredData = filter
    ? data.filter((row: any) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : data;

  // Pagination
  const paginatedData = filteredData.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
          className="w-1/3 border-[#E6C547]"
        />
      </div>
      <div className="overflow-hidden rounded-md border border-[#E6C547]">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-12 my-4 ">
        <div className="flex gap-2">
          <Button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="bg-[#D4AF37] hover:bg-[#B8941F] hover:cursor-pointer"
          >
            Previous
          </Button>
          <div>
            <Input
              type="number"
              min={1}
              max={Math.max(1, Math.ceil(filteredData.length / pageSize))}
              value={page + 1}
              onChange={(e) => {
                const val = Number(e.target.value) - 1;
                setPage(val >= 0 ? val : 0);
              }}
              className="w-16 text-center"
            />
          </div>
          <Button
            className="bg-[#D4AF37] hover:bg-[#B8941F] hover:cursor-pointer"
            disabled={(page + 1) * pageSize >= filteredData.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
