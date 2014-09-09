CREATE TABLE environment
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT environment_unique_key UNIQUE (code),
  CONSTRAINT environment_pk PRIMARY KEY (id)
);


CREATE TABLE softwaresuite
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT softwaresuite_id_unique_key UNIQUE (code),
  CONSTRAINT softwaresuite_pk PRIMARY KEY (id)
);

CREATE TABLE softwaresuite_environment
(
  environment_id NUMBER NOT NULL,
  softwaresuite_id NUMBER NOT NULL,
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT softenv_pk PRIMARY KEY (environment_id, softwaresuite_id),
  CONSTRAINT softenv_fk1 FOREIGN KEY (environment_id) REFERENCES environment (id),
  CONSTRAINT softenv_fk2 FOREIGN KEY (softwaresuite_id) REFERENCES softwaresuite (id)
);


CREATE TABLE application
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  softwaresuite_id NUMBER,
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT application_unique_key UNIQUE (code),
  CONSTRAINT application_pk PRIMARY KEY (id),
  CONSTRAINT application_fk1 FOREIGN KEY (softwaresuite_id) REFERENCES softwaresuite (id)

);

CREATE TABLE applicationversion
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  application_id NUMBER NOT NULL REFERENCES application (id),
  blocked NUMBER(1),
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT applicationversion_unique_key UNIQUE (code, application_id),
  CONSTRAINT applicationversion_pk PRIMARY KEY (id),
  CONSTRAINT applicationversion_fk1 FOREIGN KEY (application_id) REFERENCES application (id)
);

CREATE TABLE trackingversion
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  applicationVersion_id NUMBER NOT NULL,
  version NUMBER,
  active NUMBER(1),
  blocked NUMBER(1),
  CONSTRAINT trackingversion_unique_key UNIQUE (code, applicationVersion_id),
  CONSTRAINT trackingversion_pk PRIMARY KEY (id),
  CONSTRAINT trackingversion_fk1 FOREIGN KEY (applicationVersion_id) REFERENCES applicationversion (id)
);

CREATE TABLE instance
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  application_id NUMBER NOT NULL,
  environment_id NUMBER NOT NULL,
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT instance_unique_key UNIQUE (code, application_id, environment_id),
  CONSTRAINT instance_pk PRIMARY KEY (id),
  CONSTRAINT instance_fk1 FOREIGN KEY (application_id) REFERENCES application (id),
  CONSTRAINT instance_fk2 FOREIGN KEY (environment_id) REFERENCES environment (id)
);

CREATE TABLE parametergrpt
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT parametergrpt_unique_key UNIQUE (code),
  CONSTRAINT parametergrpt_pk PRIMARY KEY (id)
);

CREATE TABLE parameter
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(250),
  parameterGroupment_id NUMBER,
  application_id NUMBER NOT NULL,
  version NUMBER,
  active NUMBER(1),
  type VARCHAR2(40) NOT NULL,
  CONSTRAINT parameter_unique_key UNIQUE (code, application_id),
  CONSTRAINT parameter_pk PRIMARY KEY (id),
  CONSTRAINT parameter_fk1 FOREIGN KEY (parameterGroupment_id) REFERENCES parametergrpt (id),
  CONSTRAINT parameter_fk2 FOREIGN KEY (application_id) REFERENCES application (id)
);

CREATE TABLE parametervalue
(
  id NUMBER NOT NULL,
  code VARCHAR2(40),
  label VARCHAR2(2500),
  oldvalue VARCHAR2(2500),
  environment_id NUMBER NOT NULL REFERENCES environment (id),
  trackingVersion_id NUMBER NOT NULL REFERENCES trackingversion (id),
  parameter_id NUMBER NOT NULL REFERENCES parameter (id),
  instance_id NUMBER REFERENCES instance (id),
  application_id NUMBER NOT NULL REFERENCES application (id),
  version NUMBER,
  active NUMBER(1),
  CONSTRAINT parametervalue_pk PRIMARY KEY (id),
  CONSTRAINT parametervalue_fk1 FOREIGN KEY (environment_id) REFERENCES environment (id),
  CONSTRAINT parametervalue_fk2 FOREIGN KEY (trackingVersion_id) REFERENCES trackingversion (id),
  CONSTRAINT parametervalue_fk3 FOREIGN KEY (parameter_id) REFERENCES parameter (id),
  CONSTRAINT parametervalue_fk4 FOREIGN KEY (instance_id) REFERENCES instance (id),
  CONSTRAINT parametervalue_fk5 FOREIGN KEY (application_id) REFERENCES application (id)
);

CREATE SEQUENCE seq_application
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_softwaresuite
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_application_version
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_environment
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_instance
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_parameter
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_parameter_value
    START WITH 100
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_parameter_grpt
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_version_tracking
    START WITH 10
    INCREMENT BY 1
    NOMINVALUE
    NOMAXVALUE
    NOCACHE
    NOCYCLE;