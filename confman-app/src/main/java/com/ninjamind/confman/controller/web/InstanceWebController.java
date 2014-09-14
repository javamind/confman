package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.GenericFacade;
import com.ninjamind.confman.service.InstanceFacade;
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
public class InstanceWebController {
    @Autowired
    @Qualifier("instanceFacade")
    private InstanceFacade genericFacade;

    @Autowired
    private ApplicationFacade applicationFacade;

    @Get("/instance")
    public List<InstanceDto> list() {
        return Lists.transform(genericFacade.findAll(), instance -> new InstanceDto(instance));
    }

    @Get("/instance/application/:id")
    public List<InstanceDto> listApp(Long id) {
        return Lists.transform(applicationFacade.findInstanceByIdAppOrEnv(id, null), instance -> new InstanceDto(instance));
    }

    @Get("/instance/application/:id/environment/:idEnv")
    public List<InstanceDto> listApp(Long idApp, Long idEnv) {
        return Lists.transform(applicationFacade.findInstanceByIdAppOrEnv(idApp, idEnv), instance -> new InstanceDto(instance));
    }

    @Get("/instance/environment/:id")
    public List<InstanceDto> listEnv(Long id) {
        return Lists.transform(applicationFacade.findInstanceByIdAppOrEnv(null, id), instance -> new InstanceDto(instance));
    }

    @Get("/instance/:id")
    public InstanceDto get(Long id) {
        return new InstanceDto(genericFacade.findOne(id));
    }

    @Put("/instance")
    public InstanceDto update(InstanceDto instance) {
        Preconditions.checkNotNull(instance, "Object is required to update it");
        return new InstanceDto(genericFacade.update(instance.toInstance()));
    }

    @Post("/instance")
    public InstanceDto save(InstanceDto instance) {
        Preconditions.checkNotNull(instance, "Object is required to save it");
        return new InstanceDto(genericFacade.create(instance.toInstance()));
    }

    @Delete("/instance/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
