import { SidebarMenuItem, SidebarMenuButton, SidebarMenu } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AdminLink from "./AdminLink";
import { items } from "./items";

function AdminMenuList() {
  return ( 
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title} className={cn("pr-7", item.marginTop && 'mt-2')}>
          <SidebarMenuButton asChild className="pl-7 rounded-l-none">
            <AdminLink item={item} selected={false} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
   );
}

export default AdminMenuList;