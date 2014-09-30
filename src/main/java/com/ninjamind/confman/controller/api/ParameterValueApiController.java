package com.ninjamind.confman.controller.api;

import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.exception.VersionException;
import com.ninjamind.confman.exception.VersionTrackingException;
import com.ninjamind.confman.service.ParameterValueFacade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/confman/paramvalue")
public class ParameterValueApiController {
    private static Logger LOG = LoggerFactory.getLogger(ParameterValueApiController.class);

    @Autowired
    private ParameterValueFacade parameterValueFacade;

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication and a version
     */
    @RequestMapping(value = "/{codeApp}/version/{version}")
    public List<ParameterValueDto> getByVersion(String codeApp, String version) {
        return parameterValueFacade.findParamatersByCodeVersion(codeApp, version).stream().map(p -> new ParameterValueDto(p)).collect(Collectors.toList());
    }

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication, a version and an anvironment
     */
    @RequestMapping(value = "/{codeApp}/version/{version}/env/{env}")
    public List<ParameterValueDto> getByVersionAndEnv(@PathVariable String codeApp, @PathVariable String version, @PathVariable String env) {
        try {
            return parameterValueFacade.findParamatersByCodeVersionAndEnv(codeApp, version, env).stream().map(p -> new ParameterValueDto(p)).collect(Collectors.toList());
        }
        catch (VersionTrackingException | VersionException e){
            LOG.error("Error when readParameters", e);
            return new ArrayList<>();
        }
    }

    /**
     * Visible for testing
     * @param parameterValueFacade
     */
    public void setParameterValueFacade(ParameterValueFacade parameterValueFacade) {
        this.parameterValueFacade = parameterValueFacade;
    }
}
