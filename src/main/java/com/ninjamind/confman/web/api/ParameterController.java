package com.ninjamind.confman.web.api;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.ConfmanDto;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.service.ParameterFacade;
import com.ninjamind.confman.service.ParameterValueFacade;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the web GUI.
 *
 * @author Guillaume EHRET
 */
public class ParameterController {

    @Autowired
    private ParameterFacade<Parameter, Long> parameterFacade;

    /**
     * Create a parameter in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Post("/confman/param")
    public void addParam(ConfmanDto confmanDto) {
        saveparam(confmanDto, true);
    }

    /**
     * Save or update param
     * @param confmanDto
     * @param creation
     */
    private void saveparam(ConfmanDto confmanDto, boolean creation) {
        Preconditions.checkNotNull(confmanDto, "DTO ConfmanDto is required");
        Preconditions.checkNotNull(confmanDto.getCodeApplication(), "application code is required");
        Preconditions.checkNotNull(confmanDto.getCodeParameter(), "parameter code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "parameter label is required");

        parameterFacade.saveParameterToApplication(
                confmanDto.getCodeApplication(),
                confmanDto.getCodeParameter(),
                confmanDto.getLabel(),
                confmanDto.getTypeParameter(),
                creation);
    }

    /**
     * Update a parameter in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Put("/confman/param")
    public void updateParam(ConfmanDto confmanDto) {
        saveparam(confmanDto, false);
    }

    /**
     * Read a parameter
     * @param codeApp
     * @param codeParam
     * @return
     */
    @Get("/confman/param/:param/app/:codeApp")
    public ConfmanDto getParam(String codeParam, String codeApp) {
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
