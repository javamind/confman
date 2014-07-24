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
                    .columns("id", "code", "label", "version")
                    .values(1, "dev", "Development", 1)
                    .values(2, "prd", "Production", 1)
                    .build()
    );

    public static final Operation INSERT_SOFTWARE_SUITE =
            insertInto(SoftwareSuite.TABLE_NAME)
                    .columns("id", "code", "label", "version")
                    .values(1, "ARP", "Arpege", 1)
                    .build();

    public static final Operation INSERT_SOFTWARE_SUITE_ENV =
            insertInto(SoftwareSuiteEnvironment.TABLE_NAME)
                    .columns("environment_id", "softwaresuite_id")
                    .values(1, 1)
                    .build();
}