package com.ninjamind.confman.web.app;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.dto.EnvironmentDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.EnvironmentFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rest API for {@link com.ninjamind.confman.domain.Environment}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/app/environment")
public class EnvironmentController extends AbstractConfmanController<Environment, EnvironmentDto, Long>{

    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public EnvironmentController(EnvironmentFacade genericFacade) {
        super(genericFacade, EnvironmentDto.class, Environment.class);
    }

    @RequestMapping("/application/{id}")
    public List<EnvironmentDto> listByApp(@PathVariable Long id) {
        return applicationFacade.findEnvironmentByIdApp(id).stream().map(env -> new EnvironmentDto(env)).collect(Collectors.toList());
    }

    /**
     * @return one entity by its identifiant
     */
    @RequestMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EnvironmentDto get(@PathVariable Long id) {
        Environment dto = genericFacade.findOne(id);
        //dto.setLabel("spring-loaded");
        return convertToDto(dto);
    }

}
