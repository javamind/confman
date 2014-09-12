CREATE TABLE environment
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  version integer,
  active boolean,
  CONSTRAINT environment_unique_key UNIQUE (code)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE softwaresuite
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  version integer,
  active boolean,
  CONSTRAINT softwaresuite_id_unique_key UNIQUE (code)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE softwaresuite_environment
(
  environment_id integer NOT NULL REFERENCES environment (id),
  softwaresuite_id integer NOT NULL REFERENCES softwaresuite (id),
  version integer,
  active boolean,
  CONSTRAINT softwaresuite_env_id_unique_key UNIQUE (environment_id, softwaresuite_id)
)
WITH (
  OIDS=FALSE
);


CREATE TABLE application
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  softwaresuite_id integer REFERENCES softwaresuite (id),
  version integer,
  active boolean,
  CONSTRAINT application_unique_key UNIQUE (code)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE applicationversion
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  application_id integer NOT NULL REFERENCES application (id),
  blocked boolean,
  version integer,
  active boolean,
  CONSTRAINT applicationversion_unique_key UNIQUE (code, application_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE trackingversion
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  applicationVersion_id integer NOT NULL REFERENCES applicationversion (id),
  version integer,
  active boolean,
  blocked boolean,
  CONSTRAINT trackingversion_unique_key UNIQUE (code, applicationVersion_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE instance
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  application_id integer NOT NULL REFERENCES application (id),
  environment_id integer NOT NULL REFERENCES environment (id),
  version integer,
  active boolean,
  CONSTRAINT instance_unique_key UNIQUE (code, application_id, environment_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE parametergrpt
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  version integer,
  active boolean,
  CONSTRAINT parametergrpt_unique_key UNIQUE (code)
)
WITH (
  OIDS=FALSE
);

CREATE TYPE typeparameter AS ENUM ('APPLICATION', 'INSTANCE');
CREATE TABLE parameter
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(250),
  parameterGroupment_id integer REFERENCES parametergrpt (id),
  application_id integer NOT NULL REFERENCES application (id),
  version integer,
  active boolean,
  type character varying(40) NOT NULL,
  CONSTRAINT parameter_unique_key UNIQUE (code, application_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE parametervalue
(
  id integer NOT NULL PRIMARY KEY,
  code character varying(40),
  label character varying(2500),
  oldvalue character varying(2500),
  environment_id integer NOT NULL REFERENCES environment (id),
  trackingVersion_id integer NOT NULL REFERENCES trackingversion (id),
  parameter_id integer NOT NULL REFERENCES parameter (id),
  instance_id integer REFERENCES instance (id),
  application_id integer NOT NULL REFERENCES application (id),
  version integer,
  active boolean
)
WITH (
  OIDS=FALSE
);

CREATE SEQUENCE seq_application
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_softwaresuite
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_application_version
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_environment
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_instance
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_parameter
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_parameter_value
    START WITH 100
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_parameter_grpt
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_version_tracking
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;