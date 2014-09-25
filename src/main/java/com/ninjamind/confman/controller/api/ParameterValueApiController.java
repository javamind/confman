package com.ninjamind.confman.controller.api;

import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.service.ParameterValueFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/confman/paramvalue")
public class ParameterValueApiController {

    @Autowired
    private ParameterValueFacade parameterValueFacade;

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication and a version
     */
    @RequestMapping(value = "/{codeApp}/version/{version}")
    public List<ParameterValueDto> getByVersion(String codeApp, String version) {
        return Lists.transform(parameterValueFacade.findParamatersByCodeVersion(codeApp, version), p -> new ParameterValueDto(p));
    }

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication, a version and an anvironment
     */
    @RequestMapping(value = "/{codeApp}/version/{version}/env/{env}")
    public List<ParameterValueDto> getByVersionAndEnv(@PathVariable String codeApp, @PathVariable String version, @PathVariable String env) {
        return Lists.transform(parameterValueFacade.findParamatersByCodeVersionAndEnv(codeApp, version, env), p -> new ParameterValueDto(p));
    }

    /**
     * Visible for testing
     * @param parameterValueFacade
     */
    public void setParameterValueFacade(ParameterValueFacade parameterValueFacade) {
        this.parameterValueFacade = parameterValueFacade;
    }
}
