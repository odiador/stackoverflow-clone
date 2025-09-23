# AI Response with Markdown Support

Esta implementación agrega soporte completo para respuestas de AI con renderizado de Markdown en el clon de Stack Overflow.

## Características Implementadas

### Backend (Servidor)
1. **Endpoint de Streaming**: `/api/questions/:questionId/ai-stream`
   - Genera respuestas de AI en tiempo real usando Server-Sent Events (SSE)
   - Utiliza el servicio Mistral AI para generar contenido
   - Envía el contenido por chunks mientras se genera

2. **Procesamiento de Markdown**:
   - El servidor genera respuestas en formato Markdown
   - Compatible con código, listas, tablas, links, etc.

### Frontend (Cliente)
1. **Componente de Streaming**:
   - Botón para solicitar respuesta de AI
   - Interfaz de carga con spinner
   - Vista previa del contenido mientras se genera
   - Renderizado final con formato HTML

2. **Renderizado de Markdown**:
   - Utiliza `marked` para convertir Markdown a HTML
   - Utiliza `DOMPurify` para sanitización de seguridad
   - Estilos CSS personalizados para el contenido Markdown

3. **Estilos Incluidos**:
   - Encabezados con jerarquía visual
   - Código inline y bloques de código con syntax highlighting
   - Listas, tablas, blockquotes
   - Enlaces y imágenes
   - Diseño responsive

## Cómo Usar

### Para Usuarios
1. Navega a cualquier pregunta en el sitio
2. Desplázate hasta la parte inferior, debajo del formulario de agregar respuesta
3. Haz clic en el botón "Get AI Response"
4. Observa cómo la respuesta se genera en tiempo real
5. El contenido final se mostrará formateado con estilos Markdown

### Para Desarrolladores

#### Estructura de Archivos
```
client/
  pages/questions/[slug].js     # Componente principal con lógica de streaming
  styles/markdown.css           # Estilos para contenido Markdown
  
server/
  controllers/moderation.js     # Controlador con endpoint de streaming
  routes.js                    # Rutas incluyendo ai-stream
  services/aiService.js        # Servicio de AI (Mistral)
```

#### API del Endpoint
```javascript
GET /api/questions/:questionId/ai-stream
```

Respuesta de streaming (Server-Sent Events):
```javascript
// Durante la generación
data: {"content": "texto parcial", "isComplete": false}

// Al completar
data: {"content": "", "isComplete": true, "fullResponse": "respuesta completa en markdown"}

// En caso de error
data: {"error": "mensaje de error"}
```

#### Configuración Requerida

1. **Variables de Entorno**:
   ```env
   MISTRAL_API_KEY=tu_clave_de_mistral
   ```

2. **Dependencias del Servidor**:
   ```json
   "@mistralai/mistralai": "^1.10.0",
   "marked": "^16.3.0",
   "dompurify": "^3.2.7"
   ```

3. **Dependencias del Cliente**:
   ```json
   "marked": "^16.3.0",
   "dompurify": "^3.2.7"
   ```

## Seguridad

- El contenido HTML se sanitiza usando DOMPurify antes de renderizarse
- Los headers CORS están configurados para el streaming
- El endpoint no requiere autenticación pero puede ser modificado fácilmente

## Personalización

### Estilos CSS
Los estilos se pueden personalizar editando `/client/styles/markdown.css`:

```css
.markdown-content {
  /* Estilos base */
}

.markdown-content h1, h2, h3 {
  /* Estilos de encabezados */
}

.markdown-content pre code {
  /* Estilos de código */
}
```

### Configuración del AI
El prompt y configuración del AI se pueden modificar en `/server/controllers/moderation.js`:

```javascript
// Personalizar el prompt
let prompt = `**Título:** ${question.title}\n\n`;
prompt += `**Pregunta:** ${question.text}\n\n`;
// ... agregar más contexto
```

## Funcionalidades Avanzadas

### Markdown Soportado
- Encabezados (`# ## ###`)
- Texto en **negrita** e *cursiva*
- `Código inline` y bloques de código
- Listas numeradas y con viñetas
- Enlaces y imágenes
- Tablas
- Blockquotes
- Líneas horizontales

### Streaming en Tiempo Real
- El contenido se muestra mientras se genera
- Indicador visual de progreso
- Manejo de errores y reconexión automática
- Cancelación de solicitud disponible

## Próximas Mejoras Sugeridas

1. **Persistencia**: Guardar las respuestas de AI en la base de datos
2. **Votación**: Permitir votar respuestas de AI
3. **Moderación**: Sistema de aprobación para respuestas de AI
4. **Personalización**: Permitir configurar el tipo de respuesta (técnica, general, etc.)
5. **Caché**: Implementar caché para respuestas frecuentes
6. **Rate Limiting**: Limitar solicitudes por usuario
7. **Syntax Highlighting**: Mejorar el resaltado de código
8. **MathJax**: Soporte para fórmulas matemáticas