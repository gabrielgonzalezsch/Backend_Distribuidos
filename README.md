![](https://i.ibb.co/sCHRR2w/front.png)

#### **Front** 
http://35.238.72.67:3000/

#### **Back**
http://34.121.111.178:5000/

#### **BD Maestra**
http://34.72.210.185:55432/

#### **BD Esclavo**
http://34.72.210.185:65432/


# PEP 2 Sistemas Distribuidos 
Con el objetivo de aplicar los conocimientos adquiridos en cátedra, para esta segunda entrega se procederá a implementar, en lo posible,  la mayor cantidad de características propias de un sistema distribuido dentro de la aplicación. Algunas de las características que no cumple el sistema anteriormente implementado son:
- **Disponibilidad**
- **Transparencia:** 
    - **Ubicación**
    - **Re-Localización**
    - **Migración**
    - **Replicación**
    - **Fallas**
- **Escalabilidad:**
    - **Horizontal**
    
 Para satisfacer las características mencionadas, se disponen de las siguientes propuestas.
 
- **Disponibilidad:** La entrega de disponibilidad de sistema o aplicación, se puede abordar de dos puntos o perspectivas.
    - **Replicación de datos:**  Esto en el sentido de disponer de bases de datos adicionales que se encargen de entregar un respaldo de la información que maneja el servicio, esto sería para los casos en que exista un fallo en la base de datos principal, y con la réplica de esta, tener los recursos siempre disponibles al usuario. Lo anterior se puede lograr mediantes dos maneras, la primera es con la implementación de un servicio por parte de un proveedor externo como es Cloud SQL de google, que permite la replicación de bases de datos. La segunda es una implementación via docker, que siga una estructura de maestro-esclavo entre las BD principal y sus réplicas.
    - **Replicación de recursos** Por otro lado, se puede hacer uso de Kubernetes para la balancear y gestionar la carga de recursos en los nodos de trabajo, los cuales se encargaran de mantener el sistema disponible en caso una instancia no sea suficiente para la cantidad de tráfico requerido. En estos últimos recaerá la distribución de los recursos que utilizan los recursos del sistema. 
    
- **Transparencia:** 
    - **Ubicación:** Para solventar esta característica se puede dotar al sistema de una dirección, o dominio DNS, que permita identificar y reconocer fácilmente el sistema dentro de la WEB.
    - **Re-Localización:** Esta característica se puede satisfacer con la misma implementación del punto anterior, es decir, que con el protocolo DNS, se puede solventar la reubicación del sitio web de la aplicación. En consecuencia de lo anterior, se mantendrá la transparencia hacia al cliente con el mismo dominio anteriormente utilizado.
    - **Migración:** Esta característica se puede lograr con el uso de docker, herramienta que genera un ambiente de encapsulamiento, para cada módulo de la aplicación. Esta tecnología es altamente configurable, y permite levantar el módulo sin importar el sistema operativo en que se esté ejecutando.
    - **Replicación:** Como se mencionó anteriormente en el apartado de disponibilidad, se puede hacer uso de la replicación (tanto en la base de datos como en los recursos) para entregar transparencia al usuario.
    - **Falla:** Con el uso de los servicios de Google Cloud, se puede transparentar fácilmente todos los fallos que presenten los nodos, workloads y contenedores de la aplicación, esto por medio de las herramientas que ofrece el servicio, tales como registros gráficos o LOGs que permiten el detallado específico de cada componente.
    
- **Escalabilidad:**
    - **Horizontal:** Esta característica se puede solventar haciendo uso  de la herramienta Docker, en conjunto con los servicios de Kubernetes entregados por Google Cloud. Este último permite una auto-escalabilidad, haciendo uso de contenedores aislados, repartidos dentro de una cierta cantidad de nodos, los cuales pueden auto balancear la carga ejercida en el sistema, esto acorde con la carga de tráfico que presente el sistema.
    
    
## Modificaciones en la arquitectura

Primero que nada se migraron los recursos a los servidores de Google Cloud Platform, con el fin de explotar las herramientas que este proveedor externo ofrece, como fue el uso de Google Kubernetes Engines (GKE), en esta transición se dockerizo los servicios de back y front, con tal de ingresarlos y desplegarlos correctamente dentro del encapsulamiento de los workloads del servicio. Se configuró el cluster con 3 nodos, los cuales ofrecen una opción de balanceo de carga, entre cierta cantidad de pods. En nuestro caso, definimos de 1 a 5 pods para cada servicio incrustado en los nodos. Se definió esta estructura con el fin de entregar un servicio que se auto-modifica y auto-escala en recursos cuando sea necesario, sea así, si existe un exceso de tráfico de red, uso de CPU, falta de memoria, etc, la aplicación se distribuirá en una cierta cantidad de pods disponibles. 
Luego de igual forma, se realizaron modificaciones en algunos servicios que ofrece el backend, los cuales presentaban fallos en cuanto a las respuestas que entregaba para ciertos casos.

Finalmente, se implementó una base de datos con capacidad de replicación, que sigue una estructura de maestro-esclavo, lo anterior se agregó con el fin de contar con información de respaldo para los casos en que la base de datos principal presente problemas, o simplemente se encuentre caída.

Para esta segunda entrega se implementaron las siguientes características:

- **Disponibilidad:** Con el uso de GKE, se cuenta con una alta disponibilidad de los servicios, esto gracias a la implementación de un balanceador de carga, que se modifica a razón de la demanda que presente el sistema.
- **Transparencia:**
    - **Migración:** Con el uso de docker la migración de esta aplicación se puede realizar con una gran facilidad, ya que basta solo con levantar la imagen de la aplicación por medio de un Dockerfile, dentro de cualquier ambiente que tenga soporte para esta herramienta.
    - **Replicación:** Al aplicar la estructura de maestro-esclavo en la base de datos, se puede contar con una alta replicación de los datos dentro del sistema. Por otro lado, la utilización de GKE permite una replicación de los recursos y servicios para la disposición de la aplicación.

- **Apertura:**
    - **Portabilidad:** El uso de imagenes docker permitio mejorar la portabilidad que presentaba originalmente el sistema.

- **Escalabilidad:**
    - **Horizontal/Vertical:** El servicio de GKE permite la escalabilidad horizontal y vertical, esto en el sentido de la asignación de recursos requeridos, lo que haría referencia al auto-escalamiento vertical, como también al balanceo del tráfico dentro de los pods, lo que permite el auto-escalamiento horizontal.



## Diagrama de Componentes

![](https://i.ibb.co/k6z400T/Imagen-1.png)


## Diagrama de Despliegue  

![](https://i.ibb.co/MStgTkM/imagen-2.png)


## Test Artillery
Para ver la capacidad de procesamiento del servidor, se decidio hacer uso de Artillery, herramienta que permite crear simular peticiones con tal de analizar las metricas de rendimiento que posee la aplicación o pagina. Para lo anterior, se decidio generar 2 archivos para los scripts de las pruebas, el primero es una peticion POST para generar un permiso a partir de un usuario ficticio, por otro lado, el segundo es una peticion GET para obtener los permisos que se encuentren almacenados en el sistema.

#### **POST**

![](https://i.ibb.co/xYrrX1v/testpost.png)

De las solicitudes, se puede apreciar:
- De las 1500 solicitudes, se completaron exitosamente 1500, teniendo un 100% de exito en las consultas.
- El tiempo promedio de respuesta fue de 4389.4 ms por solicitud, con una máxima de  41158.4 ms, y mínima 328 ms.

#### **GET**
![](https://i.ibb.co/rbT65nZ/testget.png)

De las solicitudes, se desprenden los siguientes datos:
- De las 1500 solicitudes, se completaron exitosamente 1210, fallando aproximadamente en 19% de los casos.
- El tiempo promedio de respuesta fue de 6825 ms por solicitud, con una máxima de 104106.7 ms y mínima de 323.9 ms


Podemos concluir que existio un notable mejoramiento del performance de la consulta POST, y en caso contrario de la consulta GET. Lo anterior se puede justificar, debido a que las pruebas de la primera PEP fueron todas dentro de un ambiente local, lo cual favorecio el tiempo de respuesta de la consulta GET. Por otro lado, en esta segunda entrega podemos destacar que tener la aplicacion dentro de un GKE mejora el rendimiento en el balanceo de carga de la consulta POST.



