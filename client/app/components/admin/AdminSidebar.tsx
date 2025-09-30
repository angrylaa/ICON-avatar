import { BookOpen, ChevronLeft, ChevronRight, Home, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
      description: "Dashboard overview",
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      description: "Manage users and roles",
    },
    {
      id: "knowledge",
      label: "Knowledge Base",
      icon: BookOpen,
      description: "Manage knowledge entries",
    },
  ];

  return (
    <div
      className={`bg-white border-r border-[#E6C547] ${collapsed ? "w-fit" : "w-64"} min-h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E6C547]">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-[#D4AF37]">
              Admin Panel
            </h2>
          )}
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggleCollapse();
            }}
            className="p-2 hover:bg-[#CBAC46] rounded-md transition-colors cursor-pointer bg-[#B8941F]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Button
                key={item.id}
                className={`w-full flex items-center justify-start gap-3 h-12 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#B8941F] text-white hover:bg-[#CBAC46]"
                    : "hover:bg-[#F4E4BC] text-gray-700 bg-transparent"
                } ${collapsed ? "px-2" : "px-4"}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSectionChange(item.id);
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs opacity-70">
                      {item.description}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E6C547]">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            Admin Dashboard v1.0
          </div>
        )}
      </div>
    </div>
  );
}
