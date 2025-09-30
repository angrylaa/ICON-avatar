import { type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminLayout({
  children,
  activeSection,
  onSectionChange,
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F4E4BC] pt-4">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
