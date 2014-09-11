package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.ConfmanDto;
import com.ninjamind.confman.dto.ParameterDto;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.ParameterRepository;
import com.ninjamind.confman.service.*;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the web GUI.
 *
 * @author Guillaume EHRET
 */
public class ApiPublicController {

    @Autowired
    private ParameterValueFacade<ParameterValue, Long> parameterValueFacade;

    @Autowired
    private ParameterFacade<Parameter, Long> parameterFacade;


    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication and a version
     */
    @Get("/confman/paramvalues/:codeApp/version/:version")
    public List<ParameterValueDto> getByVersion(String codeApp, String version) {
       return Lists.transform(parameterValueFacade.findParamatersByCodeVersion(codeApp, version), p -> new ParameterValueDto(p));
    }

    /**
     * @param codeApp
     * @param version
     * @return all the params for an appication, a version and an anvironment
     */
    @Get("/confman/paramvalues/:codeApp/version/:version/env/:env")
    public List<ParameterValueDto> getByVersionAndEnv(String codeApp, String version, String env) {
        return Lists.transform(parameterValueFacade.findParamatersByCodeVersionAndEnv(codeApp, version, env), p -> new ParameterValueDto(p));
    }

    /**
     * Save a parameter in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Post("/confman/params")
    public void saveParam(ConfmanDto confmanDto) {
        Preconditions.checkNotNull(confmanDto, "DTO ConfmanDto is required");
        Preconditions.checkNotNull(confmanDto.getCodeApplication(), "application code is required");
        Preconditions.checkNotNull(confmanDto.getCodeParameter(), "parameter code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "parameter label is required");

        parameterFacade.addParameterToApplication(confmanDto.getCodeApplication(), confmanDto.getCodeParameter(), confmanDto.getLabel());
    }

    /**
     * Read a parameter
     * @param codeApp
     * @param codeParam
     * @return
     */
    @Get("/confman/params/:codeApp/param/:param")
    public ConfmanDto getParam(String codeApp, String codeParam) {
        Preconditions.checkNotNull(codeApp, "application code is required");
        Preconditions.checkNotNull(codeParam, "parameter code is required");
        Parameter parameter = parameterFacade.findParameterApplication(codeApp, codeParam);

        if(parameter==null){
            return null;
        }
        return new ConfmanDto().setCodeParameter(parameter.getCode()).setLabel(parameter.getLabel()).setCodeApplication(parameter.getApplication().getCode())
                .setId(parameter.getId());
    }
}
