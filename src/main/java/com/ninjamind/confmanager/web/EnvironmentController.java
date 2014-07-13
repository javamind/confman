package com.ninjamind.confmanager.web;

import com.ninjamind.confmanager.domain.Environment;
import com.ninjamind.confmanager.service.GenericFacade;
import net.codestory.http.annotations.Delete;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

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
    public List<Environment> list() {
        return genericFacade.findAll();
    }

    @Get("/environment/:id")
    public Environment get(Long id) {
        return genericFacade.findOne(id);
    }

    @Put("/environment")
    public Environment update(Environment env) {
        return genericFacade.save(env);
    }

    @Post("/environment")
    public Environment save(Environment env) {
        return genericFacade.save(env);
    }

    @Delete("/environment/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
