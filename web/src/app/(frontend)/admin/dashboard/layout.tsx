import './admin.css'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./components/sidebar/AdminSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex w-full">
        <SidebarTrigger className='m-1' iconClassName="size-5" />
        <main className="admin-container">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}