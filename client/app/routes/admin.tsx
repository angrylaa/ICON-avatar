import type { Route } from "./+types/home";
import React, { useEffect, useState } from "react";
import { useRequireAuth } from "../lib/useRequireAuth";
import {
  getAllUsers,
  type User,
} from "services/user";
import { useNavigate } from "react-router";
import { Navbar } from "../components/custom/Navbar";
import {
  type knowledgeBase,
} from "~/components/knowledgeBase/columns";
import { getKnowledge } from "services/knowledge";
import { AdminLayout } from "../components/admin/AdminLayout";
import { Overview } from "../components/admin/Overview";
import { UserManagement } from "../components/admin/UserManagement";
import { KnowledgeBase } from "../components/admin/KnowledgeBase";
import { Toaster } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin" }, { name: "description", content: "Admin Panel" }];
}

export default function Admin() {
  useRequireAuth("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [danielKnowledge, setDanielKnowledge] = useState<knowledgeBase[]>([]);
  const [tylerKnowledge, setTylerKnowledge] = useState<knowledgeBase[]>([]);
  const [jennyKnowledge, setJennyKnowledge] = useState<knowledgeBase[]>([]);
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <Overview
            users={users}
            danielKnowledge={danielKnowledge}
            tylerKnowledge={tylerKnowledge}
            jennyKnowledge={jennyKnowledge}
          />
        );
      case "users":
        return <UserManagement users={users} setUsers={setUsers} />;
      case "knowledge":
        return (
          <KnowledgeBase
            danielKnowledge={danielKnowledge}
            tylerKnowledge={tylerKnowledge}
            jennyKnowledge={jennyKnowledge}
            setDanielKnowledge={setDanielKnowledge}
            setTylerKnowledge={setTylerKnowledge}
            setJennyKnowledge={setJennyKnowledge}
          />
        );
      default:
        return (
          <Overview
            users={users}
            danielKnowledge={danielKnowledge}
            tylerKnowledge={tylerKnowledge}
            jennyKnowledge={jennyKnowledge}
          />
        );
    }
  };

  return (
    <>
      <Navbar />
      <AdminLayout 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
      >
        {renderActiveSection()}
      </AdminLayout>
      <Toaster />
    </>
  );
}
