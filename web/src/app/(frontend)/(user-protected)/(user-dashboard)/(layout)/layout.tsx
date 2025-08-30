import { ReactNode } from "react";
import UserDashboardSidebar from "../UserDashboardSidebar";

function UserDashboardLayout({ children }: { children: ReactNode}) {
  return ( 
    <div className="flex h-screen bg-pink-100">
      <UserDashboardSidebar />

      {children}
    </div>
   );
}

export default UserDashboardLayout;