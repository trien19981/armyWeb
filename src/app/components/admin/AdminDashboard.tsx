import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Shield, LogOut, LayoutDashboard, Building2, Users, FileText, Menu, X } from 'lucide-react';
import { BattalionManagement } from './BattalionManagement';
import { CompanyManagement } from './CompanyManagement';
import { PlatoonManagement } from './PlatoonManagement';
import { RequestManagement } from './RequestManagement';
import { Overview } from './Overview';

type AdminScreen = 'overview' | 'battalions' | 'companies' | 'platoons' | 'requests';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview' as AdminScreen, label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'requests' as AdminScreen, label: 'Quản Lý Đơn', icon: FileText },
    { id: 'battalions' as AdminScreen, label: 'Quản Lý Tiểu Đoàn', icon: Building2 },
    { id: 'companies' as AdminScreen, label: 'Quản Lý Đại Đội', icon: Building2 },
    { id: 'platoons' as AdminScreen, label: 'Quản Lý Trung Đội', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div className="flex-1">
              <h2 className="font-bold">Admin Portal</h2>
              <p className="text-xs text-slate-400">Quản Trị Hệ Thống</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full bg-transparent text-white border-slate-600 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng Xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                {menuItems.find(item => item.id === currentScreen)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {currentScreen === 'overview' && <Overview />}
          {currentScreen === 'battalions' && <BattalionManagement />}
          {currentScreen === 'companies' && <CompanyManagement />}
          {currentScreen === 'platoons' && <PlatoonManagement />}
          {currentScreen === 'requests' && <RequestManagement />}
        </main>
      </div>
    </div>
  );
}
