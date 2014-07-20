package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.dto.EnvironmentDto;
import com.ninjamind.confman.service.GenericFacade;
import net.codestory.http.annotations.Delete;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class EnvironmentController {
    @Autowired
    @Qualifier("environmentFacade")
    private GenericFacade<Environment, Long> genericFacade;

    @Get("/environment")
    public List<EnvironmentDto> list() {
        return Lists.transform(genericFacade.findAll(), env -> new EnvironmentDto(env));
    }

    @Get("/environment/:id")
    public EnvironmentDto get(Long id) {
        return new EnvironmentDto(genericFacade.findOne(id));
    }

    @Put("/environment")
    public EnvironmentDto update(EnvironmentDto env) {
        Preconditions.checkNotNull(env, "Object is required to update it");
        return new EnvironmentDto(genericFacade.save(env.toEnvironment()));
    }

    @Post("/environment")
    public EnvironmentDto save(EnvironmentDto env) {
        Preconditions.checkNotNull(env, "Object is required to save it");
        return new EnvironmentDto(genericFacade.save(env.toEnvironment()));
    }

    @Delete("/environment/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
