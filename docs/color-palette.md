# Paleta de Colores Global - Sistema de Diseño Apsicología

## Descripción General

Esta paleta de colores ha sido completamente rediseñada utilizando el modelo de color **OKLCH** para garantizar consistencia perceptual, mejor accesibilidad y armonía visual. El sistema está optimizado para aplicaciones de salud mental, creando un ambiente profesional, cálido y confiable.

### Ventajas del modelo OKLCH:
- **Consistencia perceptual**: Los cambios en luminosidad se perciben uniformemente
- **Mejor accesibilidad**: Control preciso sobre contrastes WCAG AA/AAA
- **Armonía de color**: Relaciones cromáticas más naturales y agradables
- **Compatibilidad moderna**: Soporte nativo en navegadores actuales

## Colores Primarios

### Primary - Professional Coral (OKLCH)
```css
/* Tema Claro */
--primary-50:  oklch(97% 0.02 15)   /* Rosa muy pálido */
--primary-100: oklch(94% 0.04 15)   /* Rosa pálido */
--primary-200: oklch(88% 0.06 15)   /* Rosa claro */
--primary-300: oklch(82% 0.08 15)   /* Rosa suave */
--primary-400: oklch(76% 0.10 15)   /* Rosa medio */
--primary-500: oklch(73% 0.12 15)   /* BASE - Coral profesional */
--primary-600: oklch(65% 0.12 15)   /* Coral medio oscuro */
--primary-700: oklch(55% 0.12 15)   /* Coral oscuro */
--primary-800: oklch(45% 0.12 15)   /* Coral muy oscuro */
--primary-900: oklch(35% 0.12 15)   /* Coral profundo */

/* Tema Oscuro */
--primary-50:  oklch(25% 0.08 15)   /* Inversión oscura */
--primary-500: oklch(78% 0.12 15)   /* BASE adaptada */
```

### Secondary - Neutral Complementary (OKLCH)
```css
/* Tema Claro */
--secondary-50:  oklch(97% 0.01 25)   /* Neutro muy claro */
--secondary-100: oklch(94% 0.02 25)   /* Neutro claro */
--secondary-200: oklch(88% 0.04 25)   /* Gris cálido claro */
--secondary-300: oklch(78% 0.05 25)   /* Gris cálido suave */
--secondary-400: oklch(68% 0.06 25)   /* Gris cálido medio */
--secondary-500: oklch(58.5% 0.08 25) /* BASE - Neutral warm */
--secondary-600: oklch(50% 0.08 25)   /* Gris medio oscuro */
--secondary-700: oklch(42% 0.08 25)   /* Gris oscuro */
--secondary-800: oklch(34% 0.08 25)   /* Gris muy oscuro */
--secondary-900: oklch(26% 0.08 25)   /* Gris profundo */

/* Tema Oscuro */
--secondary-50:  oklch(20% 0.01 25)   /* Inversión oscura */
--secondary-500: oklch(62% 0.08 25)   /* BASE adaptada */
```

### Accent - Friendly Blue/Teal (OKLCH)
```css
/* Tema Claro */
--accent-50:  oklch(97% 0.02 220)   /* Azul muy pálido */
--accent-100: oklch(94% 0.04 220)   /* Azul pálido */
--accent-200: oklch(88% 0.06 220)   /* Azul claro */
--accent-300: oklch(80% 0.08 220)   /* Azul suave */
--accent-400: oklch(75% 0.10 220)   /* Azul medio */
--accent-500: oklch(70% 0.12 220)   /* BASE - Friendly blue */
--accent-600: oklch(62% 0.12 220)   /* Azul medio oscuro */
--accent-700: oklch(54% 0.12 220)   /* Azul oscuro */
--accent-800: oklch(46% 0.12 220)   /* Azul muy oscuro */
--accent-900: oklch(38% 0.12 220)   /* Azul profundo */
```

## Colores Semánticos (OKLCH)

### Estados de la Aplicación - Optimizados para Healthcare
```css
/* Success - Verde calmante */
--success: oklch(75% 0.14 145)          /* Verde equilibrado */
--success-foreground: oklch(20% 0.08 145) /* Texto oscuro */

/* Warning - Amarillo atención */
--warning: oklch(85% 0.12 85)           /* Amarillo suave */
--warning-foreground: oklch(25% 0.08 85)  /* Texto oscuro */

/* Danger/Destructive - Rojo cuidadoso */
--destructive: oklch(60% 0.18 25)       /* Rojo moderado */
--destructive-foreground: oklch(95% 0.02 25) /* Texto claro */

/* Info - Azul informativo */
--info: oklch(72% 0.12 225)             /* Azul confiable */
--info-foreground: oklch(20% 0.06 225)    /* Texto oscuro */

/* Tema Oscuro - Ajustes semánticos */
.dark {
  --success: oklch(65% 0.12 145)
  --warning: oklch(75% 0.10 85)
  --destructive: oklch(65% 0.16 25)
  --info: oklch(68% 0.10 225)
}
```

## Uso en Componentes

### Botones
```jsx
// Botón primario
<Button className="bg-primary hover:bg-primary-600">
  Acción Principal
</Button>

// Botón secundario
<Button variant="secondary" className="bg-secondary-100 hover:bg-secondary-200">
  Acción Secundaria
</Button>

// Botones de estado
<Button className="bg-success hover:bg-success/90">
  Guardar
</Button>

<Button className="bg-danger hover:bg-danger/90">
  Eliminar
</Button>
```

### Cards y Superficies
```jsx
// Card principal
<Card className="bg-card border-primary-200">
  <CardHeader className="bg-primary-50">
    <CardTitle className="text-primary-800">Título</CardTitle>
  </CardHeader>
</Card>

// Card secundaria
<Card className="bg-secondary-50 border-secondary-200">
  <CardContent className="text-secondary-800">
    Contenido
  </CardContent>
</Card>
```

