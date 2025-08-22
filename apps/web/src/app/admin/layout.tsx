'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  MapPin, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Bell,
  Search,
  User,
  ChevronDown,
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Receipt,
  Plus,
  Filter,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Definir elementos de navegación con control de roles
const getAllSidebarItems = (userRole: string) => {
  const baseItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: Home,
      description: 'Panel principal',
      badge: null,
      roles: ['admin', 'professional', 'reception']
    }
  ];

  const adminItems = [
    {
      title: 'Pacientes',
      href: '/admin/patients',
      icon: Users,
      description: 'Gestión de pacientes',
      badge: null,
      roles: ['admin', 'professional', 'reception']
    },
    {
      title: 'Profesionales',
      href: '/admin/professionals',
      icon: UserCheck,
      description: 'Gestión de profesionales',
      badge: null,
      roles: ['admin']
    },
    {
      title: 'Servicios',
      href: '/admin/services',
      icon: Briefcase,
      description: 'Gestión de servicios',
      badge: null,
      roles: ['admin']
    },
    {
      title: 'Salas',
      href: '/admin/rooms',
      icon: MapPin,
      description: 'Gestión de salas',
      badge: null,
      roles: ['admin']
    }
  ];

  const commonItems = [
    {
      title: 'Calendario',
      href: '/admin/calendar',
      icon: Calendar,
      description: 'Gestión de citas',
      badge: { text: '3', variant: 'secondary' as const },
      roles: ['admin', 'professional', 'reception']
    },
    {
      title: 'Facturas',
      href: '/admin/invoices',
      icon: Receipt,
      description: 'Gestión de facturas',
      badge: null,
      roles: ['admin', 'reception']
    },
    {
      title: 'Pagos',
      href: '/admin/payments',
      icon: CreditCard,
      description: 'Gestión de pagos',
      badge: null,
      roles: ['admin', 'reception']
    },
    {
      title: 'Formularios',
      href: '/admin/forms',
      icon: FileText,
      description: 'Formularios dinámicos',
      badge: null,
      roles: ['admin', 'professional']
    },
    {
      title: 'Estadísticas',
      href: '/admin/stats',
      icon: BarChart3,
      description: 'Reportes y estadísticas',
      badge: null,
      roles: ['admin', 'professional', 'reception']
    },
    {
      title: 'Configuración',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configuración del sistema',
      badge: null,
      roles: ['admin']
    }
  ];

  const allItems = [...baseItems, ...adminItems, ...commonItems];
  return allItems.filter(item => item.roles.includes(userRole));
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar autenticación usando cookies (consistente con auth-context)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
    
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // Verificar que el usuario tenga permisos de administración
      if (!['admin', 'professional', 'reception'].includes(parsedUser.role)) {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    // Limpiar cookies
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    router.push('/auth/login');
  };

  const getCurrentPageTitle = () => {
    if (!user) return 'Administración';
    const sidebarItems = getAllSidebarItems(user.role);
    // Tratar /admin como /admin/dashboard para el título
    const currentPath = pathname === '/admin' ? '/admin/dashboard' : pathname;
    const currentItem = sidebarItems.find(item => item.href === currentPath);
    return currentItem?.title || 'Administración';
  };

  const getCurrentPageDescription = () => {
    if (!user) return 'Panel de administración';
    const sidebarItems = getAllSidebarItems(user.role);
    // Tratar /admin como /admin/dashboard para la descripción
    const currentPath = pathname === '/admin' ? '/admin/dashboard' : pathname;
    const currentItem = sidebarItems.find(item => item.href === currentPath);
    return currentItem?.description || 'Panel de administración';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = getAllSidebarItems(user.role);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        {/* Sidebar Compacto y Fijo */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header del Sidebar - Logo Fijo */}
          <div className="flex-shrink-0 border-b border-slate-200">
            <Link href="/admin/dashboard" className="block">
              <div className={cn(
                "flex items-center h-14 transition-all duration-300 hover:bg-slate-50",
                sidebarCollapsed ? "px-2 justify-center" : "px-4 space-x-3"
              )}>
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base font-bold text-slate-900 truncate">apsicologia</h1>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {user.role === 'admin' ? 'Panel Admin' : user.role === 'professional' ? 'Panel Profesional' : 'Panel Recepción'}
                    </p>
                  </div>
                )}
              </div>
            </Link>
            
            {/* Botón collapse - posicionado fuera del header */}
            <div className={cn(
              "absolute top-4 border border-slate-200 bg-white rounded-full shadow-sm transition-all duration-300 z-10",
              sidebarCollapsed ? "-right-3" : "-right-3"
            )}>
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex hover:bg-slate-100 h-6 w-6 p-0"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <ChevronLeft className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  sidebarCollapsed && "rotate-180"
                )} />
              </Button>
            </div>
            
            {/* Botón cerrar móvil */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden absolute top-2 right-2 hover:bg-slate-100 h-8 w-8 p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        
          {/* Navegación - Scrollable */}
          <ScrollArea className="flex-1">
            <nav className={cn(
              "space-y-1 transition-all duration-300",
              sidebarCollapsed ? "p-2" : "p-3"
            )}>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                // Tratar /admin como /admin/dashboard para el estado activo
                const currentPath = pathname === '/admin' ? '/admin/dashboard' : pathname;
                const isActive = currentPath === item.href;
                
                const NavItem = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-lg transition-all duration-200 relative",
                      sidebarCollapsed ? "justify-center p-2 h-10" : "px-3 py-2 h-10",
                      isActive
                        ? "bg-gradient-to-r from-primary via-primary to-accent text-white shadow-md shadow-primary/30 ring-1 ring-primary/20"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center min-w-0",
                      sidebarCollapsed ? "justify-center" : "flex-1 space-x-3"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4 transition-colors shrink-0",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                      )} />
                      {!sidebarCollapsed && (
                        <span className="font-medium text-sm truncate">{item.title}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : item.badge.variant}
                        className={cn(
                          "text-xs h-5 px-1.5",
                          isActive && "bg-white/20 text-white hover:bg-white/30"
                        )}
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                    {sidebarCollapsed && item.badge && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></div>
                    )}
                  </Link>
                );

                return sidebarCollapsed ? (
                  <Tooltip key={item.href} delayDuration={300}>
                    <TooltipTrigger asChild>
                      {NavItem}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : NavItem;
              })}
            </nav>
          </ScrollArea>
        
          {/* Usuario y Logout - Sticky Bottom */}
          <div className="flex-shrink-0 border-t border-slate-200">
            <div className={cn(
              "transition-all duration-300",
              sidebarCollapsed ? "p-2" : "p-3"
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn(
                    "w-full h-auto hover:bg-slate-100 transition-all duration-200 rounded-lg",
                    sidebarCollapsed ? "p-2 justify-center h-10" : "p-2 justify-start h-12"
                  )}>
                    <div className={cn(
                      "flex items-center w-full",
                      sidebarCollapsed ? "justify-center" : "space-x-3"
                    )}>
                      <Avatar className={cn(
                        "ring-2 ring-primary/20 shrink-0",
                        sidebarCollapsed ? "h-6 w-6" : "h-8 w-8"
                      )}>
                        <AvatarImage src="" alt={user.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-xs">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {!sidebarCollapsed && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <Badge variant="outline" className="text-xs capitalize mt-0.5">
                              <Shield className="h-2.5 w-2.5 mr-1" />
                              {user.role}
                            </Badge>
                          </div>
                          <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
                        </>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={sidebarCollapsed ? "center" : "end"} className="w-52">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Funcional - Sticky */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-slate-100 h-8 w-8 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {getCurrentPageTitle()}
                </h2>
                <p className="text-xs text-slate-600">
                  {getCurrentPageDescription()}
                </p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center space-x-2">
                <Button size="sm" className="h-8">
                  <Plus className="h-3 w-3 mr-1" />
                  Nuevo
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Búsqueda Inteligente */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-64 justify-start text-slate-500 hover:text-slate-900">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar en el sistema...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Buscar pacientes, citas, profesionales..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                    <CommandGroup heading="Pacientes">
                      <CommandItem>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Ana Martínez</span>
                      </CommandItem>
                      <CommandItem>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Miguel Fernández</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Citas">
                      <CommandItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Cita con Ana - Hoy 15:00</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {/* Notificaciones */}
            <Button variant="ghost" size="sm" className="relative hover:bg-slate-100 h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-red-500 hover:bg-red-600 border-white border">
                3
              </Badge>
            </Button>
          </div>
        </div>
          </header>

          {/* Contenido */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100/30">
            <div className="p-6 space-y-6 mx-auto h-full w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}