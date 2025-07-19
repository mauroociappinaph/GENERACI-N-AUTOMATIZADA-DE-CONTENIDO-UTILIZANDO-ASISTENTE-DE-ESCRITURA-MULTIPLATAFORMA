# Template_Backend 2.0

<!-- Hook test: Testing the Agent Hook system functionality -->

## Guía para iniciar el proyecto

Aquí están los comandos que necesitas para iniciar tu proyecto. Asegúrate de tener instalado Node.js la versión 18.16.1 y Yarn en tu sistema antes de ejecutar estos comandos.

```bash
# Instala las dependencias del proyecto
yarn install

# Construye el proyecto
yarn build

# Inicia el servidor de desarrollo
yarn dev

# Ruta para ver los endpoinst en swagger
http://localhost:2337/masterCloud


# Ruta para ver los endpoinst en postman
https://blue-crescent-607517.postman.co/workspace/blockchain_template~6aef778a-47f9-40d5-bbfa-c3b79a05dd4b/collection/33802662-9880f888-f656-48c8-9d9e-3c44a5924bbd?action=share&creator=33802662
```

Sigue estos pasos en orden. Primero, yarn install instalará todas las dependencias necesarias para tu proyecto. Luego, yarn build creará una versión de producción de tu proyecto. Finalmente, yarn dev iniciará el servidor de desarrollo, permitiéndote ver y probar tu proyecto en un entorno local.

## Estructura del Proyecto

Este proyecto utiliza una arquitectura de capas para desarrollar un backend usando Parse Server con Cloud Functions. A continuación se describe la estructura de las carpetas del proyecto:

📂 cloud: Carpeta principal que contiene todas las Cloud Functions.
📄 main.ts: Archivo principal que es la entrada de todas las Cloud Functions.
📂 MasterClouds: Carpeta de los endpoinst maestros para todas las aplicaciones .
📂 controllers: Contiene los controladores que se encargan de enviar la respuesta al cliente.
📄 findinTableController.ts: Controlador para las operaciones relacionadas con los filtar un campo por cualquier tabla.
📄 seederController.ts: Controlador para crear una tabla y su estrcutura .
📄 tableFromJSONController.ts: CRUD para los endpoints en donde se usan para interactuar con cualquier tabla .

📂 services: Contiene los servicios que se encargan de la lógica del negocio.
📄 findinTableService.ts: Servicio para la lógica de negocio relacionada obtener un dato de una tabla.
📄 seederServiceService.ts: Servicio para la lógica de negocio relacionada con crear una tabla.
📄 tableFromJSONService.ts: Servicio para la lógica de negocio del CRUD que interactua en una tabla.
📂 database: Se encarga de la interacción con la base de datos.
📄 findinTable.ts: Interacción con la base de datos para los filtar datos .
📄 seederService.ts: Interacción con la base de datos para crear una tabla y sus registros.
📄 tableFromJSON.ts: Interacción con la base de datos para el funcionamiento del CRUD.
📂 routes: Contiene las rutas de las Cloud Functions.
📄 index.ts: Importa todas las Cloud Functions para tener una sola entrada para estas.
📄 findInTableClouds.ts: Cloud Functions relacionadas con filtrar datos de una tabla.
📄 seederClouds.ts: Cloud Functions relacionadas con crear una tabla.
📄 tableFromJSONClouds.ts: Cloud Functions relacionadas con los el CRUD para interactuar una tabla.
📂 utils: Contiene funciones que realizan tareas repetitivas y que se pueden llamar en cualquier lugar del código.
📄 accessControl.ts: Función para verificar rol del usuario, y controlar el acceso segun un rol determinado.

Descripción detallada
📂 controllers: Contiene los controladores que se encargan de manejar las solicitudes entrantes y enviar respuestas a los clientes. Cada controlador se encarga de una entidad específica y contiene funciones para manejar las operaciones CRUD (Crear, Leer, Actualizar, Borrar) para esa entidad.

📂 services: Contiene los servicios que encapsulan la lógica del negocio. Cada servicio se encarga de una entidad específica y contiene funciones para realizar operaciones relacionadas con esa entidad, como asignación roles, verificación de roles, etc.

📂 routes: Contiene las rutas de las Cloud Functions. Cada archivo en esta carpeta define las rutas o endpoints para una entidad específica y asocia cada ruta con una función del controlador correspondiente.

📂 database: Se encarga de la interacción con la base de datos. Contiene archivos que definen las operaciones de la base de datos para cada entidad, como consultas, inserciones, actualizaciones y eliminaciones.

📂 utils: Esta carpeta contiene funciones que realizan tareas repetitivas y que se pueden llamar en cualquier lugar del código. En el proyecto se utiliza para verificar roles, verificar si un usuario esta autenticado entre otros.
