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
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base64ToImageUrl, generateInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

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
      roles: ['admin', 'reception']
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
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait for auth context to load
    
    if (!isAuthenticated || !user) {
      // Store current URL for redirect after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      }
      router.push('/auth/login');
      return;
    }

    // Verificar que el usuario tenga permisos de administración
    if (!['admin', 'professional', 'reception'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading while auth is initializing
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    // Limpiar cookies
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    router.push('/auth/login');
  };

  const getBreadcrumbs = () => {
    if (!user) return [{ title: 'Administración', href: '/admin/dashboard' }];
    
    const sidebarItems = getAllSidebarItems(user.role);
    const breadcrumbs = [{ title: 'Admin', href: '/admin/dashboard' }];
    
    // Tratar /admin como /admin/dashboard
    const currentPath = pathname === '/admin' ? '/admin/dashboard' : pathname;
    
    // Casos especiales para rutas anidadas
    if (currentPath.startsWith('/admin/patients/')) {
      breadcrumbs.push({ title: 'Pacientes', href: '/admin/patients' });
      
      if (currentPath.includes('/edit')) {
        breadcrumbs.push({ title: 'Editar Paciente', href: currentPath });
      } else if (currentPath === '/admin/patients/new' || currentPath === '/admin/patients/create') {
        breadcrumbs.push({ title: 'Nuevo Paciente', href: currentPath });
      } else if (currentPath.match(/^\/admin\/patients\/[^\/]+$/)) {
        breadcrumbs.push({ title: 'Ver Paciente', href: currentPath });
      }
    } else if (currentPath.startsWith('/admin/professionals/')) {
      breadcrumbs.push({ title: 'Profesionales', href: '/admin/professionals' });
      
      if (currentPath.includes('/edit')) {
        breadcrumbs.push({ title: 'Editar Profesional', href: currentPath });
      } else if (currentPath === '/admin/professionals/new' || currentPath === '/admin/professionals/create') {
        breadcrumbs.push({ title: 'Nuevo Profesional', href: currentPath });
      } else if (currentPath.match(/^\/admin\/professionals\/[^\/]+$/)) {
        breadcrumbs.push({ title: 'Ver Profesional', href: currentPath });
      }
    } else if (currentPath.startsWith('/admin/services/')) {
      breadcrumbs.push({ title: 'Servicios', href: '/admin/services' });
      
      if (currentPath.includes('/edit')) {
        breadcrumbs.push({ title: 'Editar Servicio', href: currentPath });
      } else if (currentPath === '/admin/services/new' || currentPath === '/admin/services/create') {
        breadcrumbs.push({ title: 'Nuevo Servicio', href: currentPath });
      } else if (currentPath.match(/^\/admin\/services\/[^\/]+$/)) {
        breadcrumbs.push({ title: 'Ver Servicio', href: currentPath });
      }
    } else if (currentPath.startsWith('/admin/rooms/')) {
      breadcrumbs.push({ title: 'Salas', href: '/admin/rooms' });
      
      if (currentPath.includes('/edit')) {
        breadcrumbs.push({ title: 'Editar Sala', href: currentPath });
      } else if (currentPath === '/admin/rooms/new' || currentPath === '/admin/rooms/create') {
        breadcrumbs.push({ title: 'Nueva Sala', href: currentPath });
      } else if (currentPath.match(/^\/admin\/rooms\/[^\/]+$/)) {
        breadcrumbs.push({ title: 'Ver Sala', href: currentPath });
      }
    } else if (currentPath.startsWith('/admin/appointments/')) {
      breadcrumbs.push({ title: 'Citas', href: '/admin/calendar' });
      
      if (currentPath.includes('/edit')) {
        breadcrumbs.push({ title: 'Editar Cita', href: currentPath });
      } else if (currentPath === '/admin/appointments/new' || currentPath === '/admin/appointments/create') {
        breadcrumbs.push({ title: 'Nueva Cita', href: currentPath });
      } else if (currentPath.match(/^\/admin\/appointments\/[^\/]+$/)) {
        breadcrumbs.push({ title: 'Ver Cita', href: currentPath });
      }
    } else {
      // Buscar en los elementos de la sidebar para rutas principales
      const currentItem = sidebarItems.find(item => item.href === currentPath);
      if (currentItem && currentItem.href !== '/admin/dashboard') {
        breadcrumbs.push({ title: currentItem.title, href: currentItem.href });
      }
    }
    
    return breadcrumbs;
  };

  const getCurrentPageTitle = () => {
    const breadcrumbs = getBreadcrumbs();
    return breadcrumbs[breadcrumbs.length - 1]?.title || 'Administración';
  };

  const getCurrentPageDescription = () => {
    if (!user) return 'Panel de administración';
    const sidebarItems = getAllSidebarItems(user.role);
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
        
          {/* Botón Volver al Inicio - Sticky Bottom */}
          <div className="flex-shrink-0 border-t border-slate-200">
            <div className={cn(
              "transition-all duration-300",
              sidebarCollapsed ? "p-2" : "p-3"
            )}>
              <Tooltip delayDuration={sidebarCollapsed ? 300 : 0}>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full h-auto hover:bg-slate-100 transition-all duration-200 rounded-lg text-slate-700 hover:text-slate-900",
                        sidebarCollapsed ? "p-2 justify-center h-10" : "p-2 justify-start h-12"
                      )}
                    >
                      <div className={cn(
                        "flex items-center w-full",
                        sidebarCollapsed ? "justify-center" : "space-x-3"
                      )}>
                        <Home className={cn(
                          "shrink-0 text-slate-500",
                          sidebarCollapsed ? "h-5 w-5" : "h-5 w-5"
                        )} />
                        {!sidebarCollapsed && (
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium truncate">
                              Volver al Inicio
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              Página principal
                            </p>
                          </div>
                        )}
                      </div>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    <p className="font-medium">Volver al Inicio</p>
                    <p className="text-xs text-muted-foreground">Ir a la página principal</p>
                  </TooltipContent>
                )}
              </Tooltip>
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
          {/* Header Limpio y Funcional */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4">
              {/* Lado izquierdo: Menú móvil + Breadcrumb */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-slate-100 h-9 w-9 p-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center text-sm">
                  {getBreadcrumbs().map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center">
                      {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
                      )}
                      {index === getBreadcrumbs().length - 1 ? (
                        <span className="text-slate-900 font-semibold truncate max-w-48">
                          {crumb.title}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="text-slate-500 hover:text-slate-700 font-medium transition-colors truncate max-w-32"
                        >
                          {crumb.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              
              {/* Lado derecho: Búsqueda + Notificaciones + Usuario */}
              <div className="flex items-center space-x-4">
                {/* Búsqueda Global */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-72 justify-start text-slate-500 hover:text-slate-700 bg-slate-50/50 border-slate-200 hover:bg-slate-100"
                    >
                      <Search className="h-4 w-4 mr-3" />
                      <span className="font-normal">Buscar pacientes, citas...</span>
                      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Buscar en toda la plataforma..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup heading="Accesos rápidos">
                          <CommandItem>
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            <span>Todos los pacientes</span>
                            <kbd className="ml-auto text-xs text-muted-foreground">⌘P</kbd>
                          </CommandItem>
                          <CommandItem>
                            <Calendar className="mr-2 h-4 w-4 text-accent" />
                            <span>Calendario de citas</span>
                            <kbd className="ml-auto text-xs text-muted-foreground">⌘C</kbd>
                          </CommandItem>
                        </CommandGroup>
                        <CommandGroup heading="Pacientes recientes">
                          <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Ana Martínez González</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Activo
                            </Badge>
                          </CommandItem>
                          <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Miguel Fernández López</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              Tratamiento
                            </Badge>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Notificaciones con indicador mejorado */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative hover:bg-slate-100 h-9 w-9 p-0"
                    >
                      <Bell className="h-4 w-4" />
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white">
                        3
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>3 notificaciones pendientes</p>
                  </TooltipContent>
                </Tooltip>

                {/* Dropdown del usuario movido del sidebar */}
                <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-3 hover:bg-slate-100 transition-all duration-200 rounded-lg p-2 h-auto">
                        <div className="hidden md:block text-right">
                          <p className="text-sm font-medium text-slate-900">
                            {user.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-2.5 w-2.5 mr-1" />
                            {user.role}
                          </Badge>
                        </div>
                        <Avatar className="h-9 w-9 ring-2 ring-slate-200">
                          <AvatarImage 
                            src={user.profileImage ? base64ToImageUrl(user.profileImage) : ""} 
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                            {generateInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-3 w-3 text-slate-500 shrink-0 hidden md:block" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
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
          </header>

          {/* Contenido */}
          <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/30">
            <div className="h-full w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}