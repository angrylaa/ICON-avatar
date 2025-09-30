import React from "react";
import { Users, BookOpen, Activity, TrendingUp } from "lucide-react";
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
  jennyKnowledge 
}: OverviewProps) {
  const totalKnowledgeEntries = danielKnowledge.length + tylerKnowledge.length + jennyKnowledge.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const regularUsers = users.filter(user => user.role === 'user').length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Knowledge Entries",
      value: totalKnowledgeEntries,
      change: "+8%",
      changeType: "positive" as const,
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: "Admin Users",
      value: adminUsers,
      change: "0%",
      changeType: "neutral" as const,
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "System Health",
      value: "98.5%",
      change: "+0.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const knowledgeBreakdown = [
    { name: "Tyler", count: tylerKnowledge.length, color: "bg-blue-500" },
    { name: "Daniel", count: danielKnowledge.length, color: "bg-green-500" },
    { name: "Jenny", count: jennyKnowledge.length, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the admin panel. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-[#CBB06A] shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Breakdown */}
        <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admin Users</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#B4933F] h-2 rounded-full"
                    style={{ width: `${(adminUsers / users.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{adminUsers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Regular Users</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#CBB06A] h-2 rounded-full"
                    style={{ width: `${(regularUsers / users.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{regularUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Base Breakdown */}
        <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base Distribution</h3>
          <div className="space-y-4">
            {knowledgeBreakdown.map((kb, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${kb.color}`}></div>
                  <span className="text-sm text-gray-600">{kb.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${kb.color} h-2 rounded-full`}
                      style={{ width: `${totalKnowledgeEntries > 0 ? (kb.count / totalKnowledgeEntries) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{kb.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">System is running smoothly</span>
            <span className="text-xs text-gray-400 ml-auto">2 minutes ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Knowledge base updated</span>
            <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600">New user registered</span>
            <span className="text-xs text-gray-400 ml-auto">3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}