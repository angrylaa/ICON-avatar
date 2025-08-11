import type { Route } from "./+types/home";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeUserColumns } from "../components/admin-table/columns";
import { DataTable } from "../components/admin-table/table";
import { useRequireAdmin } from "../lib/useRequireAdmin";
import {
  createUser as createUserApi,
  deleteUserApi,
  getAllUsers,
  type Role,
  type User,
} from "services/user";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin" }, { name: "description", content: "Admin Panel" }];
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.union([z.literal("user"), z.literal("admin")]),
});

export default function Admin() {
  const ok = useRequireAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined;

  useEffect(() => {
    if (!ok) return;
    (async () => {
      try {
        const list = await getAllUsers(token);
        setUsers(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [ok, token]);

  const handleDelete = useCallback(
    async (user: User) => {
      try {
        await deleteUserApi(user.id, token);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } catch (e) {
        console.error(e);
      }
    },
    [token]
  );

  const columns = useMemo(() => makeUserColumns(handleDelete), [handleDelete]);

  const form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: { email: "", password: "", role: "user" as Role },
  });

  async function onSubmit(values: z.infer<typeof CreateUserSchema>) {
    try {
      setLoading(true);
      const { user } = await createUserApi(values);
      setUsers((prev) => [user, ...prev]);
      form.reset({ email: "", password: "", role: "user" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!ok) return null;

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="rounded-md border p-4">
        <h2 className="mb-3 text-lg font-semibold">Create User</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as Role)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
}
