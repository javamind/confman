confman
==========

Do you want to implement continuous delivery or continuous deployment on your own tools ? We were in this situation. We had to implement continuous deployment but we did'nt want to use a big solution like Puppet, Chef, Go...

Our need is only to use a simple configuration manager. One repository where all our conf are stocked and no other tools to run scripts. For that we usually use Jenkins and our ops wanted to keep their scripts.

So we decided to develop a very simple configuration manager and share it for every people who have the same needing.

You want to particpate ?
==========
The project is open source on the MIT License (MIT)

    Copyright (c) <year> <copyright holders>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

So let's go

Build confman with Gradle
==========

Gradles's settings
------------
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

When you launch gradle you have to specify your database name. For example gradlew.bat -Pdatabase=oracle clean build. The default database is PostgreSql, but you can easily use Oracle or add your own.

Create the Confman's database
------------
To manage database scripts we use Flyway Db (http://flywaydb.org/). With gradle you can use

To clean the database use
    gradlew flywayClean -i

To migrate the database use
    gradlew flywayMigrate -i

To see all the revisions use
    gradlew flywayInfo -i

Build confman
------------
The project have 2 parts : a client and a server

Install confman
==========
To use Confman you have to create a new schema in your favorite DBMS. For the moment postgreSQL is the default database but you can use Oracle or configure your own.


To launch the app in debug mode you have to use this command
     ./gradlew bootRun -x client:npmInstall -x client:npmBuild -PjvmArgs="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005 -Dspring.security.strategy=MODE_GLOBAL"


-Dserver.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005"
-Drun.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005"
-Drun.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
run {
    jvmArgs = ['-Xdebug', '-Xrunjdwp:server=y,transport=dt_socket,address=4000,suspend=y']
}

spring.security.strategy=MODE_GLOBAL
