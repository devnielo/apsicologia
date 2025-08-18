"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Stethoscope, 
  Clock, 
  TrendingUp, 
  Plus, 
  Eye,
  Edit,
  MoreHorizontal,
  CalendarDays,
  Building2,
  Video,
  FileText
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

// Mock data para citas recientes
const recentAppointments = [
  {
    id: "#001",
    patient: "María González",
    professional: "Dr. Ana Martínez",
    service: "Terapia Individual",
    date: "2024-01-15",
    time: "10:00",
    status: "Confirmada",
    type: "Presencial",
    avatar: "/avatars/01.png"
  },
  {
    id: "#002",
    patient: "Carlos Rodríguez",
    professional: "Dra. Laura Pérez",
    service: "Evaluación Psicológica",
    date: "2024-01-15",
    time: "14:30",
    status: "En Progreso",
    type: "Virtual",
    avatar: "/avatars/02.png"
  },
  {
    id: "#003",
    patient: "Ana López",
    professional: "Dr. Miguel Torres",
    service: "Terapia Familiar",
    date: "2024-01-15",
    time: "16:00",
    status: "Pendiente",
    type: "Presencial",
    avatar: "/avatars/03.png"
  },
  {
    id: "#004",
    patient: "Roberto Silva",
    professional: "Dra. Carmen Ruiz",
    service: "Terapia de Pareja",
    date: "2024-01-15",
    time: "11:30",
    status: "Completada",
    type: "Virtual",
    avatar: "/avatars/04.png"
  }
]

// Datos para gráfico de citas por estado
const appointmentStatusData = [
  { name: 'Completadas', value: 45, color: '#10b981' },
  { name: 'Confirmadas', value: 28, color: '#3b82f6' },
  { name: 'Pendientes', value: 15, color: '#f59e0b' },
  { name: 'Canceladas', value: 12, color: '#ef4444' }
]

// Datos para gráfico de citas por semana
const weeklyAppointmentsData = [
  { day: 'Lun', citas: 12 },
  { day: 'Mar', citas: 19 },
  { day: 'Mié', citas: 15 },
  { day: 'Jue', citas: 22 },
  { day: 'Vie', citas: 18 },
  { day: 'Sáb', citas: 8 },
  { day: 'Dom', citas: 3 }
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Confirmada":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>
    case "En Progreso":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case "Pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>
    case "Completada":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    case "Cancelada":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getTypeBadge(type: string) {
  return type === "Virtual" ? (
    <Badge variant="outline" className="text-purple-600 border-purple-200">
      <Video className="w-3 h-3 mr-1" />
      {type}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-blue-600 border-blue-200">
      <Building2 className="w-3 h-3 mr-1" />
      {type}
    </Badge>
  )
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">ArriBa Psicología</span>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-6 py-2">
            <Link href="/dashboard" className="flex items-center space-x-3 text-blue-600 bg-blue-50 rounded-lg p-2 cursor-pointer">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
          
          <div className="px-6 py-2">
            <Link href="/patients" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 cursor-pointer">
              <Users className="w-5 h-5" />
              <span>Pacientes</span>
            </Link>
          </div>
          
          <div className="px-6 py-2">
            <Link href="/professionals" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 cursor-pointer">
              <UserCheck className="w-5 h-5" />
              <span>Profesionales</span>
            </Link>
          </div>
          
          <div className="px-6 py-2">
            <Link href="/appointments" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 cursor-pointer">
              <Calendar className="w-5 h-5" />
              <span>Citas</span>
            </Link>
          </div>
          
          <div className="px-6 py-2">
            <Link href="/services" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 cursor-pointer">
              <FileText className="w-5 h-5" />
              <span>Servicios</span>
            </Link>
          </div>
          
          <div className="px-6 py-2">
            <Link href="/rooms" className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 rounded-lg p-2 cursor-pointer">
              <Building2 className="w-5 h-5" />
              <span>Salas</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Resumen general de la clínica</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/appointments/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Main Dashboard Content */}
          <div className="flex-1 p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-blue-600">4</span> en progreso
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profesionales Activos</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">6</span> disponibles ahora
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€12,450</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.2%</span> vs mes anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Citas por Estado */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Citas</CardTitle>
                  <CardDescription>Distribución de citas por estado actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {appointmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {appointmentStatusData.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Citas por Día de la Semana */}
              <Card>
                <CardHeader>
                  <CardTitle>Citas Semanales</CardTitle>
                  <CardDescription>Distribución de citas por día de la semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyAppointmentsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="citas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Citas Recientes</CardTitle>
                    <CardDescription>Últimas citas programadas y su estado</CardDescription>
                  </div>
                  <Link href="/appointments">
                    <Button variant="outline" size="sm">
                      Ver Todas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Profesional</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={appointment.avatar} />
                              <AvatarFallback>{appointment.patient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{appointment.patient}</span>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.professional}</TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(appointment.date).toLocaleDateString('es-ES')}</div>
                            <div className="text-gray-500">{appointment.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(appointment.type)}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            {/* Quick Actions */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/patients/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Nuevo Paciente
                  </Button>
                </Link>
                <Link href="/appointments/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Cita
                  </Button>
                </Link>
                <Link href="/professionals/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Nuevo Profesional
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Agenda de Hoy</CardTitle>
                <CardDescription>Próximas citas programadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">10:00 - María González</div>
                      <div className="text-xs text-gray-500">Terapia Individual</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">14:30 - Carlos Rodríguez</div>
                      <div className="text-xs text-gray-500">Evaluación Psicológica</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">16:00 - Ana López</div>
                      <div className="text-xs text-gray-500">Terapia Familiar</div>
                    </div>
                  </div>
                </div>
                
                <Link href="/appointments" className="block">
                  <Button variant="ghost" className="w-full text-sm">
                    Ver Agenda Completa
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}