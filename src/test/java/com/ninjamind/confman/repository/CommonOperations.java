package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.domain.*;

import static com.ninja_squad.dbsetup.Operations.deleteAllFrom;
import static com.ninja_squad.dbsetup.Operations.insertInto;
import static com.ninja_squad.dbsetup.Operations.sequenceOf;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class CommonOperations {
    public static final Operation DELETE_ALL =
            deleteAllFrom(
                    Parameter.TABLE_NAME,
                    ParameterGroupment.TABLE_NAME,
                    Instance.TABLE_NAME,
                    VersionTracking.TABLE_NAME,
                    ApplicationVersion.TABLE_NAME,
                    Application.TABLE_NAME,
                    SoftwareSuiteEnvironment.TABLE_NAME,
                    SoftwareSuite.TABLE_NAME,
                    Environment.TABLE_NAME);

    public static final Operation INSERT_ENVIRONMENT = sequenceOf(
            insertInto(Environment.TABLE_NAME)
                    .columns("id", "code", "label", "version", "active")
                    .values(1, "dev", "Development", 1, true)
                    .values(2, "prd", "Production", 1, true)
                    .build()
    );

    public static final Operation INSERT_SOFTWARE_SUITE =
            insertInto(SoftwareSuite.TABLE_NAME)
                    .columns("id", "code", "label", "version", "active")
                    .values(1, "ARP", "Arpege", 1, true)
                    .build();

    public static final Operation INSERT_SOFTWARE_SUITE_ENV =
            insertInto(SoftwareSuiteEnvironment.TABLE_NAME)
                    .columns("environment_id", "softwaresuite_id", "active")
                    .values(1, 1, true)
                    .build();

    public static final Operation INSERT_APP =
            insertInto(Application.TABLE_NAME)
                    .columns("id", "code", "label", "softwaresuite_id", "version", "active")
                    .values(1, "CFM", "Confman manage yours parameters", 1, 0, true)
                    .build();

    public static final Operation INSERT_INSTANCE =
            insertInto(Instance.TABLE_NAME)
                    .columns("id", "code", "label", "application_id", "version", "active")
                    .values(1, "WWD450", "app server", 1, 0, true)
                    .build();

    public static final Operation INSERT_VERSION =
            insertInto(ApplicationVersion.TABLE_NAME)
                    .columns("id", "code", "label", "application_id", "version", "active", "blocked")
                    .values(1, "1.0.0", "app version", 1, 0, true, false)
                    .build();

    public static final Operation INSERT_PARAMETER =
            insertInto(Parameter.TABLE_NAME)
                    .columns("id", "code", "label", "application_id", "type", "instance_id", "version", "active")
                    .values(1, "app.maxuser", "Max user for the pool", 1, "APPLICATION", null, 0,  true)
                    .values(2, "server.name", "Server name", null , "INSTANCE", 1, 0,  true)
                    .build();
}