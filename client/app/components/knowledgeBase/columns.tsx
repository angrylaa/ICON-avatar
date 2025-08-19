"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { deleteKnowledge } from "services/knowledge";
import { Input } from "../ui/input";

export type knowledgeBase = {
  table: string;
  id: number;
  title: string;
  body: string;
  tags: {
    categories: string[];
  };
  createdAt?: string;
};

export function makeKnowledgeColumns(): ColumnDef<knowledgeBase>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "body",
      header: "Body",
    },
    {
      accessorKey: "tags",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.original.tags?.categories || [];
        return (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat: string, idx: number) => (
              <Badge key={idx} className="bg-[#b4933f] py-1 px-2 text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return <div>{date ? new Date(date).toISOString() : "N/A"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        console.log(row.original);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <AlertDialog>
                <AlertDialogTrigger className="w-full text-left hover:cursor-pointer p-2 text-sm rounded-lg hover:bg-accent ">
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete knowledge?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the knowledge selected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="text-white"
                      onClick={() =>
                        deleteKnowledge(row.original.table, row.original.id)
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
