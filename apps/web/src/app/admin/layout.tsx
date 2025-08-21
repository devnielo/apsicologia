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
  Shield
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Panel principal',
    badge: null
  },
  {
    title: 'Pacientes',
    href: '/admin/patients',
    icon: Users,
    description: 'Gestión de pacientes',
    badge: null
  },
  {
    title: 'Profesionales',
    href: '/admin/professionals',
    icon: UserCheck,
    description: 'Gestión de profesionales',
    badge: null
  },
  {
    title: 'Servicios',
    href: '/admin/services',
    icon: Briefcase,
    description: 'Gestión de servicios',
    badge: null
  },
  {
    title: 'Salas',
    href: '/admin/rooms',
    icon: MapPin,
    description: 'Gestión de salas',
    badge: null
  },
  {
    title: 'Calendario',
    href: '/admin/calendar',
    icon: Calendar,
    description: 'Gestión de citas',
    badge: { text: '3', variant: 'secondary' as const }
  },
  {
    title: 'Formularios',
    href: '/admin/forms',
    icon: FileText,
    description: 'Formularios dinámicos',
    badge: null
  },
  {
    title: 'Estadísticas',
    href: '/admin/stats',
    icon: BarChart3,
    description: 'Reportes y estadísticas',
    badge: null
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuración del sistema',
    badge: null
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      // Verificar que el usuario tenga permisos de admin
      if (!['admin', 'reception'].includes(parsedUser.role)) {
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
    const currentItem = sidebarItems.find(item => item.href === pathname);
    return currentItem?.title || 'Administración';
  };

  const getCurrentPageDescription = () => {
    const currentItem = sidebarItems.find(item => item.href === pathname);
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Sidebar Moderno */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/60 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">apsicologia</h1>
              <p className="text-xs text-slate-500 font-medium">Panel Admin</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center">
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                  )} />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className={cn(
                      "text-xs transition-colors",
                      isActive ? "text-white/80" : "text-slate-500 group-hover:text-slate-600"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : item.badge.variant}
                    className={cn(
                      "text-xs",
                      isActive && "bg-white/20 text-white hover:bg-white/30"
                    )}
                  >
                    {item.badge.text}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Usuario y Logout */}
        <div className="border-t border-slate-200/60 p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-slate-100">
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src="" alt={user.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Moderno */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2 hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {getCurrentPageTitle()}
                </h2>
                <p className="text-sm text-slate-600">
                  {getCurrentPageDescription()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Búsqueda Global */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar pacientes, citas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              
              {/* Notificaciones */}
              <Button variant="ghost" size="sm" className="relative hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600">
                  3
                </Badge>
              </Button>
              
              {/* Avatar del usuario */}
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src="" alt={user.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}