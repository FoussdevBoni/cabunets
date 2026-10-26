// src/components/layouts/Layout.tsx

import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { BottomBar } from "./BottomBar";
import { Header } from "./Header";
import type { NavItem } from "../../navigation/affiliateNav";

interface LayoutProps {
  title: string;
  appTitle: string;
  items: NavItem[];
  headerTitle: string;
}

export function Layout({ appTitle, items, headerTitle }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (desktop uniquement) */}
      <Sidebar items={items} title={appTitle} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={headerTitle} />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* BottomBar (mobile + tablette) */}
      <BottomBar items={items} />
    </div>
  );
}