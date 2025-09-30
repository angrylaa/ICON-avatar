"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "services/user";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "../ui/input";

export function makeUserColumns(
  onDelete: (user: User) => void,
  onChangeRole: (user: User) => void,
  onResetPassword: (user: User, newPassword: string) => void
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.role === "user"
              ? "w-1/2 bg-[#E6C547] py-1"
              : "w-1/2 bg-[#D4AF37] py-1"
          }
        >
          {row.original.role[0].toUpperCase() + row.original.role.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

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
                    <AlertDialogTitle>Delete user?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the user "{user.email}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="text-white"
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger className="w-full text-left hover:cursor-pointer p-2 text-sm rounded-lg hover:bg-accent ">
                  Change Role
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Change User Role</AlertDialogTitle>
                    <AlertDialogDescription>
                      Change role for "{user.email}" from{" "}
                      <b>
                        {row.original.role[0].toUpperCase() +
                          row.original.role.slice(1)}
                      </b>{" "}
                      to <b>{user.role === "admin" ? "User" : "Admin"}</b>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="text-white bg-[#D4AF37] hover:bg-[#B8941F] hover:cursor-pointer"
                      onClick={() => onChangeRole(user)}
                    >
                      {user.role === "admin" ? "Set as User" : "Set as Admin"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger className="w-full text-left hover:cursor-pointer p-2 text-sm rounded-lg hover:bg-accent ">
                  Reset Password
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter a new password for "{user.email}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    type="password"
                    placeholder="New password"
                    id={`reset-pw-${user.id}`}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="text-white bg-[#D4AF37] hover:bg-[#B8941F] hover:cursor-pointer"
                      onClick={() => {
                        const input = document.getElementById(
                          `reset-pw-${user.id}`
                        );
                        if (input && "value" in input)
                          onResetPassword(
                            user,
                            (input as HTMLInputElement).value
                          );
                      }}
                    >
                      Reset
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
