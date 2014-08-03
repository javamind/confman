package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.dto.InstanceDto;
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
public class InstanceController {
    @Autowired
    @Qualifier("instanceFacade")
    private GenericFacade<Instance, Long> genericFacade;

    @Get("/instance")
    public List<InstanceDto> list() {
        return Lists.transform(genericFacade.findAll(), instance -> new InstanceDto(instance));
    }

    @Get("/instance/:id")
    public InstanceDto get(Long id) {
        return new InstanceDto(genericFacade.findOne(id));
    }

    @Put("/instance")
    public InstanceDto update(InstanceDto instance) {
        Preconditions.checkNotNull(instance, "Object is required to update it");
        return new InstanceDto(genericFacade.save(instance.toInstance()));
    }

    @Post("/instance")
    public InstanceDto save(InstanceDto instance) {
        Preconditions.checkNotNull(instance, "Object is required to save it");
        return new InstanceDto(genericFacade.save(instance.toInstance()));
    }

    @Delete("/instance/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
