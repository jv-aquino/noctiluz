import { ComponentType, ReactNode } from "react";

interface AdminHeaderProps { 
  Icon: ComponentType,  
  Paragraph: ComponentType, 
  title: string,
  children?: ReactNode,
}

function AdminHeader({ Icon, Paragraph, children, title }: AdminHeaderProps) {
  return ( 
    <>
      <div className="admin-header">
        <div className="admin-header-info">
          <Icon />
          <div>
            <h1 className="admin-title">
              {title}
            </h1>
            <p className="admin-subtitle">
              <Paragraph />
            </p>
          </div>
        </div>

        {children}
      </div>

      <div className="divisor h-0.5 bg-pink-100"></div>
    </>
   );
}

export default AdminHeader;