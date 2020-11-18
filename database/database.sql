DROP DATABASE IF EXISTS comisaria;
CREATE DATABASE comisaria;


CREATE TABLE permisos(
    id SERIAL PRIMARY KEY,
    run VARCHAR(30) NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    direccion VARCHAR(60) NOT NULL,
    motivo VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL,
    fechaInicio TIMESTAMP NOT NULL,
    fechaTermino TIMESTAMP NOT NULL
);


INSERT INTO permisos VALUES (DEFAULT,'192453356','gabriel','av siempre viva','me pesan las weas','matias.coronado@usach.cl','2001-02-16 20:38:40','2002-02-16 20:38:40');

