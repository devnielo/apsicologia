export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            apsicologia
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma completa de gestión para centros de psicología
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold mb-2">Gestión de Pacientes</h3>
              <p className="text-muted-foreground">
                Historial clínico completo, consentimientos y documentación médica
              </p>
            </div>
            
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold mb-2">Agenda y Citas</h3>
              <p className="text-muted-foreground">
                Calendario interactivo, recordatorios automáticos y videoconsultas
              </p>
            </div>
            
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold mb-2">Facturación</h3>
              <p className="text-muted-foreground">
                Sistema completo de facturación, pagos y reportes financieros
              </p>
            </div>
            
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold mb-2">Cuestionarios</h3>
              <p className="text-muted-foreground">
                Formularios dinámicos para evaluaciones y seguimiento
              </p>
            </div>
            
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold mb-2">Notas Clínicas</h3>
              <p className="text-muted-foreground">
                Editor avanzado con plantillas y firma digital
              </p>
            </div>
            
            <div className="medical-card p-6">
              <h3 className="text-lg font-semibold mb-2">Estadísticas</h3>
              <p className="text-muted-foreground">
                Panel de control con KPIs y reportes detallados
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <a href="/auth/login" className="medical-button-primary mr-4">
              Acceder al Panel
            </a>
            <button className="medical-button-secondary">
              Documentación
            </button>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Backend API: ✅ Completamente funcional</p>
            <p>Frontend: 🚧 En desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
