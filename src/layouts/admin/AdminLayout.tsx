// src/layouts/admin/AdminLayout.tsx

import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/layouts/Sidebar";
import { BottomBar } from "../../components/layouts/BottomBar";
import { Header } from "../../components/layouts/Header";
import { adminNav } from "../../navigation/adminNav";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      {/* Sidebar desktop */}
      <Sidebar items={adminNav} title="CabuAffili Admin" />

      {/* Contenu */}
      <div className="min-w-0 pt-16">
        <Header title="Administration" />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* BottomBar mobile/tablette */}
      <BottomBar items={adminNav} />
    </div>
  );
}