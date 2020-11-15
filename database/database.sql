DROP DATABASE IF EXISTS comisaria;
CREATE DATABASE comisaria;



CREATE TABLE permisos(
    id SERIAL PRIMARY KEY,
    run VARCHAR(30) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    direccion VARCHAR(60) NOT NULL,
    motivo VARCHAR(40) NOT NULL,
    fecha TIMESTAMP NOT NULL
);


INSERT INTO permisos VALUES ('192453356','gabriel','av siempre viva','me pesan las weas','2001-02-16 20:38:40');

