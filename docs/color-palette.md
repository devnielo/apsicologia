# Paleta de Colores - apsicologia

## Descripción General

Esta paleta de colores ha sido diseñada específicamente para la aplicación de gestión médica/psicológica apsicologia, basada en los colores primario `#DE9397` (rosa coral profesional) y secundario `#A57978` (marrón rosado), creando un ambiente cálido, profesional y confiable.

## Colores Primarios

### Primary - Rosa Coral Profesional (#DE9397)
```css
--primary-50: hsl(355, 70%, 95%)   /* #fdf2f3 - Muy claro */
--primary-100: hsl(355, 65%, 90%)  /* #f9e1e3 - Claro */
--primary-200: hsl(355, 60%, 85%)  /* #f4d0d3 - Suave */
--primary-300: hsl(355, 55%, 80%)  /* #efbfc3 - Medio claro */
--primary-400: hsl(355, 50%, 75%)  /* #e9aeb3 - Medio */
--primary-500: hsl(355, 47%, 73%)  /* #de9397 - BASE */
--primary-600: hsl(355, 45%, 65%)  /* #d17d82 - Medio oscuro */
--primary-700: hsl(355, 40%, 55%)  /* #c0676d - Oscuro */
--primary-800: hsl(355, 35%, 45%)  /* #a85158 - Muy oscuro */
--primary-900: hsl(355, 30%, 35%)  /* #8f3b43 - Más oscuro */
```

### Secondary - Marrón Rosado (#A57978)
```css
--secondary-50: hsl(15, 30%, 92%)   /* #f2efed - Muy claro */
--secondary-100: hsl(15, 25%, 85%)  /* #e3ddd9 - Claro */
--secondary-200: hsl(15, 22%, 78%)  /* #d4cbc5 - Suave */
--secondary-300: hsl(15, 20%, 70%)  /* #c4b9b1 - Medio claro */
--secondary-400: hsl(15, 20%, 63%)  /* #b4a79d - Medio */
--secondary-500: hsl(15, 20%, 56%)  /* #a57978 - BASE */
--secondary-600: hsl(15, 22%, 48%)  /* #936b64 - Medio oscuro */
--secondary-700: hsl(15, 25%, 40%)  /* #815d50 - Oscuro */
--secondary-800: hsl(15, 28%, 32%)  /* #6f4f3c - Muy oscuro */
--secondary-900: hsl(15, 30%, 24%)  /* #5d4128 - Más oscuro */
```

## Colores Semánticos

### Estados de la Aplicación
```css
/* Success - Verde suave profesional */
--success: hsl(140, 40%, 60%)           /* #66b366 */
--success-foreground: hsl(140, 100%, 15%) /* #002600 */

/* Warning - Amarillo cálido */
--warning: hsl(45, 70%, 65%)            /* #e6d166 */
--warning-foreground: hsl(45, 100%, 20%) /* #664d00 */

/* Danger - Rojo coral suave */
--danger: hsl(0, 60%, 65%)              /* #d16666 */
--danger-foreground: hsl(0, 100%, 15%)   /* #4d0000 */

/* Info - Azul grisáceo */
--info: hsl(200, 30%, 60%)              /* #7399b3 */
--info-foreground: hsl(200, 100%, 15%)   /* #001a26 */
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

## Modo Oscuro

La paleta incluye ajustes automáticos para modo oscuro que mantienen la coherencia visual y los contrastes apropiados:

- Los colores primarios y secundarios se invierten en luminosidad
- Los fondos se oscurecen manteniendo la calidez
- Los textos se ajustan para mantener contraste WCAG AA
- Los colores semánticos se adaptan para mejor visibilidad

## Accesibilidad

### Contrastes
- **Texto primario**: Contraste mínimo 7:1
- **Texto secundario**: Contraste mínimo 4.5:1
- **Elementos interactivos**: Contraste mínimo 3:1
- **Estados de foco**: Outline visible de 2px

### Uso Semántico
- No depender únicamente del color para transmitir información
- Incluir iconos y texto descriptivo en estados
- Usar patrones y formas adicionales en gráficos

## Implementación Técnica

### Variables CSS
Todas las variables están definidas en `globals.css` usando el formato HSL compatible con shadcn/ui:

```css
:root {
  --primary-500: 355 47% 73%;
  --secondary-500: 15 20% 56%;
  /* ... más variables */
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

## Mejores Prácticas

1. **Jerarquía Visual**: Usar primary-500 para elementos principales, variaciones más claras para fondos
2. **Consistencia**: Mantener el uso de la paleta en toda la aplicación
3. **Legibilidad**: Siempre verificar contraste antes de implementar
4. **Estados**: Usar hover states con variaciones de luminosidad (+/- 5-10%)
5. **Espaciado**: Combinar con el sistema de espaciado de 8pt para coherencia visual

---

*Esta paleta ha sido diseñada siguiendo los principios de diseño médico profesional, priorizando la confianza, calidez y accesibilidad.*