# Documentación de la API del Backend

Este documento detalla los endpoints disponibles en la API del backend. La API se divide en dos contextos principales según el subdominio utilizado.

### 1. API Principal (`api.tudominio.com`)

Este subdominio se utiliza para acciones globales que no pertenecen a una empresa específica, como la autenticación, la gestión de usuarios o la creación de nuevas empresas.

### 2. API de Empresa (`slug-de-la-empresa.tudominio.com`)

Cada empresa tiene su propio subdominio, basado en su `slug`. Todas las acciones específicas de una empresa (gestionar servicios, empleados, ver el dashboard, etc.) se realizan a través de este subdominio.

---

## A. Endpoints de la API Principal (`api.tudominio.com`)

### A.1. Autenticación

#### `POST /auth/login`

**URL Completa:** `https://api.tudominio.com/auth/login`

**Descripción:** Autentica a un usuario y devuelve un token JWT.

**Autenticación/Autorización:** Pública.

---

### A.2. Usuarios

#### `POST /users`

**URL Completa:** `https://api.tudominio.com/users`

**Descripción:** Crea un nuevo usuario.

#### `GET /users`

**URL Completa:** `https://api.tudominio.com/users`

**Descripción:** Obtiene todos los usuarios (protegido).

#### `GET /users/:id`

**URL Completa:** `https://api.tudominio.com/users/:id`

**Descripción:** Obtiene un usuario por su ID.

#### `PUT /users/:id`

**URL Completa:** `https://api.tudominio.com/users/:id`

**Descripción:** Actualiza un usuario por su ID.

#### `DELETE /users/:id`

**URL Completa:** `https://api.tudominio.com/users/:id`

**Descripción:** Elimina un usuario por su ID.

---

### A.3. Creación y Listado de Empresas

#### `POST /businesses`

**URL Completa:** `https://api.tudominio.com/businesses`

**Descripción:** Crea una nueva empresa. El usuario autenticado se convierte en el propietario.

#### `GET /businesses`

**URL Completa:** `https://api.tudominio.com/businesses`

**Descripción:** Obtiene todas las empresas.

---

### A.4. Disponibilidad

#### `GET /availability`

**URL Completa:** `https://api.tudominio.com/availability`

**Descripción:** Obtiene los horarios disponibles de los empleados para un servicio y fecha específicos.

**Parámetros de Consulta:** `serviceId`, `date`.

---

### A.5. Reservas (Bookings)

#### `POST /bookings`

**URL Completa:** `https://api.tudominio.com/bookings`

**Descripción:** Crea una nueva reserva.

#### `GET /bookings/:id`

**URL Completa:** `https://api.tudominio.com/bookings/:id`

**Descripción:** Obtiene una reserva por su ID.

---

## B. Endpoints de la API de Empresa (`slug-de-la-empresa.tudominio.com`)

En todos los siguientes endpoints, `{slug-empresa}` debe ser reemplazado por el slug único de la empresa.

### B.1. Gestión de la Empresa

#### `GET /`

**URL Completa:** `https://{slug-empresa}.tudominio.com/`

**Descripción:** Obtiene los datos de la empresa actual.

#### `PUT /`

**URL Completa:** `https://{slug-empresa}.tudominio.com/`

**Descripción:** Actualiza los datos de la empresa actual. Solo para el propietario.

#### `DELETE /`

**URL Completa:** `https://{slug-empresa}.tudominio.com/`

**Descripción:** Elimina la empresa actual. Solo para el propietario.

---

### B.2. Servicios (`Service`)

#### `POST /services`

**URL Completa:** `https://{slug-empresa}.tudominio.com/services`

**Descripción:** Crea un nuevo servicio para la empresa.

#### `GET /services`

**URL Completa:** `https://{slug-empresa}.tudominio.com/services`

**Descripción:** Obtiene todos los servicios de la empresa.

#### `PUT /services/:serviceId`

**URL Completa:** `https://{slug-empresa}.tudominio.com/services/:serviceId`

**Descripción:** Actualiza un servicio específico.

---

### B.3. Empleados (`Employee`)

#### `POST /employees`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees`

**Descripción:** Añade un usuario existente como empleado a la empresa.

#### `GET /employees`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees`

**Descripción:** Obtiene todos los empleados de la empresa.

#### `POST /employees/:employeeId/services`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees/:employeeId/services`

**Descripción:** Asigna un servicio a un empleado.

---

### B.4. Horarios de Trabajo (`WorkSchedule`)

#### `POST /employees/:employeeId/work-schedules`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees/:employeeId/work-schedules`

**Descripción:** Crea un horario de trabajo para un empleado.

#### `GET /employees/:employeeId/work-schedules`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees/:employeeId/work-schedules`

**Descripción:** Obtiene los horarios de un empleado.

#### `GET /employees/:employeeId/work-schedules/:scheduleId`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees/:employeeId/work-schedules/:scheduleId`

**Descripción:** Obtiene los horarios.

#### `PUT /employees/:employeeId/work-schedules/:scheduleId`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees/:employeeId/work-schedules/:scheduleId`

**Descripción:** Edita los horarios.

#### `DELETE /employees/:employeeId/work-schedules/:scheduleId`

**URL Completa:** `https://{slug-empresa}.tudominio.com/employees/:employeeId/work-schedules/:scheduleId`

**Descripción:** Eleimina los horarios de un empleado.

---

### B.5. Dashboard

#### `GET /dashboard`

**URL Completa:** `https://{slug-empresa}.tudominio.com/dashboard`

**Descripción:** Obtiene datos agregados y estadísticas para el dashboard de la empresa.
