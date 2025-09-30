import { Activity, BookOpen, Users } from "lucide-react";
import type { User } from "services/user";
import type { knowledgeBase } from "~/components/knowledgeBase/columns";

interface OverviewProps {
  users: User[];
  danielKnowledge: knowledgeBase[];
  tylerKnowledge: knowledgeBase[];
  jennyKnowledge: knowledgeBase[];
}

export function Overview({
  users,
  danielKnowledge,
  tylerKnowledge,
  jennyKnowledge,
}: OverviewProps) {
  const totalKnowledgeEntries =
    danielKnowledge.length + tylerKnowledge.length + jennyKnowledge.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const regularUsers = users.filter((user) => user.role === "user").length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-[#B8941F]",
    },
    {
      title: "Knowledge Entries",
      value: totalKnowledgeEntries,
      icon: BookOpen,
      color: "bg-[#B8941F]",
    },
    {
      title: "Admin Users",
      value: adminUsers,
      icon: Activity,
      color: "bg-[#B8941F]",
    },
  ];

  const knowledgeBreakdown = [
    { name: "Tyler", count: tylerKnowledge.length, color: "bg-[#B8941F]" },
    { name: "Daniel", count: danielKnowledge.length, color: "bg-[#B8941F]" },
    { name: "Jenny", count: jennyKnowledge.length, color: "bg-[#B8941F]" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#D4AF37] rounded-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#4f2e1b]">Overview</h1>
          <p className="text-[#4f2e1b]">Welcome to the admin panel.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-[#E6C547] shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#4f2e1b]">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[#4f2e1b] mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-[#E6C547] shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#4f2e1b] mb-4">
            User Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4f2e1b]">Admin Users</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#D4AF37] h-2 rounded-full"
                    style={{ width: `${(adminUsers / users.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-[#4f2e1b]">
                  {adminUsers}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4f2e1b]">Regular Users</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#E6C547] h-2 rounded-full"
                    style={{ width: `${(regularUsers / users.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-[#4f2e1b]">
                  {regularUsers}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Base Breakdown */}
        <div className="bg-white rounded-xl border border-[#E6C547] shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#4f2e1b] mb-4">
            Knowledge Base Distribution
          </h3>
          <div className="space-y-4">
            {knowledgeBreakdown.map((kb, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${kb.color}`}></div>
                  <span className="text-sm text-[#4f2e1b]">{kb.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${kb.color} h-2 rounded-full`}
                      style={{
                        width: `${totalKnowledgeEntries > 0 ? (kb.count / totalKnowledgeEntries) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-[#4f2e1b]">
                    {kb.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
