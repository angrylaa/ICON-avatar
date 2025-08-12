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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin" }, { name: "description", content: "Admin Panel" }];
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "The pasword must have at least 8 characters" }),
  role: z.union([z.literal("user"), z.literal("admin")]),
});

export default function Admin() {
  const ok = useRequireAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || undefined
      : undefined;

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
    <div className="space-y-6 h-screen bg-[#FFF6DE] justify-center overflow-hidden">
      <div className="rounded-md mx-auto max-w-300 p-12">
        <h2 className="mb-3 text-lg font-semibold">Create User</h2>
        <div className="border-[#CBB06A] border-2 bg-white p-12 rounded-xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white border-[#CBB06A]"
                        placeholder="user@example.com"
                        {...field}
                      />
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
                      <Input
                        className="bg-white border-[#CBB06A]"
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-[#CBB06A]">
                          <SelectValue placeholder="Select the user's role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-4 flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#CBB06A]"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <h2 className="mt-12 mb-3 text-lg font-semibold">View Userbase</h2>
        <div className="border-[#CBB06A] border-2 bg-white p-12 rounded-xl">
          <DataTable columns={columns} data={users} />
        </div>
      </div>
    </div>
  );
}
