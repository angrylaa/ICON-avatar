"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import MultiSelect from "~/components/ui/multi-select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Controller } from "react-hook-form";
import { createKnowledge } from "services/knowledge";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  categories: z.string().min(1, "At least one category required"),
});

const categories = [
  { value: "Resources", label: "Resources" },
  { value: "General Knowledge", label: "General Knowledge" },
  { value: "Advice", label: "Advice" },
  { value: "Career", label: "Career" },
  { value: "School", label: "School" },
];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border border-[#CBB06A]">
      {(columns || Array.isArray(columns) || Array.isArray(data)) && (
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
      )}
    </div>
  );
}

export function CreateKnowledgeEntryDialog({
  table,
  onCreated,
}: {
  table: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof entrySchema>>({
    resolver: zodResolver(entrySchema),
    defaultValues: { title: "", body: "", categories: "" },
  });

  async function onSubmit(values: z.infer<typeof entrySchema>) {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await createKnowledge(
        table,
        {
          title: values.title,
          body: values.body,
          tags: {
            categories: values.categories.split(",").map((c) => c.trim()),
          },
        },
        token ?? undefined
      );

      if (!res.ok) throw new Error("Failed to create entry");

      form.reset();
      setOpen(false);
      onCreated();
    } catch (e: any) {
      setError(e?.message || "Error creating entry");
      // Do NOT reset or close dialog if error
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#B4933F] hover:bg-[#947627] hover:cursor-pointer mt-4 mb-2"
          type="button"
        >
          Create New Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Knowledge Entry</DialogTitle>
          <DialogDescription>
            Fill out the fields below to add a new entry.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="categories"
                      render={({ field: controllerField }) => {
                        // Map string values to Option objects
                        const selectedOptions = controllerField.value
                          ? controllerField.value
                              .split(",")
                              .map((val: string) =>
                                categories.find((opt) => opt.value === val)
                              )
                              .filter(
                                (
                                  opt
                                ): opt is { value: string; label: string } =>
                                  !!opt
                              )
                          : [];
                        return (
                          <MultiSelect
                            defaultOptions={categories}
                            value={selectedOptions}
                            onChange={(opts: any[]) => {
                              controllerField.onChange(
                                opts.map((opt: any) => opt.value).join(",")
                              );
                            }}
                            placeholder="Select a category..."
                            emptyIndicator={
                              <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                no results found.
                              </p>
                            }
                          />
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#B4933F] hover:bg-[#947627] text-xs"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
