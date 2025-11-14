# FRONTREND ANGULAR

Ejercicio para Backend:
• Hacer un API REST en PHP (sin usar a un framework) para manejar una lista de contactos.
• Tenemos que poder agregar nuevos contactos (nombre, apellido, email), listar los contactos y eliminar un contacto.

Recomendación: La API tiene que seguir las buenas prácticas de arquitectura en capa para separar el acceso a los datos.
• Bonus 1 : Agregar reglas de validación para no permitir de ingresar a datos vacías
• Bonus 2: Permitir agregar uno o varios números de teléfono a cada contacto.
• La API se llama desde una herramienta como Postman
Nota: Mandar ZIP o repositorio GIT de los archivos de ambos ejercicios con el tiempo que se tomó para la realización de los mismos.

# DESCRIPCION

Aplicación web para gestionar contactos, con creación, edición, eliminación y visualización de información de contacto (teléfonos y correo).  
Soporta modo Backend y LocalStorage, ideal para demostraciones y pruebas offline.

# TIEMPO SOLUCION

El frontend fue desarrollado en aproximadamente 6.5 horas, incluyendo creación de componentes reusables, formularios reactivos con validación, manejo de múltiples teléfonos, integración con LocalStorage/JSON y diseño de la interfaz.

# CARACTERISTICAS

- Listado de contactos en cards responsivas con scroll interno.
- Visualización detallada de cada contacto.
- Formulario reactivo para crear y editar contactos.
- Gestión de múltiples teléfonos por contacto.
- Eliminación de contactos y teléfonos.
- Toggle para cambiar entre Backend y LocalStorage .

# TECNOLOGIAS

- Angular 20.3.11
- Node.js 24.11.1
- npm 11.6.2
- Angular Material
- RxJS
- SCSS
- LocalStorage (modo offline)
- API REST opcional (backend)

# INSTALACION

1. Clonar el repositorio:

- https://github.com/julianstt8/contact_frontend.git

2. Instalar dependencias:

- npm install

3. Ejecutar la aplicacion:

- npm start o ng serve
