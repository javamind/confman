package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.dto.SoftwareSuiteDto;
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
public class SoftwareSuiteController {
    @Autowired
    @Qualifier("softwareSuiteFacade")
    private GenericFacade<SoftwareSuite, Long> genericFacade;

    @Get("/softwaresuite")
    public List<SoftwareSuiteDto> list() {
        return Lists.transform(genericFacade.findAll(), env -> new SoftwareSuiteDto(env));
    }

    @Get("/softwaresuite/:id")
    public SoftwareSuiteDto get(Long id) {
        return new SoftwareSuiteDto(genericFacade.findOne(id));
    }

    @Put("/softwaresuite")
    public SoftwareSuiteDto update(SoftwareSuiteDto env) {
        Preconditions.checkNotNull(env, "Object is required to update it");
        return new SoftwareSuiteDto(genericFacade.save(env.toSoftwareSuite()));
    }

    @Post("/softwaresuite")
    public SoftwareSuiteDto save(SoftwareSuiteDto env) {
        Preconditions.checkNotNull(env, "Object is required to save it");
        return new SoftwareSuiteDto(genericFacade.save(env.toSoftwareSuite()));
    }

    @Delete("/softwaresuite/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
