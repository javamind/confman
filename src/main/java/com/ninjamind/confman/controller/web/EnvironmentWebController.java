package com.ninjamind.confman.controller.web;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.dto.EnvironmentDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.EnvironmentFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rest API for {@link com.ninjamind.confman.domain.Environment}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/environment")
public class EnvironmentWebController extends AbstractConfmanWebController<Environment, EnvironmentDto, Long>{

    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public EnvironmentWebController(EnvironmentFacade genericFacade) {
        super(genericFacade, EnvironmentDto.class, Environment.class);
    }

    @RequestMapping("/application/{id}")
    public List<EnvironmentDto> listByApp(@PathVariable Long id) {
        return applicationFacade.findEnvironmentByIdApp(id).stream().map(env -> new EnvironmentDto(env)).collect(Collectors.toList());
    }
}
