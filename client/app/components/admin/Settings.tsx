import React from "react";
import { Settings as SettingsIcon, Shield, Database, Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

export function Settings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#B4933F] rounded-lg">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
          <div className="mt-2 text-sm text-[#B4933F] font-medium">
            ✓ Settings section is active
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm">
        <div className="p-6 border-b border-[#CBB06A]">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#B4933F]" />
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Configure security and authentication settings</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <Input 
                type="number" 
                defaultValue="30" 
                className="border-[#CBB06A] focus:border-[#B4933F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <Input 
                type="number" 
                defaultValue="5" 
                className="border-[#CBB06A] focus:border-[#B4933F]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
            </div>
            <Button variant="outline" className="border-[#CBB06A]">
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm">
        <div className="p-6 border-b border-[#CBB06A]">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#B4933F]" />
            <h2 className="text-lg font-semibold text-gray-900">Database Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Manage database configuration and backups</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-[#B4933F] hover:bg-[#947627] text-white">
              Create Backup
            </Button>
            <Button variant="outline" className="border-[#CBB06A]">
              Restore Backup
            </Button>
            <Button variant="outline" className="border-[#CBB06A]">
              Optimize Database
            </Button>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Backup Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select className="w-full p-2 border border-[#CBB06A] rounded-md focus:border-[#B4933F] focus:outline-none">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retention Period (days)
                </label>
                <Input 
                  type="number" 
                  defaultValue="30" 
                  className="border-[#CBB06A] focus:border-[#B4933F]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm">
        <div className="p-6 border-b border-[#CBB06A]">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#B4933F]" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Configure system notifications and alerts</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { title: "User Registration", description: "Notify when new users register" },
            { title: "System Errors", description: "Alert on critical system errors" },
            { title: "Database Backups", description: "Confirm successful backups" },
            { title: "Security Alerts", description: "Notify on security events" },
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{setting.title}</h3>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B4933F]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B4933F]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-[#B4933F] hover:bg-[#947627] text-white px-8">
          Save Settings
        </Button>
      </div>
    </div>
  );
}