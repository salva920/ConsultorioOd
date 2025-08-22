# Configuración de Notificaciones Automáticas

Este sistema incluye un servicio de recordatorios automáticos que envía notificaciones por email y WhatsApp cuando se registran citas.

## Variables de Entorno Requeridas

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

### Configuración de Email (Gmail)
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicación
```

**Nota:** Para Gmail, necesitas usar una "Contraseña de aplicación" en lugar de tu contraseña normal:
1. Ve a tu cuenta de Google
2. Activa la verificación en dos pasos
3. Ve a "Seguridad" > "Contraseñas de aplicación"
4. Genera una nueva contraseña para esta aplicación

### Configuración de WhatsApp (Twilio)
```env
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Para configurar Twilio:**
1. Crea una cuenta en [Twilio](https://www.twilio.com/)
2. Obtén tu Account SID y Auth Token del dashboard
3. Compra un número de WhatsApp Business API
4. Usa el formato: `whatsapp:+1234567890` para el número

## Tipos de Recordatorios

El sistema crea automáticamente 4 recordatorios por cada cita:

- **24 horas antes** - Recordatorio principal
- **2 horas antes** - Recordatorio de confirmación
- **1 hora antes** - Recordatorio final
- **30 minutos antes** - Recordatorio urgente

## Funcionalidades

### Automáticas
- ✅ Creación automática de recordatorios al registrar una cita
- ✅ Actualización automática de recordatorios al cambiar la fecha de una cita
- ✅ Cancelación automática de recordatorios al eliminar una cita
- ✅ Envío automático de notificaciones según la programación

### Manuales
- 📧 Reenvío manual de recordatorios
- 📊 Estadísticas de recordatorios enviados
- ⚙️ Control del servicio (iniciar/detener)
- 🔄 Procesamiento manual de recordatorios pendientes

## Endpoints de la API

### Recordatorios
- `GET /api/reminders` - Obtener todos los recordatorios
- `GET /api/reminders/:id` - Obtener un recordatorio específico
- `GET /api/reminders/stats` - Estadísticas de recordatorios
- `GET /api/reminders/status` - Estado del servicio

### Gestión
- `POST /api/reminders/create` - Crear recordatorios manualmente
- `DELETE /api/reminders/appointment/:appointmentId` - Cancelar recordatorios de una cita
- `POST /api/reminders/:id/resend` - Reenviar un recordatorio

### Servicio
- `POST /api/reminders/service/start` - Iniciar servicio
- `POST /api/reminders/service/stop` - Detener servicio
- `POST /api/reminders/service/process` - Procesar recordatorios pendientes

## Mensajes de Notificación

### Email
- Diseño profesional con HTML
- Información completa de la cita
- Instrucciones importantes para el paciente
- Responsive design

### WhatsApp
- Mensaje formateado con emojis
- Información clara y concisa
- Instrucciones de llegada
- Formato fácil de leer

## Monitoreo y Logs

El sistema registra todas las actividades:
- Creación de recordatorios
- Envío exitoso de notificaciones
- Errores en el envío
- Cancelaciones y actualizaciones

## Solución de Problemas

### Error de Email
- Verifica que las credenciales de Gmail sean correctas
- Asegúrate de usar una contraseña de aplicación
- Verifica que la verificación en dos pasos esté activada

### Error de WhatsApp
- Verifica las credenciales de Twilio
- Asegúrate de que el número esté verificado
- Verifica que tengas saldo en tu cuenta de Twilio

### Recordatorios no se envían
- Verifica que el servicio esté ejecutándose
- Revisa los logs del servidor
- Verifica la configuración de las variables de entorno

## Pruebas

Para probar el sistema:

1. **Configura las variables de entorno**
2. **Inicia el servidor:** `npm start`
3. **Crea una cita** con fecha futura
4. **Verifica los recordatorios** en la base de datos
5. **Monitorea los logs** para ver el envío automático

## Seguridad

- Las credenciales se almacenan en variables de entorno
- Los mensajes no contienen información sensible
- El sistema valida la existencia de pacientes y citas antes de enviar
- Los recordatorios se cancelan automáticamente si la cita se elimina 