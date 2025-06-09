'use client'
import { SidebarMenu } from "@/components/ui/sidebar";
import { items } from "./items";
import { usePathname } from "next/navigation";
import AdminLink from "./AdminLink";

function AdminMenuList() {
  const pathname = usePathname();
  
  return ( 
    <SidebarMenu>
      {items.map((item) => (
        <AdminLink key={item.title} item={item} pathname={pathname} />
      ))}
    </SidebarMenu>
   );
}

export default AdminMenuList;