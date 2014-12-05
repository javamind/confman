package com.ninjamind.confman.web.api;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.dto.ParameterConfmanDto;
import com.ninjamind.confman.service.ParameterFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping("/api/param")
public class ParameterApiController {

    @Autowired
    private ParameterFacade parameterFacade;

    /**
     * Create a parameter in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @RequestMapping(method = RequestMethod.POST)
    public void addParam(@RequestBody ParameterConfmanDto confmanDto) {
        saveparam(confmanDto, true);
    }

    /**
     * Save or update param
     * @param confmanDto
     * @param creation
     */
    private void saveparam(ParameterConfmanDto confmanDto, boolean creation) {
        Preconditions.checkNotNull(confmanDto, "DTO ConfmanDto is required");
        Preconditions.checkNotNull(confmanDto.getCodeApplication(), "application code is required");
        Preconditions.checkNotNull(confmanDto.getCode(), "parameter code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "parameter label is required");

        parameterFacade.saveParameterToApplication(
                confmanDto.getCodeApplication(),
                confmanDto.getCode(),
                confmanDto.getLabel(),
                confmanDto.getType(),
                creation);
    }

    /**
     * Update a parameter in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @RequestMapping(method = RequestMethod.PUT)
    public void updateParam(@RequestBody ParameterConfmanDto confmanDto) {
        saveparam(confmanDto, false);
    }

    /**
     * Read a parameter
     * @param codeApp
     * @param codeParam
     * @return
     */
    @RequestMapping(value = "/{codeParam}/app/{codeApp}")
    public ParameterConfmanDto getParam(@PathVariable String codeParam, @PathVariable String codeApp) {
        Preconditions.checkNotNull(codeApp, "application code is required");
        Preconditions.checkNotNull(codeParam, "parameter code is required");
        Parameter parameter = parameterFacade.getRepository().findByCode(codeApp, codeParam);

        if(parameter==null){
            return null;
        }
        return new ParameterConfmanDto()
                .setCode(parameter.getCode())
                .setLabel(parameter.getLabel())
                .setCodeApplication(parameter.getApplication().getCode())
                .setType(parameter.getType().toString())
                .setId(parameter.getId());
    }
}
