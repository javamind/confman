confmanager
==========

Do you want to implement continuous delivery or continuous deployment on your own tools ? We were in this situation. We had to implement continuous deployment but we did'nt want to use a big solution like Puppet, Chef, Go...

Our need is only to use a simple configuration manager. One repository where all our conf is stocked and no other tools to run scripts. For that we usually use Jenkins and our ops wanted to keep their scripts.

So we decided to develop a very simple conf manager and share it for every people who have the same needing.

Gradle
==========

The lifecycle is managed with Gradle. To configure gradle you can add a gradle.properties on the root of the
project. For example

    org.gradle.daemon=true
    db.driver=org.postgresql.Driver
    db.url=jdbc:postgresql://localhost:5432/confman
    db.username=confman
    db.password=confman
    db.supressclose=true
    hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    hibernate.show_sql=true
    flyway.user=confman
    flyway.password=confman
    flyway.url=jdbc:postgresql://localhost:5432/confman
    flyway.schemas=confman

install database
==========

For this first version, we choose a DBMS. You can use PostgreSql or Oracle, but you will be able to use others
databases in next versions. To manage database we use http://flywaydb.org/

To clean the database use
    gradle flywayClean -i

To migrate the database use
    gradle flywayMigrate -i

To see all the revisions use
    gradle flywayInfo -i