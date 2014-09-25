confman
==========

Do you want to implement continuous delivery or continuous deployment on your own tools ? We were in this situation. We had to implement continuous deployment but we did'nt want to use a big solution like Puppet, Chef, Go...

Our need is only to use a simple configuration manager. One repository where all our conf are stocked and no other tools to run scripts. For that we usually use Jenkins and our ops wanted to keep their scripts.

So we decided to develop a very simple configuration manager and share it for every people who have the same needing.

Build confman
==========
The project lifecycle is managed with Gradle. To configure gradle you can add a gradle.properties in the root of the project. For example

    org.gradle.daemon=true

    #DB properties Postgre SQL (default)
    db.postgresql.driver=org.postgresql.Driver
    db.postgresql.url=jdbc:postgresql://localhost:5432/confman
    db.postgresql.username=confman
    db.postgresql.password=confman
    db.postgresql.supressclose=true
    db.postgresql.schemas=confman
    db.postgresql.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    db.postgresql.hibernate.show_sql=true

    #DB properties Postgre SQL (default)
    db.oracle.driver=oracle.jdbc.driver.OracleDriver
    db.oracle.url=jdbc:oracle:thin:@localhost:1521:ORA
    db.oracle.username=confman
    db.oracle.password=confman
    db.oracle.supressclose=true
    db.oracle.schemas=confman
    db.oracle.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    db.oracle.hibernate.show_sql=true

You can easily add a new database. For this, you have to complete the file gradle.properties

    db.[myOwnDatabase].driver=...
    db.[myOwnDatabase].url=...
    db.[myOwnDatabase].username=...
    db.[myOwnDatabase].password=...
    db.[myOwnDatabase].supressclose=...
    db.[myOwnDatabase].schemas=...
    db.[myOwnDatabase].hibernate.dialect=...
    db.[myOwnDatabase].hibernate.show_sql=...

When you launch gradle you have to specify your database name. For example gradlew.bat -Pdatabase=oracle clean build

The default database is PostgreSql, but you can easily use Oracle or add your own.

To manage database scripts we use Flyway Db (http://flywaydb.org/). With gradle you can use

To clean the database use
    gradlew flywayClean -i

To migrate the database use
    gradlew flywayMigrate -i

To see all the revisions use
    gradlew flywayInfo -i


Install confman
==========
To use Confman you have to create a new schema in your favorite DBMS. For the moment postgreSQL is the default database but you can use Oracle or configure your own.