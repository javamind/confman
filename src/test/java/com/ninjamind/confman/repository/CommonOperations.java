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
 * @author Guillaume EHRET
 */
public class CommonOperations {
    public static final Operation DELETE_ALL =
            deleteAllFrom(
                    ParameterValue.TABLE_NAME,
                    TrackingVersion.TABLE_NAME,
                    SoftwareSuiteEnvironment.TABLE_NAME,
                    Parameter.TABLE_NAME,
                    ParameterGroupment.TABLE_NAME,
                    Instance.TABLE_NAME,
                    ApplicationVersion.TABLE_NAME,
                    Application.TABLE_NAME,
                    SoftwareSuite.TABLE_NAME,
                    Environment.TABLE_NAME
                    );

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
                    .columns("id", "code", "label", "application_id", "environment_id", "version", "active")
                    .values(1, "WWD450", "app server", 1, 1, 0, true)
                    .build();

    public static final Operation INSERT_VERSION =
            insertInto(ApplicationVersion.TABLE_NAME)
                    .columns("id", "code", "label", "application_id", "version", "active", "blocked")
                    .values(1, "1.0.0", "app version", 1, 0, true, false)
                    .build();

    public static final Operation INSERT_PARAMETER =
            insertInto(Parameter.TABLE_NAME)
                    .columns("id", "code", "label", "application_id", "type", "version", "active")
                    .values(1, "app.maxuser", "Max user for the pool", 1, "APPLICATION", 0,  true)
                    .values(2, "server.name", "Server name", 1 , "INSTANCE", 0,  true)
                    .build();

    public static final Operation INSERT_VERSION_TRACKING =
            insertInto(TrackingVersion.TABLE_NAME)
                    .columns("id", "code", "label", "applicationVersion_id", "version", "active", "blocked")
                    .values(1, "a.1", "version", 1, 0, true, false)
                    .build();

    public static final Operation INSERT_PARAMETER_VALUE =
            insertInto(ParameterValue.TABLE_NAME)
                    .columns("id", "code", "label", "environment_id", "trackingversion_id","parameter_id","instance_id", "application_id", "version", "active")
                    .values(1, "app.maxuser", "5", 1, 1, 1, null, 1, 0, true)
                    .values(2, "server.name", "WWD450", 1, 1, 2, 1, 1, 0, true)
                    .values(3, "pagination1", "pagination1", 1, 1, 2, 1, 1, 0, true)
                    .values(4, "pagination2", "pagination2", 1, 1, 2, 1, 1, 0, true)
                    .values(5, "pagination3", "pagination3", 1, 1, 2, 1, 1, 0, true)
                    .values(6, "pagination4", "pagination4", 1, 1, 2, 1, 1, 0, true)
                    .values(7, "pagination5", "pagination5", 1, 1, 2, 1, 1, 0, true)
                    .values(8, "pagination6", "pagination6", 1, 1, 2, 1, 1, 0, true)
                    .values(9, "pagination7", "pagination7", 1, 1, 2, 1, 1, 0, true)
                    .build();
}