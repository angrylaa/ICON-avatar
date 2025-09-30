import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Users } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createUser as createUserApi,
  deleteUserApi,
  updateUserApi,
  type Role,
  type User,
} from "services/user";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { makeUserColumns } from "../admin-table/columns";
import { DataTable } from "../admin-table/table";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "The password must have at least 8 characters" }),
  role: z.union([z.literal("user"), z.literal("admin")]),
});

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export function UserManagement({ users, setUsers }: UserManagementProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(
    async (user: User) => {
      try {
        await deleteUserApi(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast.success("User has been deleted.");
      } catch (e) {
        toast.error("Failed to delete user.");
        console.error(e);
      }
    },
    [setUsers]
  );

  const handleChangeRole = useCallback(
    async (user: User) => {
      try {
        const newRole = user.role === "admin" ? "user" : "admin";
        await updateUserApi(user.id, { role: newRole });
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        toast.success(`User role changed to ${newRole}.`);
      } catch (e) {
        toast.error("Failed to change user role.");
        console.error(e);
      }
    },
    [setUsers]
  );

  const handleResetPassword = useCallback(
    async (user: User, newPassword: string) => {
      try {
        await updateUserApi(user.id, { password: newPassword });
        toast.success("Password has been reset.");
      } catch (e) {
        toast.error("Failed to reset password.");
        console.error(e);
      }
    },
    []
  );

  const columns = useMemo(
    () => makeUserColumns(handleDelete, handleChangeRole, handleResetPassword),
    [handleDelete, handleChangeRole, handleResetPassword]
  );

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
      toast.success("User has been created.");
    } catch (e) {
      toast.error("Failed to create user.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#D4AF37] rounded-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#4f2e1b]">User Management</h1>
          <p className="text-[#4f2e1b]">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Create User Section */}
      <div className="bg-white rounded-xl border border-[#E6C547] shadow-sm">
        <div className="p-6 border-b border-[#E6C547]">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-[#4f2e1b]">
              Create New User
            </h2>
          </div>
          <p className="text-sm text-[#4f2e1b] mt-1">
            Add a new user to the system
          </p>
        </div>
        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white border-[#E6C547] focus:border-[#D4AF37]"
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
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white border-[#E6C547] focus:border-[#D4AF37]"
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
                        <SelectTrigger className="bg-white border-[#E6C547] focus:border-[#D4AF37]">
                          <SelectValue placeholder="Select role" />
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
              <div className="md:col-span-3 flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-6"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="bg-white rounded-xl border border-[#E6C547] shadow-sm">
        <div className="p-6 border-b border-[#E6C547]">
          <h2 className="text-lg font-semibold text-[#4f2e1b]">All Users</h2>
          <p className="text-sm text-[#4f2e1b] mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} in the system
          </p>
        </div>
        <div className="p-6">
          <DataTable columns={columns} data={users} />
        </div>
      </div>
    </div>
  );
}
