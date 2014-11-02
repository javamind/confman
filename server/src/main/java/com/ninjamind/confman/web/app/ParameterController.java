package com.ninjamind.confman.web.app;

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
@RequestMapping(value = "/app/parameter")
public class ParameterController extends AbstractConfmanController<Parameter, ParameterDto, Long>{

    @Autowired
    public ParameterController(ParameterFacade genericFacade) {
        super(genericFacade, ParameterDto.class, Parameter.class);
    }

}
