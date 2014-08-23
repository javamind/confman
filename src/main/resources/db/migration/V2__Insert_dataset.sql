INSERT INTO environment (id, code, label, version, active) VALUES(1 ,'DEV', 'Development', 1, true);
INSERT INTO environment (id, code, label, version, active) VALUES(2 ,'STAG', 'Staging', 1, true);
INSERT INTO environment (id, code, label, version, active) VALUES(3 ,'PRD', 'Production', 1, true);

INSERT INTO softwaresuite (id, code, label, version, active) VALUES(1 , 'SALES', 'The legacy app to manage sales', 1, true);
INSERT INTO softwaresuite (id, code, label, version, active) VALUES(2 , 'CUSTOMER', 'Customer management', 1, true);

INSERT INTO softwaresuite_environment (environment_id, softwaresuite_id, version, active) VALUES(1 , 1, 1, true);
INSERT INTO softwaresuite_environment (environment_id, softwaresuite_id, version, active) VALUES(2 , 1, 1, true);
INSERT INTO softwaresuite_environment (environment_id, softwaresuite_id, version, active) VALUES(3 , 1, 1, true);
INSERT INTO softwaresuite_environment (environment_id, softwaresuite_id, version, active) VALUES(1 , 2, 1, true);
INSERT INTO softwaresuite_environment (environment_id, softwaresuite_id, version, active) VALUES(2 , 2, 1, true);

INSERT INTO application (id, code, label, softwaresuite_id, version,active) VALUES(1 , 'SALES', 'articles prices, sales, and statistics', 1, 1, true);
INSERT INTO application (id, code, label, softwaresuite_id, version,active) VALUES(2 , 'CUSWEB', 'Webapp to manage customer', 1, 1, true);
INSERT INTO application (id, code, label, softwaresuite_id, version,active) VALUES(3 , 'CUSMOB', 'Mobile application to manage customer', 1, 1, true);
INSERT INTO application (id, code, label, softwaresuite_id, version,active) VALUES(4 , 'CUSSERV', 'Application JEE to manage customer', 1, 1, true);

INSERT INTO applicationversion (id, code, label, application_id, blocked, version,active) VALUES(1 ,'3.0.0','New version for continous delivery', 1, true, 1, true);
INSERT INTO applicationversion (id, code, label, application_id, blocked, version,active) VALUES(2 ,'3.0.1','Add reports in statistics', 1, true, 1, true);
INSERT INTO applicationversion (id, code, label, application_id, blocked, version,active) VALUES(3 ,'3.0.2','Bug correction', 1, true, 1, true);
INSERT INTO applicationversion (id, code, label, application_id, blocked, version,active) VALUES(4 ,'1.0.0','Version', 1, true, 1, true);
INSERT INTO applicationversion (id, code, label, application_id, blocked, version,active) VALUES(5 ,'1.0.0','Version', 2, true, 1, true);
INSERT INTO applicationversion (id, code, label, application_id, blocked, version,active) VALUES(6 ,'1.0.0','Version', 3, true, 1, true);

INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(1 ,'3.0.0-track.1','New app version', 1, true, 1, true);
INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(2 ,'3.0.1-track.1','New app version', 2, true, 1, true);
INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(3 ,'3.0.2-track.1','New app version', 3, true, 1, true);
INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(4 ,'3.0.2-track.2','Add new instance', 3, true, 1, true);
INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(5 ,'1.0.0-track.1','New app version', 4, true, 1, true);
INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(6 ,'1.0.0-track.1','New app version', 5, true, 1, true);
INSERT INTO trackingversion (id, code, label, applicationVersion_id, blocked, version,active) VALUES(7 ,'1.0.0-track.1','New app version', 6, true, 1, true);

INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(1 ,'WD450','Dev server', 1, 1, 1, true);
INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(2 ,'WS450','Staging server', 1, 2, 1, true);
INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(3 ,'WP450','Primary server', 1, 3, 1, true);
INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(4 ,'WP451','Slave server', 1, 3, 1, true);
INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(5 ,'WD460','Web server', 2, 1, 1, true);
INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(6 ,'MDAND20','Nexus 5 for developper', 3, 1, 1, true);
INSERT INTO instance (id, code, label, application_id, environment_id, version,active) VALUES(7 ,'WD460','Jboss server', 4, 1, 1, true);

