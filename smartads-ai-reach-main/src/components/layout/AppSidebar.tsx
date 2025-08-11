import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  DollarSign,
  UserCheck,
  BarChart3,
  FileText,
  Settings,
  Menu,
  Truck
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Campaigns', url: '/campaigns', icon: Target },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Expenses', url: '/expenses', icon: DollarSign },
  { title: 'Leads', url: '/leads', icon: UserCheck },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

const adminItems = [
  { title: 'Clients', url: '/clients', icon: Users },
  { title: 'Vendors', url: '/vendors', icon: Truck },
  { title: 'User Management', url: '/users', icon: Settings },
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-sidebar-primary text-white font-medium border-l-2 border-sidebar-primary' 
      : 'text-gray-900';

  const canAccessAdmin = profile?.role === 'admin' || profile?.role === 'manager';
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar-background">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-sidebar-primary">SmartAds BTL</h2>
        )}
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
      </div>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground font-semibold text-xs uppercase tracking-wider px-4 py-2">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canAccessAdmin && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground font-semibold text-xs uppercase tracking-wider px-4 py-2 mt-4">
                Administration
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="ml-3">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};