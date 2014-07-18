package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.Operations;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.domain.*;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class CommonOperations {
    public static final Operation DELETE_ALL =
            Operations.deleteAllFrom(
                    Parameter.TABLE_NAME,
                    ParameterGroupment.TABLE_NAME,
                    Instance.TABLE_NAME,
                    VersionTracking.TABLE_NAME,
                    ApplicationVersion.TABLE_NAME,
                    Application.TABLE_NAME,
                    ApplicationGroupment.TABLE_NAME,
                    Environment.TABLE_NAME);
}
