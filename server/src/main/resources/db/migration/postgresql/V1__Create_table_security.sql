CREATE TABLE T_USER
(
  login character varying(50) NOT NULL,
  password character varying(100),
  email character varying(100),
  first_name character varying(50),
  last_name character varying(50),
  activated boolean default false,
  lang_key character varying(5),
  activation_key character varying(20),
  CONSTRAINT user_pk PRIMARY KEY (login)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE T_AUTHORITY
(
  name character varying(50) NOT NULL,
  CONSTRAINT authority_pk PRIMARY KEY (name)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE T_USER_AUTHORITY
(
  login character varying(50) NOT NULL REFERENCES T_USER (login),
  name character varying(50) NOT NULL REFERENCES T_AUTHORITY (name),
  CONSTRAINT user_authority_pk PRIMARY KEY (login, name)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE T_PERSISTENT_TOKEN
(
  series character varying(255) NOT NULL,
  user_login character varying(50) REFERENCES T_USER (login),
  token_value character varying(255) NOT NULL,
  token_date date,
  ip_address character varying(39),
  user_agent character varying(255),
  CONSTRAINT persistent_token_pk PRIMARY KEY (series)
)
WITH (
  OIDS=FALSE
);