/*psql -U postgres -f creacion.sql*/

DROP DATABASE IF EXISTS red_social;
CREATE DATABASE red_social;

\c red_social

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(40) UNIQUE NOT NULL,
    nickname VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(15) NOT NULL,
    surname1 VARCHAR(15) NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(8) CHECK (role IN ('admin', 'regular')) NOT NULL,
    surname2 VARCHAR(15),
    avatar TEXT DEFAULT 'https://cdn-icons-png.freepik.com/512/3607/3607444.png',
    description VARCHAR(150)
);

CREATE TABLE following (
    follower INT REFERENCES users(id),
    followed INT REFERENCES users(id),
    PRIMARY KEY (follower, followed)
);

CREATE TABLE posts (
    id_user INT REFERENCES users(id),
    creation_date TIMESTAMPTZ DEFAULT NOW(),
    tittle VARCHAR(20),
    description VARCHAR(150),
    picture TEXT
);