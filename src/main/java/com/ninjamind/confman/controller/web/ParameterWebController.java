package com.ninjamind.confman.controller.web;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.dto.ParameterDto;
import com.ninjamind.confman.service.ParameterFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Rest API for {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/parameter")
public class ParameterWebController extends AbstractConfmanWebController<Parameter, ParameterDto, Long>{

    @Autowired
    public ParameterWebController(ParameterFacade genericFacade) {
        super(genericFacade, ParameterDto.class, Parameter.class);
    }

}
