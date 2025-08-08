import type { Route } from "./+types/home";
import { useRequireAdmin } from "~/lib/useRequireAdmin";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers, type User, type Role, createUser, deleteUserApi } from "services/user";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin" }, { name: "description", content: "Admin Panel" }];
}

const columnHelper = createColumnHelper<User>();

export default function Admin() {
  const isReady = useRequireAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("user");

  useEffect(() => {
    if (!isReady) return;
    void refresh();
  }, [isReady]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || undefined;
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate() {
    if (!newEmail || !newPassword) return;
    setLoading(true);
    setError(null);
    try {
      await createUser({ email: newEmail, password: newPassword, role: newRole });
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || undefined;
      await deleteUserApi(id, token);
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: () => "Email",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("role", {
        header: () => "Role",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Created",
        cell: (info) => (info.getValue() ? new Date(info.getValue()!).toLocaleString() : ""),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => onDelete(row.original.id)}
          >
            Delete
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() });

  if (!isReady) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#B4933F]">Admin Users</h1>
        <p className="text-sm text-muted-foreground">Manage users, create and delete accounts.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <Input
          placeholder="Email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <select
          className="border rounded-md h-10 px-2"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as Role)}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <Button
          className="bg-[#B4933F] hover:bg-[#947627]"
          disabled={loading}
          onClick={onCreate}
        >
          {loading ? "Processing..." : "Create User"}
        </Button>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loading ? "Loading..." : "No results"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
