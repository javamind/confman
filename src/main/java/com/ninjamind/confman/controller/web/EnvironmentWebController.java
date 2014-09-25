package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.EnvironmentDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.EnvironmentFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/environment")
public class EnvironmentWebController {
    @Autowired
    @Qualifier("environmentFacade")
    private EnvironmentFacade environmentFacade;

    @Autowired
    private ApplicationFacade applicationFacade;

    @RequestMapping
    public List<EnvironmentDto> list() {
        return Lists.transform(environmentFacade.findAll(), env -> new EnvironmentDto(env));
    }

    @RequestMapping("/application/{id}")
    public List<EnvironmentDto> listByApp(@PathVariable Long id) {
        return Lists.transform(applicationFacade.findEnvironmentByIdApp(id), env -> new EnvironmentDto(env));
    }

    @RequestMapping("/{id}")
    public EnvironmentDto get(@PathVariable Long id) {
        return new EnvironmentDto(environmentFacade.findOne(id));
    }

    @RequestMapping(method = RequestMethod.PUT)
    public EnvironmentDto update(EnvironmentDto env) {
        Preconditions.checkNotNull(env, "Object is required to update it");
        return new EnvironmentDto(environmentFacade.update(env.toEnvironment()));
    }

    @RequestMapping(method = RequestMethod.POST)
    public EnvironmentDto save(EnvironmentDto env) {
        Preconditions.checkNotNull(env, "Object is required to save it");
        return new EnvironmentDto(environmentFacade.create(env.toEnvironment()));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        environmentFacade.delete(id);
    }
}