### Badges y Estados
```jsx
// Badge de éxito
<Badge className="bg-success text-success-foreground">
  Activo
</Badge>

// Badge de advertencia
<Badge className="bg-warning text-warning-foreground">
  Pendiente
</Badge>

// Badge de información
<Badge className="bg-info text-info-foreground">
  Información
</Badge>
```

## Modo Oscuro con OKLCH

El sistema OKLCH permite transiciones perfectas entre temas:

### Estrategia de inversión:
```css
/* Fórmula de inversión para modo oscuro */
/* Light: L = 97% → Dark: L = 8% */
/* Light: L = 73% → Dark: L = 78% (ajuste para primarios) */
/* Chroma (C) se reduce ligeramente en modo oscuro */
/* Hue (H) se mantiene constante */
```

### Características:
- **Inversión inteligente**: Los valores L se invierten manteniendo jerarquía
- **Reducción de fatiga visual**: Menor chroma en modo oscuro
- **Consistencia cromática**: Los hues se mantienen idénticos
- **Contraste optimizado**: Ajustes automáticos para WCAG AA

## Accesibilidad WCAG AA/AAA

### Contrastes Garantizados con OKLCH
- **Texto primario**: Contraste 7:1+ (WCAG AAA)
- **Texto secundario**: Contraste 4.5:1+ (WCAG AA)
- **Elementos interactivos**: Contraste 3:1+ (WCAG AA)
- **Estados de foco**: Ring de 2px con offset para visibilidad

### Ventajas del modelo OKLCH para accesibilidad:
- **Control preciso de luminosidad**: L en OKLCH es perceptualmente uniforme
- **Predicción de contraste**: Diferencias de L correlacionan con contraste real
- **Daltonismo**: Mejor diferenciación mediante control de luminosidad
- **Modo oscuro automático**: Inversiones de L mantienen legibilidad

### Uso Semántico
- No depender únicamente del color para transmitir información
- Incluir iconos y texto descriptivo en estados
- Usar patrones y formas adicionales en gráficos

## Implementación Técnica

### Variables CSS con OKLCH
Todas las variables están definidas en `globals.css` usando el formato OKLCH para mejor control de color:

```css
:root {
  /* Colores primarios en OKLCH */
  --primary: oklch(73% 0.12 15);
  --secondary: oklch(58.5% 0.08 25);
  --accent: oklch(70% 0.12 220);
  
  /* Sistema de variantes */
  --primary-50: oklch(97% 0.02 15);
  --primary-500: oklch(73% 0.12 15);
  --primary-900: oklch(35% 0.12 15);
  
  /* Colores UI foundation */
  --background: oklch(99% 0.005 60);
  --foreground: oklch(10% 0.02 60);
  --card: oklch(99% 0.005 60);
  --muted: oklch(92% 0.03 60);
}

/* Tema oscuro con inversiones calculadas */
.dark {
  --background: oklch(8% 0.02 60);
  --foreground: oklch(98% 0.005 60);
  --primary: oklch(78% 0.12 15);
}
```

### Tailwind CSS
Las clases están disponibles directamente:

```css
/* Colores primarios */
bg-primary-50, bg-primary-100, ..., bg-primary-900
text-primary-50, text-primary-100, ..., text-primary-900
border-primary-50, border-primary-100, ..., border-primary-900

/* Colores secundarios */
bg-secondary-50, bg-secondary-100, ..., bg-secondary-900
text-secondary-50, text-secondary-100, ..., text-secondary-900

/* Colores semánticos */
bg-success, bg-warning, bg-danger, bg-info
text-success-foreground, text-warning-foreground, etc.
```

## Mejores Prácticas con OKLCH

### 1. Jerarquía Visual
- **Elementos principales**: `oklch(73% 0.12 15)` - Primary base
- **Fondos sutiles**: `oklch(97% 0.02 15)` - Primary-50
- **Bordes y divisores**: `oklch(88% 0.06 15)` - Primary-200

### 2. Estados Interactivos
```css
/* Hover: Reducir L en 5-8% */
hover: oklch(65% 0.12 15)  /* desde 73% */

/* Active: Reducir L en 10-15% */
active: oklch(58% 0.12 15)

/* Focus: Agregar ring con contraste */
focus: ring-2 ring-offset-2 ring-primary-500
```

### 3. Composición de Color
- **Monotono**: Variar solo L manteniendo C y H constantes
- **Análogo**: Variar H ±30° manteniendo L y C similares  
- **Complementario**: H +180° para máximo contraste

### 4. Testing de Accesibilidad
- Usar herramientas que soporten OKLCH para verificación
- Probar en modo claro y oscuro
- Validar con simuladores de daltonismo
- Verificar en diferentes niveles de brillo de pantalla

## Herramientas y Recursos

### Conversión de Colores
- [OKLCH Color Picker](https://oklch.com) - Herramienta interactiva
- [OKLCH in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) - Documentación MDN

### Testing de Contraste
- Chrome DevTools soporta OKLCH nativamente
- WCAG contrast checker con soporte OKLCH

### Ejemplo de Uso en Código
```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[oklch(73%_0.12_15)] hover:bg-[oklch(65%_0.12_15)]",
        secondary: "bg-[oklch(58.5%_0.08_25)] hover:bg-[oklch(50%_0.08_25)]",
        accent: "bg-[oklch(70%_0.12_220)] hover:bg-[oklch(62%_0.12_220)]",
      },
    },
  }
)
```

---

*Sistema de color OKLCH implementado para máxima consistencia perceptual, accesibilidad WCAG AA/AAA y experiencia óptima en aplicaciones de salud mental. Actualizado con las últimas especificaciones de color web.*