package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.dto.ApplicationVersionDto;
import com.ninjamind.confman.service.GenericFacade;
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
 * @author EHRET_G
 */
public class ApplicationVersionController {
    @Autowired
    @Qualifier("applicationVersionFacade")
    private GenericFacade<ApplicationVersion, Long> genericFacade;

    @Get("/applicationversion")
    public List<ApplicationVersionDto> list() {
        return Lists.transform(genericFacade.findAll(), version -> new ApplicationVersionDto(version));
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
