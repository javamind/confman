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
public class ParameterController {
    @Autowired
    @Qualifier("parameterFacade")
    private GenericFacade<Instance, Long> genericFacade;

    @Get("/parameter")
    public List<InstanceDto> list() {
        return Lists.transform(genericFacade.findAll(), parameter -> new InstanceDto(parameter));
    }

    @Get("/parameter/:id")
    public InstanceDto get(Long id) {
        return new InstanceDto(genericFacade.findOne(id));
    }

    @Put("/parameter")
    public InstanceDto update(InstanceDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to update it");
        return new InstanceDto(genericFacade.save(parameter.toInstance()));
    }

    @Post("/parameter")
    public InstanceDto save(InstanceDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to save it");
        return new InstanceDto(genericFacade.save(parameter.toInstance()));
    }

    @Delete("/parameter/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
