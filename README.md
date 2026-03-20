# Proyecto-Red-Social-CrJeJoIs

## ASGBD 2ASIR IES Miguel Romero Esteo 2025-2026

### Práctica Conexión a Bases de Datos

*La aplicación web a desarrollar será una red social formada por un conjunto de
vistas, algunas de ellas sólo podrán ser accedidas por aquellos usuarios que hayan
iniciado sesión. Además, habrá algunas que solo podrán ser accedidas por aquellos
usuarios que tengan ciertos permisos. Si un usuario no logueado quiere acceder a
una vista que necesita autenticar al usuario, se redirigirá al usuario a la ventana de
login o registro, una vez que se haya logueado o registrado se le redirigirá a donde
el usuario quería en un inicio.*

### Cambios respecto al enunciado:
- Los usuarios se loguean haciendo uso de su *nickname* y *contraseña*, en lugar de su *email* y *contraseña*.
- Durante el registro, el usuario no puede elegir una *imagen de avatar*, sino que tendrá que añadirla entrando en su perfil una vez creada su cuenta.
- Hemos añadido un *landing*, que aparece una vez accedes a la aplicación. También puedes volver al *landing* haciendo click en el nombre de la web a la izquierda en el nav.
- Como nuestra aplicación tiene un *landing*, al cerrar sesión, el usuario es redirigido a éste en lugar de al *login*, como pedía el enunciado.

### Observaciones
Hay algunos fallos / bugs que hemos encontrado pero hemos optado por no trabajar más en el proyecto por falta de tiempo, sino que los tendremos en cuenta a la hora de desarrollar el proyecto final:
- Si un usuario con avatar cierra su sesión y luego abre la sesión en el mismo navegador otro usuario diferente que no tenga avatar, el navegador carga la imagen del usuario anterior en el icono del usuario que aparece en el nav. Si se recarga el navegador (F5), la imagen deja de mostrarse y se muestra la imagen por defecto (que es la que debería mostrarse para este usuario).
- Problema con la eliminación de usuarios. Ejemplo: Tenemos dos navegadores, en uno usuario1 está logueado y en otro el usuario admin está logueado. Admin elimina al usuario1. Usuario1 tendrá problemas en la web, no recibirá ninguna información de los endpoints ni podrá interactuar con la página bien, porque el usuario ya no existe. No hay ningún control para que se le desloguee en caso de que se borre dicho usuario.
