"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle, Info, XCircle, Calendar, User, Mail, Phone, MapPin, Clock, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { useState } from "react"

export default function StyleGuide() {
  const [sliderValue, setSliderValue] = useState([50])
  const [progressValue] = useState(65)
  const [switchChecked, setSwitchChecked] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sistema de Diseño</h1>
              <p className="text-sm text-muted-foreground">Guía completa de componentes y tokens</p>
            </div>
            <Badge variant="outline" className="text-xs">
              v1.0.0
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Design Tokens */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Tokens de Diseño</h2>
            <p className="text-sm text-muted-foreground">Sistema base de colores, tipografía y espaciado</p>
          </div>

          {/* Color Palette */}
          <div className="grid gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Paleta de Colores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Primary Colors */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Primarios</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Primary</div>
                        <div className="text-xs text-muted-foreground">oklch(76% 0.12 15)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Secondary</div>
                        <div className="text-xs text-muted-foreground">oklch(60% 0.08 25)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Semantic Colors */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Semánticos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-green-500 border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Success</div>
                        <div className="text-xs text-muted-foreground">oklch(75% 0.14 150)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-yellow-500 border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Warning</div>
                        <div className="text-xs text-muted-foreground">oklch(85% 0.15 85)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-red-500 border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Danger</div>
                        <div className="text-xs text-muted-foreground">oklch(65% 0.18 25)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neutral Colors */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Neutrales</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-foreground border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Foreground</div>
                        <div className="text-xs text-muted-foreground">oklch(25% 0.02 260)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Muted</div>
                        <div className="text-xs text-muted-foreground">oklch(95% 0.01 260)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Colors */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Fondos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-background border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Background</div>
                        <div className="text-xs text-muted-foreground">oklch(98% 0.01 260)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-card border"></div>
                      <div className="text-sm">
                        <div className="font-medium">Card</div>
                        <div className="text-xs text-muted-foreground">oklch(98% 0.01 260)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Escala Tipográfica</h3>
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <h1 className="text-4xl font-bold">H1 - Título Principal</h1>
                <span className="text-sm text-muted-foreground">32px / 40px</span>
              </div>
              <div className="flex items-baseline gap-4">
                <h2 className="text-2xl font-semibold">H2 - Título Secundario</h2>
                <span className="text-sm text-muted-foreground">24px / 32px</span>
              </div>
              <div className="flex items-baseline gap-4">
                <h3 className="text-xl font-medium">H3 - Título Terciario</h3>
                <span className="text-sm text-muted-foreground">20px / 28px</span>
              </div>
              <div className="flex items-baseline gap-4">
                <h4 className="text-lg font-medium">H4 - Subtítulo</h4>
                <span className="text-sm text-muted-foreground">16px / 24px</span>
              </div>
              <div className="flex items-baseline gap-4">
                <p className="text-base">Body - Texto principal para lectura</p>
                <span className="text-sm text-muted-foreground">14px / 22px</span>
              </div>
              <div className="flex items-baseline gap-4">
                <p className="text-sm">Small - Texto secundario y metadatos</p>
                <span className="text-sm text-muted-foreground">13px / 20px</span>
              </div>
              <div className="flex items-baseline gap-4">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">Mono - Código y datos numéricos</code>
                <span className="text-sm text-muted-foreground">12px / 18px</span>
              </div>
            </div>
          </div>

          {/* Spacing Scale */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Escala de Espaciado (8pt System)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[2, 4, 8, 12, 16, 24, 32, 48].map((space) => (
                <div key={space} className="text-center">
                  <div className={`bg-primary mx-auto mb-2`} style={{ width: `${space}px`, height: `${space}px` }}></div>
                  <div className="text-xs text-muted-foreground">{space}px</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Form Components */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Componentes de Formulario</h2>
            <p className="text-sm text-muted-foreground">Elementos de entrada y selección de datos</p>
          </div>

          <div className="grid gap-8">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Botones</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Calendar className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h3 className="text-lg font-medium mb-4">Campos de Entrada</h3>
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="usuario@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabled">Campo Deshabilitado</Label>
                  <Input id="disabled" disabled placeholder="No editable" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" placeholder="Escribe tu mensaje aquí..." />
                </div>
              </div>
            </div>

            {/* Select */}
            <div>
              <h3 className="text-lg font-medium mb-4">Selección</h3>
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label>Especialidad</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psicologia-clinica">Psicología Clínica</SelectItem>
                      <SelectItem value="psicologia-educativa">Psicología Educativa</SelectItem>
                      <SelectItem value="neuropsicologia">Neuropsicología</SelectItem>
                      <SelectItem value="psicologia-organizacional">Psicología Organizacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Checkbox and Radio */}
            <div>
              <h3 className="text-lg font-medium mb-4">Selección Múltiple</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Servicios (Checkbox)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terapia-individual" />
                      <Label htmlFor="terapia-individual" className="text-sm">Terapia Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terapia-pareja" />
                      <Label htmlFor="terapia-pareja" className="text-sm">Terapia de Pareja</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terapia-familiar" />
                      <Label htmlFor="terapia-familiar" className="text-sm">Terapia Familiar</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Modalidad (Radio)</Label>
                  <RadioGroup defaultValue="presencial">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="presencial" id="presencial" />
                      <Label htmlFor="presencial" className="text-sm">Presencial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="text-sm">Online</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hibrida" id="hibrida" />
                      <Label htmlFor="hibrida" className="text-sm">Híbrida</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Switch and Slider */}
            <div>
              <h3 className="text-lg font-medium mb-4">Controles Interactivos</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notifications" 
                      checked={switchChecked}
                      onCheckedChange={setSwitchChecked}
                    />
                    <Label htmlFor="notifications" className="text-sm">
                      Notificaciones por email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="marketing" />
                    <Label htmlFor="marketing" className="text-sm">
                      Comunicaciones de marketing
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Duración de sesión: {sliderValue[0]} minutos</Label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={120}
                      min={30}
                      step={15}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Progreso del tratamiento: {progressValue}%</Label>
                    <Progress value={progressValue} className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Feedback Components */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Componentes de Retroalimentación</h2>
            <p className="text-sm text-muted-foreground">Alertas, notificaciones y estados del sistema</p>
          </div>

          <div className="space-y-6">
            {/* Alerts */}
            <div>
              <h3 className="text-lg font-medium mb-4">Alertas</h3>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Información</AlertTitle>
                  <AlertDescription>
                    Esta es una alerta informativa para comunicar información general al usuario.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>
                    La cita ha sido programada exitosamente para el 15 de enero a las 10:00 AM.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription>
                    El paciente tiene una cita pendiente de confirmación para mañana.
                  </AlertDescription>
                </Alert>
                
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    No se pudo guardar la información. Por favor, verifica los datos e intenta nuevamente.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-lg font-medium mb-4">Badges y Estados</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secundario</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructivo</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Activo</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">En Proceso</Badge>
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Completado</Badge>
              </div>
            </div>

            {/* Dialog */}
            <div>
              <h3 className="text-lg font-medium mb-4">Diálogos</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Abrir Diálogo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Acción</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button variant="destructive">Eliminar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Data Display Components */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Visualización de Datos</h2>
            <p className="text-sm text-muted-foreground">Tablas, tarjetas y componentes de datos</p>
          </div>

          <div className="space-y-8">
            {/* Cards */}
            <div>
              <h3 className="text-lg font-medium mb-4">Tarjetas</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">Dr. Ana García</CardTitle>
                    </div>
                    <CardDescription>Psicóloga Clínica</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>ana.garcia@clinica.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>+34 123 456 789</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Madrid, España</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Ver Perfil</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Citas Hoy</CardTitle>
                        <CardDescription>Resumen del día</CardDescription>
                      </div>
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">+2 desde ayer</div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completadas</span>
                        <span className="font-medium">5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pendientes</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Ingresos</CardTitle>
                        <CardDescription>Este mes</CardDescription>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€2,450</div>
                    <div className="text-sm text-green-600">+12% desde el mes pasado</div>
                    <Progress value={75} className="mt-4" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Tablas</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                  <CardDescription>Lista de citas programadas para esta semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Mostrando 5 de 23 citas</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Duración</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">María López</TableCell>
                        <TableCell>15 Ene 2024</TableCell>
                        <TableCell>10:00</TableCell>
                        <TableCell>Individual</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
                        </TableCell>
                        <TableCell className="text-right">60 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Carlos Ruiz</TableCell>
                        <TableCell>15 Ene 2024</TableCell>
                        <TableCell>11:30</TableCell>
                        <TableCell>Pareja</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                        </TableCell>
                        <TableCell className="text-right">90 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ana Martín</TableCell>
                        <TableCell>16 Ene 2024</TableCell>
                        <TableCell>09:00</TableCell>
                        <TableCell>Individual</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">Nueva</Badge>
                        </TableCell>
                        <TableCell className="text-right">45 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pedro Sánchez</TableCell>
                        <TableCell>16 Ene 2024</TableCell>
                        <TableCell>15:00</TableCell>
                        <TableCell>Familiar</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
                        </TableCell>
                        <TableCell className="text-right">75 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Laura García</TableCell>
                        <TableCell>17 Ene 2024</TableCell>
                        <TableCell>12:00</TableCell>
                        <TableCell>Individual</TableCell>
                        <TableCell>
                          <Badge className="bg-gray-100 text-gray-800">Reprogramada</Badge>
                        </TableCell>
                        <TableCell className="text-right">60 min</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Navigation & Layout Components */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Navegación y Layout</h2>
            <p className="text-sm text-muted-foreground">Componentes de navegación y organización de contenido</p>
          </div>

          <div className="space-y-8">
            {/* Tabs */}
            <div>
              <h3 className="text-lg font-medium mb-4">Tabs</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Navegación por Pestañas</CardTitle>
                  <CardDescription>Organización de contenido en pestañas con indicador de selección</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Resumen</TabsTrigger>
                      <TabsTrigger value="analytics">Analíticas</TabsTrigger>
                      <TabsTrigger value="reports">Reportes</TabsTrigger>
                      <TabsTrigger value="settings">Configuración</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                      <p className="text-sm text-muted-foreground">Vista general del dashboard con métricas principales y resumen de actividad.</p>
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-4">
                      <p className="text-sm text-muted-foreground">Análisis detallado de datos, tendencias y patrones de comportamiento.</p>
                    </TabsContent>
                    <TabsContent value="reports" className="mt-4">
                      <p className="text-sm text-muted-foreground">Generación y gestión de reportes personalizados y automáticos.</p>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-4">
                      <p className="text-sm text-muted-foreground">Configuración del sistema, preferencias de usuario y ajustes avanzados.</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Accordion */}
            <div>
              <h3 className="text-lg font-medium mb-4">Accordion</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Contenido Colapsible</CardTitle>
                  <CardDescription>Organización jerárquica de información con expansión selectiva</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Información del Paciente</AccordionTrigger>
                      <AccordionContent>
                        Datos personales, historial médico, información de contacto y detalles relevantes para el tratamiento psicológico.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Historial de Sesiones</AccordionTrigger>
                      <AccordionContent>
                        Registro completo de todas las sesiones terapéuticas realizadas, incluyendo fechas, duración y notas de progreso.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Notas y Observaciones</AccordionTrigger>
                      <AccordionContent>
                        Anotaciones del terapeuta, observaciones relevantes del tratamiento y seguimiento de objetivos terapéuticos.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Plan de Tratamiento</AccordionTrigger>
                      <AccordionContent>
                        Estrategias terapéuticas, objetivos a corto y largo plazo, y metodologías aplicadas en el proceso de intervención.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Dropdown Menu */}
            <div>
              <h3 className="text-lg font-medium mb-4">Dropdown Menu</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Menús Contextuales</CardTitle>
                  <CardDescription>Acciones rápidas y opciones organizadas en menús desplegables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Acciones del Paciente</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Gestión de Paciente</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver Perfil Completo</DropdownMenuItem>
                        <DropdownMenuItem>Editar Información</DropdownMenuItem>
                        <DropdownMenuItem>Programar Nueva Cita</DropdownMenuItem>
                        <DropdownMenuItem>Historial de Pagos</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Archivar Paciente</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Exportar Datos</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Exportar como PDF</DropdownMenuItem>
                        <DropdownMenuItem>Exportar como Excel</DropdownMenuItem>
                        <DropdownMenuItem>Exportar como CSV</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Configurar Exportación</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Más Opciones</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Compartir</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem>Imprimir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Interactive Elements */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Elementos Interactivos</h2>
            <p className="text-sm text-muted-foreground">Componentes de retroalimentación e interacción avanzada</p>
          </div>

          <div className="space-y-8">
            {/* Tooltips */}
            <div>
              <h3 className="text-lg font-medium mb-4">Tooltips</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Información Contextual</CardTitle>
                  <CardDescription>Ayuda y explicaciones que aparecen al hacer hover sobre elementos</CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <div className="flex gap-4 items-center flex-wrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline">Hover para información</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Esta acción guardará los cambios automáticamente</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary">Estado: Activo</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>El paciente tiene citas programadas este mes</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-2 border rounded cursor-help inline-flex">
                            <Info className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Información adicional sobre este elemento</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Última actualización: hace 5 minutos</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>

            {/* Avatar */}
            <div>
              <h3 className="text-lg font-medium mb-4">Avatar</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Representación de Usuarios</CardTitle>
                  <CardDescription>Avatares para profesionales, pacientes y usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="https://github.com/shadcn.png" alt="Dr. García" />
                        <AvatarFallback>DG</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">AL</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Dr. María Pérez</p>
                        <p className="text-xs text-muted-foreground">Psicóloga Clínica • Especialista en Ansiedad</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-100 text-green-700">PC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Paciente Confidencial</p>
                        <p className="text-xs text-muted-foreground">Última sesión: 12 Ene 2024</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loading States */}
            <div>
              <h3 className="text-lg font-medium mb-4">Estados de Carga</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Skeleton Loading</CardTitle>
                  <CardDescription>Indicadores de carga que mantienen la estructura visual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Cargando texto</h4>
                    <Skeleton className="h-4 w-[300px]" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Cargando perfil</h4>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Cargando tarjeta</h4>
                    <div className="space-y-3">
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Data Visualization */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Visualización de Datos</h2>
            <p className="text-sm text-muted-foreground">Gráficos y métricas clave siguiendo principios Oberhäuser</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* KPI Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">
                  +8% desde el mes pasado
                </p>
                <div className="mt-2">
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% desde la semana pasada
                </p>
                <div className="mt-2">
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-xs text-muted-foreground">
                  Basado en 89 evaluaciones
                </p>
                <div className="mt-2">
                  <Progress value={96} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Guía de Implementación</h2>
            <p className="text-sm text-muted-foreground">Tokens CSS y mejores prácticas</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tokens CSS</CardTitle>
                <CardDescription>Variables de diseño base</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`:root {
  /* Colors */
  --primary: oklch(76% 0.12 15);
  --secondary: oklch(60% 0.08 25);
  --background: oklch(98% 0.01 260);
  --foreground: oklch(25% 0.02 260);
  
  /* Spacing */
  --space-2: 2px;
  --space-4: 4px;
  --space-8: 8px;
  --space-16: 16px;
  --space-24: 24px;
  
  /* Typography */
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --line-height-sm: 20px;
  --line-height-base: 22px;
  --line-height-lg: 24px;
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Principios de Uso</CardTitle>
                <CardDescription>Mejores prácticas del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Jerarquía Visual</h4>
                    <p className="text-muted-foreground">Usa contraste tipográfico 1.35-1.6 para títulos, mantén consistencia en espaciado 8pt.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Densidad de Información</h4>
                    <p className="text-muted-foreground">40% datos, 60% aire. Prioriza legibilidad sobre decoración.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Accesibilidad</h4>
                    <p className="text-muted-foreground">Contraste mínimo 7:1 para texto primario, 4.5:1 para secundario.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Microinteracciones</h4>
                    <p className="text-muted-foreground">Duraciones 120-220ms, timing ease-out, animaciones que explican cambios.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Sistema de Diseño APsicología • Basado en principios Oberhäuser × Wheeler
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Última actualización: Enero 2024</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}