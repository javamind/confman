package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.dto.ApplicationDto;
import com.ninjamind.confman.service.ApplicationFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/application")
public class ApplicationWebController {
    @Autowired
    @Qualifier("applicationFacade")
    private ApplicationFacade genericFacade;

    @RequestMapping
    public List<ApplicationDto> list() {
        return Lists.transform(genericFacade.findAll(), env -> new ApplicationDto(env));
    }

    @RequestMapping("/environment/{id}")
    public List<ApplicationDto> listByEnv(@PathVariable Long id) {
        return Lists.transform(genericFacade.findApplicationByIdEnv(id), env -> new ApplicationDto(env));
    }

    @RequestMapping("/{id}")
    public ApplicationDto get(@PathVariable Long id) {
        Application app = genericFacade.findOneWthDependencies(id);
        return app!=null ? getApplicationDto(app) : new ApplicationDto();
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ApplicationDto update(ApplicationDto app) {
        Preconditions.checkNotNull(app, "Object is required to update it");
        return getApplicationDto(genericFacade.save(app.toApplication(), app.toInstances(), app.toParameters(), app.toApplicationVersions()));
    }

    @RequestMapping(method = RequestMethod.POST)
    public ApplicationDto save(ApplicationDto app) {
        Preconditions.checkNotNull(app, "Object is required to save it");
        return getApplicationDto(genericFacade.save(app.toApplication(), app.toInstances(), app.toParameters(), app.toApplicationVersions()));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        genericFacade.delete(id);
    }

    private ApplicationDto getApplicationDto(Application app) {
        return new ApplicationDto(
                app,
                app.getApplicationVersions().stream().collect(Collectors.toList()),
                app.getInstances().stream().collect(Collectors.toList()),
                app.getParameters().stream().collect(Collectors.toList()));
    }

}
