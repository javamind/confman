package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.dto.ParameterValueDto;
import net.codestory.http.annotations.Get;

import java.util.List;

/**
 * This controller is the public API which can be use by script to read datas from confman
 *
 * @author EHRET_G
 */
public class PublicController {


    @Get("/confman/params/:version")
    public List<ParameterValueDto> getByVersion(String version) {
       Preconditions.checkNotNull(version, "version is required");

       return null;
    }

    @Get("/confman/params/:version/env/:env")
    public List<ParameterValueDto> getByVersionAndEnv(String version, String env) {
        Preconditions.checkNotNull(version, "version is required");
        Preconditions.checkNotNull(env, "environnement is required");
        return null;
    }
}
