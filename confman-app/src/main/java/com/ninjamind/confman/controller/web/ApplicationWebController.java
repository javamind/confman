package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.dto.ApplicationDto;
import com.ninjamind.confman.service.ApplicationFacade;
import net.codestory.http.annotations.Delete;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.List;
import java.util.stream.Collectors;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class ApplicationWebController {
    @Autowired
    @Qualifier("applicationFacade")
    private ApplicationFacade<Application, Long> genericFacade;

    @Get("/application")
    public List<ApplicationDto> list() {
        return Lists.transform(genericFacade.findAll(), env -> new ApplicationDto(env));
    }

    @Get("/application/environment/:id")
    public List<ApplicationDto> listByEnv(Long id) {
        return Lists.transform(genericFacade.findApplicationByIdEnv(id), env -> new ApplicationDto(env));
    }

    @Get("/application/:id")
    public ApplicationDto get(Long id) {
        Application app = genericFacade.findOneWthDependencies(id);
        return app!=null ? getApplicationDto(app) : new ApplicationDto();
    }

    @Put("/application")
    public ApplicationDto update(ApplicationDto app) {
        Preconditions.checkNotNull(app, "Object is required to update it");
        return getApplicationDto(genericFacade.save(app.toApplication(), app.toInstances(), app.toParameters(), app.toApplicationVersions()));
    }

    @Post("/application")
    public ApplicationDto save(ApplicationDto app) {
        Preconditions.checkNotNull(app, "Object is required to save it");
        return getApplicationDto(genericFacade.save(app.toApplication(), app.toInstances(), app.toParameters(), app.toApplicationVersions()));
    }

    @Delete("/application/:id")
    public void delete(Long id) {
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