INSERT INTO parametergrpt (id, code, label, version, active) VALUES(1 ,'DATABASE','Database parameters', 1, true);
INSERT INTO parametergrpt (id, code, label, version, active) VALUES(2 ,'WEB','Web parameters', 1, true);
INSERT INTO parametergrpt (id, code, label, version, active) VALUES(3 ,'SERVER','Server parameters', 1, true);

INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(1 ,'jdbc.url','URL jdbc', 1, 1, 1, true, 'APPLICATION');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(2 ,'jdbc.username','App user', 1, 1, 1, true, 'APPLICATION');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(3 ,'jdbc.password','Password of the app user', 1, 1, 1, true, 'APPLICATION');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(4 ,'jdbc.driver','Database driver', 1, 1, 1, true, 'APPLICATION');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(5 ,'server.name','Name', 3, 1, 1, true, 'INSTANCE');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(6 ,'server.port','Port', 3, 1, 1, true, 'INSTANCE');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(7 ,'tomcatdir','Path where tomcat is installed', 3, 1, 1, true, 'INSTANCE');
INSERT INTO parameter (id, code, label, parameterGroupment_id, application_id, version, active, type) VALUES(8 ,'server.loglevel','Log level', 3, 1, 1, false, 'INSTANCE');

--dev for 3.0.0.a app SALES
INSERT INTO parametervalue (id, code, label, environment_id, trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(1 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 1, 1, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(2 ,'jdbc.username','SALESUSR', 1, 1, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(3 ,'jdbc.password','SALESPWD', 1, 1, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(4 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 1, 1, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(5 ,'server.name','WD450', 1, 1, 5, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(6 ,'server.port','8082', 1, 1, 6, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(7 ,'tomcatdir','d:\\tomcat', 1, 1, 7, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(8 ,'server.loglevel','DEBUG', 1, 1, 8, 1, 1, 1, true);
--staging for 3.0.0.a  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(9 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 2, 1, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(10 ,'jdbc.username','SALESUSR', 2, 1, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(11 ,'jdbc.password','SALESPWD', 2, 1, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(12 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 2, 1, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(13 ,'server.name','WS450', 2, 1, 5, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(14 ,'server.port','8082', 2, 1, 6, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(15 ,'tomcatdir','d:\\tomcat', 2, 1, 7, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(16 ,'server.loglevel','DEBUG', 2, 1, 8, 2, 1, 1, true);
--prod for 3.0.0.a  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(17 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 3, 1, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(18 ,'jdbc.username','SALESUSR', 3, 1, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(19 ,'jdbc.password','SALESPWD', 3, 1, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(20 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 3, 1, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(21 ,'server.name','WP450', 3, 1, 5, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(22 ,'server.port','8082', 3, 1, 6, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(23 ,'tomcatdir','d:\\tomcat', 3, 1, 7, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(24 ,'server.loglevel','DEBUG', 3, 1, 8, 3, 1, 1, true);

--dev for 3.0.1.a app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(25 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA',1,  2, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(26 ,'jdbc.username','SALESUSR',1,  2, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(27 ,'jdbc.password','SALESPWD',1,  2, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(28 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver',1,  2, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(29 ,'server.name','WD450',1,  2, 5, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(30 ,'server.port','8082',1,  2, 6, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(31 ,'tomcatdir','d:\\tomcat',1,  2, 7, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(32 ,'server.loglevel','DEBUG',1,  2, 8, 1, 1, 1, true);
--staging for 3.0.1.a  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(33 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 2, 2, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(34 ,'jdbc.username','SALESUSR', 2, 2, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(35 ,'jdbc.password','SALESPWD', 2, 2, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(36 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 2, 2, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(37 ,'server.name','WS450', 2, 2, 5, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(38 ,'server.port','8082', 2, 2, 6, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(39 ,'tomcatdir','d:\\tomcat', 2, 2, 7, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(40 ,'server.loglevel','DEBUG', 2, 2, 8, 2, 1, 1, true);
--prod for 3.0.1.a  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(41 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 3, 2, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(42 ,'jdbc.username','SALESUSR', 3, 2, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(43 ,'jdbc.password','SALESPWD', 3, 2, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(44 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 3, 2, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(45 ,'server.name','WP450', 3, 2, 5, 4, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(46 ,'server.port','8082', 3, 2, 6, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(47 ,'tomcatdir','d:\\tomcat', 3, 2, 7, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(48 ,'server.loglevel','DEBUG', 3, 2, 8, 3, 1, 1, true);

--dev for 3.0.2.a app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(49 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA',1,  3, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(50 ,'jdbc.username','SALESUSR',1,  3, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(51 ,'jdbc.password','SALESPWD',1,  3, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(52 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver',1,  3, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(53 ,'server.name','WD450',1,  3, 5, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(54 ,'server.port','8082',1,  3, 6, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(55 ,'tomcatdir','d:\\tomcat',1,  3, 7, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(56 ,'server.loglevel','DEBUG',1,  3, 8, 1, 1, 1, true);
--staging for 3.0.2.a  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(57 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 2, 3, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(58 ,'jdbc.username','SALESUSR', 2, 3, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(59 ,'jdbc.password','SALESPWD', 2, 3, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(60 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 2, 3, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(61 ,'server.name','WS450', 2, 3, 5, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(62 ,'server.port','8082', 2, 3, 6, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(63 ,'tomcatdir','d:\\tomcat', 2, 3, 7, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(64 ,'server.loglevel','DEBUG', 2, 3, 8, 2, 1, 1, true);
--prod for 3.0.2.a  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(65 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 3, 3, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(66 ,'jdbc.username','SALESUSR', 3, 3, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(67 ,'jdbc.password','SALESPWD', 3, 3, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(68 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 3, 3, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(69 ,'server.name','WP450', 3, 3, 5, 4, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(70 ,'server.port','8082', 3, 3, 6, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(71 ,'tomcatdir','d:\\tomcat', 3, 3, 7, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(72 ,'server.loglevel','DEBUG', 3, 3, 8, 3, 1, 1, true);

--dev for 3.0.2.b app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(73 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA',1,  4, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(74 ,'jdbc.username','SALESUSR',1,  4, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(75 ,'jdbc.password','SALESPWD',1,  4, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(76 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver',1,  4, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(77 ,'server.name','WD450',1,  4, 5, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(78 ,'server.port','8082',1,  4, 6, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(79 ,'tomcatdir','d:\\tomcat',1,  4, 7, 1, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(80 ,'server.loglevel','DEBUG',1,  4, 8, 1, 1, 1, true);
--staging for 3.0.2.b  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(81 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 2, 4, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(82 ,'jdbc.username','SALESUSR', 2, 4, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(83 ,'jdbc.password','SALESPWD', 2, 4, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(84 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 2, 4, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(85 ,'server.name','WS450', 2, 4, 5, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(86 ,'server.port','8082', 2, 4, 6, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(87 ,'tomcatdir','d:\\tomcat', 2, 4, 7, 2, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(88 ,'server.loglevel','DEBUG', 2, 4, 8, 2, 1, 1, true);
--prod for 3.0.2.b  app SALES
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(89 ,'jdbc.url','jdbc:oracle:thin:@oradev:1521:ORA', 3, 4, 1, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(90 ,'jdbc.username','SALESUSR', 3, 4, 2, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(91 ,'jdbc.password','SALESPWD', 3, 4, 3, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(92 ,'jdbc.driver','oracle.jdbc.driver.OracleDriver', 3, 4, 4, null, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(93 ,'server.name','WP451', 3, 4, 5, 4, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(94 ,'server.port','8082', 3, 4, 6, 4, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(95 ,'tomcatdir','d:\\tomcat', 3, 4, 7, 4, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(96 ,'server.loglevel','DEBUG', 3, 4, 8, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(97 ,'server.name','WP450', 3, 4, 5, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label, environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(98 ,'server.port','8082', 3, 4, 6, 3, 1, 1, true);
INSERT INTO parametervalue (id, code, label,     environment_id,  trackingVersion_id, parameter_id, instance_id, application_id, version, active) VALUES(99 ,'tomcatdir','d:\\tomcat', 3, 4, 7, 3, 1, 1, true);
