CREATE TABLE environment
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  version integer,
  CONSTRAINT environment_unique_key UNIQUE (code)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE applicationgrpt
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  environment_id integer,
  version integer,
  CONSTRAINT applicationgrpt_unique_key UNIQUE (code, environment_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE application
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  applicationGroupment_id integer,
  version integer,
  CONSTRAINT application_unique_key UNIQUE (code, applicationGroupment_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE applicationversion
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  application_id integer,
  version integer,
  CONSTRAINT applicationversion_unique_key UNIQUE (code, application_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE versiontracking
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  applicationVersion_id integer,
  version integer,
  CONSTRAINT versiontracking_unique_key UNIQUE (code, applicationVersion_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE instance
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  versionTracking_id integer,
  version integer,
  CONSTRAINT instance_unique_key UNIQUE (code, versionTracking_id)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE parametergrpt
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  version integer,
  CONSTRAINT parametergrpt_unique_key UNIQUE (code)
)
WITH (
  OIDS=FALSE
);

CREATE TABLE parameter
(
  id integer NOT NULL,
  code character varying(40),
  label character varying(250),
  parameterGroupment_id integer,
  instance_id integer,
  version integer,
  CONSTRAINT parameter_unique_key UNIQUE (code, instance_id)
)
WITH (
  OIDS=FALSE
);

CREATE SEQUENCE seq_application
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_application_grpt
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_application_version
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_environment
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_instance
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_parameter
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_parameter_grpt
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE seq_version_tracking
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;