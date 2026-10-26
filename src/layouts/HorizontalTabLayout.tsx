import { ReactNode } from "react";
import HorizontalTab, { TabItem } from "../components/ui/HorizontalTab";

interface HorizontalTabLayoutProps {
  children: ReactNode;
  tabs: TabItem[];
  onChange: (value: string)=>void,
  activeTab: string
}

export default function HorizontalTabLayout({ children, tabs , onChange , activeTab }: HorizontalTabLayoutProps) {

 



  if (tabs.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <HorizontalTab
              tabItems={tabs}
              onChange={onChange}
              defaultValue={activeTab}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}