import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Building2,
  LayoutDashboard,
  Folder,
  Users,
  Building,
  Trash2,
  Clock,
  Star,
  Settings,
  LogOut,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const employeeMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Tài liệu', url: '/resources', icon: Folder },
  { title: 'Gần đây', url: '/recent', icon: Clock },
  { title: 'Yêu thích', url: '/favorites', icon: Star },
  { title: 'Thùng rác', url: '/trash', icon: Trash2 },
];

const adminMenuItems = [
  { title: 'Quản lý Users', url: '/admin/users', icon: Users },
  { title: 'Phòng ban', url: '/admin/departments', icon: Building },
  { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isAdmin = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold">CRMS</div>
            <div className="text-xs text-muted-foreground">
              {isAdmin ? 'Admin' : 'Employee'}
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin ? 'Quản trị' : 'Cá nhân'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(isAdmin ? adminMenuItems : employeeMenuItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Không gian</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate('/company')}
                      isActive={location.pathname === '/company'}
                    >
                      <Building className="h-4 w-4" />
                      <span>Công ty</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate('/departments')}
                      isActive={location.pathname === '/departments'}
                    >
                      <Users className="h-4 w-4" />
                      <span>Phòng ban</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Cài đặt
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
