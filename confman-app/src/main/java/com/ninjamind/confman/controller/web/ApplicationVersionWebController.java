package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.dto.ApplicationVersionDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.ApplicationVersionFacade;
import net.codestory.http.annotations.Delete;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.List;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class ApplicationVersionWebController {
    @Autowired
    @Qualifier("applicationVersionFacade")
    private ApplicationVersionFacade<ApplicationVersion, Long> genericFacade;

    @Autowired
    private ApplicationFacade<Application, Long> applicationFacade;

    @Get("/applicationversion")
    public List<ApplicationVersionDto> list() {
        return Lists.transform(genericFacade.findAll(), version -> new ApplicationVersionDto(version));
    }

    @Get("/applicationversion/application/:id")
    public List<ApplicationVersionDto> getByApp(Long id) {
        return Lists.transform(applicationFacade.findApplicationVersionByIdApp(id), instance -> new ApplicationVersionDto(instance));
    }

    @Get("/applicationversion/check/:version")
    public boolean check(String version) {
        return genericFacade.checkVersionNumber(version);
    }

    @Get("/applicationversion/:id")
    public ApplicationVersionDto get(Long id) {
        return new ApplicationVersionDto(genericFacade.findOne(id));
    }

    @Put("/applicationversion")
    public ApplicationVersionDto update(ApplicationVersionDto version) {
        Preconditions.checkNotNull(version, "Object is required to update it");
        return new ApplicationVersionDto(genericFacade.save(version.toApplicationVersion()));
    }

    @Post("/applicationversion")
    public ApplicationVersionDto save(ApplicationVersionDto version) {
        Preconditions.checkNotNull(version, "Object is required to save it");
        return new ApplicationVersionDto(genericFacade.save(version.toApplicationVersion()));
    }

    @Delete("/applicationversion/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }


}
