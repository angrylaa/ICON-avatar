import type { Route } from "./+types/home";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeUserColumns } from "../components/admin-table/columns";
import { DataTable } from "../components/admin-table/table";
import { useRequireAuth } from "../lib/useRequireAuth";
import {
  createUser as createUserApi,
  deleteUserApi,
  getAllUsers,
  type Role,
  type User,
  updateUserApi,
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
import { useNavigate } from "react-router";
import { Navbar } from "../components/custom/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTable as KnowledgeTable } from "~/components/knowledgeBase/table";
import {
  makeKnowledgeColumns,
  type knowledgeBase,
} from "~/components/knowledgeBase/columns";
import { CreateKnowledgeEntryDialog } from "../components/knowledgeBase/table";
import { getKnowledge } from "services/knowledge";
import { toast } from "sonner";

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
  useRequireAuth("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [danielKnowledge, setDanielKnowledge] = useState<knowledgeBase[]>([]);
  const [tylerKnowledge, setTylerKnowledge] = useState<knowledgeBase[]>([]);
  const [jennyKnowledge, setJennyKnowledge] = useState<knowledgeBase[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const list = await getAllUsers(); // token is now handled in the service
        setUsers(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Daniel
        const danielResult = await getKnowledge("danielknowledge");
        setDanielKnowledge(danielResult.data || []);
        // Tyler
        const tylerResult = await getKnowledge("tylerknowledge");
        setTylerKnowledge(tylerResult.data || []);
        // Jenny
        const jennyResult = await getKnowledge("jennyknowledge");
        setJennyKnowledge(jennyResult.data || []);
      } catch (e) {
        setDanielKnowledge([]);
        setTylerKnowledge([]);
        setJennyKnowledge([]);
      }
    })();
  }, []);

  const handleDelete = useCallback(async (user: User) => {
    try {
      await deleteUserApi(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success("User has been deleted.");
    } catch (e) {
      toast.error("Failed to delete user.");
      console.error(e);
    }
  }, []);

  const handleChangeRole = useCallback(async (user: User) => {
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
  }, []);

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

  const knowledgeBaseColumns = useMemo(() => makeKnowledgeColumns(), []);

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
    <>
      <Navbar />
      <div className="space-y-6 min-h-screen h-[100%] bg-[#FFF6DE] justify-center">
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
                    className="bg-[#B4933F] hover:bg-[#947627] hover:cursor-pointer"
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
          <h2 className="mt-12 mb-3 text-lg font-semibold">
            Update Knowledgebase
          </h2>
          <div className="border-[#CBB06A] border-2 bg-white p-12 rounded-xl">
            <Tabs defaultValue="account" className="w-full">
              <TabsList>
                <TabsTrigger value="tyler">Tyler</TabsTrigger>
                <TabsTrigger value="daniel">Daniel</TabsTrigger>
                <TabsTrigger value="jenny">Jenny</TabsTrigger>
              </TabsList>
              <TabsContent value="tyler">
                <CreateKnowledgeEntryDialog
                  table="tylerknowledge"
                  onCreated={async () => {
                    const tylerResult = await getKnowledge("tylerknowledge");
                    setTylerKnowledge(tylerResult.data || []);
                  }}
                />
                <KnowledgeTable
                  columns={knowledgeBaseColumns}
                  data={tylerKnowledge}
                />
              </TabsContent>
              <TabsContent value="daniel">
                <CreateKnowledgeEntryDialog
                  table="danielknowledge"
                  onCreated={async () => {
                    const danielResult = await getKnowledge("danielknowledge");
                    setDanielKnowledge(danielResult.data || []);
                  }}
                />
                <KnowledgeTable
                  columns={knowledgeBaseColumns}
                  data={danielKnowledge}
                />
              </TabsContent>
              <TabsContent value="jenny">
                <CreateKnowledgeEntryDialog
                  table="jennyknowledge"
                  onCreated={async () => {
                    const jennyResult = await getKnowledge("jennyknowledge");
                    setJennyKnowledge(jennyResult.data || []);
                  }}
                />
                <KnowledgeTable
                  columns={knowledgeBaseColumns}
                  data={jennyKnowledge}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
