package com.ninjamind.confman.controller.api;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.service.ParameterValueFacade;
import net.codestory.http.annotations.Get;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
public class ParameterValueApiController {

    @Autowired
    private ParameterValueFacade<ParameterValue, Long> parameterValueFacade;

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication and a version
     */
    @Get("/confman/paramvalue/:codeApp/version/:version")
    public List<ParameterValueDto> getByVersion(String codeApp, String version) {
        return Lists.transform(parameterValueFacade.findParamatersByCodeVersion(codeApp, version), p -> new ParameterValueDto(p));
    }

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication, a version and an anvironment
     */
    @Get("/confman/paramvalue/:codeApp/version/:version/env/:env")
    public List<ParameterValueDto> getByVersionAndEnv(String codeApp, String version, String env) {
        return Lists.transform(parameterValueFacade.findParamatersByCodeVersionAndEnv(codeApp, version, env), p -> new ParameterValueDto(p));
    }

}
