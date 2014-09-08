package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.service.ParameterValueFacade;
import net.codestory.http.annotations.Get;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * This controller is the public API which can be use by script to read datas from confman
 *
 * @author Guillaume EHRET
 */
public class ApiPublicController {

    @Autowired
    private ParameterValueFacade<ParameterValue, Long> parameterValueFacade;

    @Get("/confman/params/:codeApp/version/:version")
    public List<ParameterValueDto> getByVersion(String codeApp, String version) {
       return Lists.transform(parameterValueFacade.findParamatersByCodeVersion(codeApp, version), p -> new ParameterValueDto(p));
    }

    @Get("/confman/params/:codeApp/version/:version/env/:env")
    public List<ParameterValueDto> getByVersionAndEnv(String codeApp, String version, String env) {
        return Lists.transform(parameterValueFacade.findParamatersByCodeVersionAndEnv(codeApp, version, env), p -> new ParameterValueDto(p));
    }
}
