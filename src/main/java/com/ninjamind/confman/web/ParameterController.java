package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.dto.ParameterDto;
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
 * @author Guillaume EHRET
 */
public class ParameterController {
    @Autowired
    @Qualifier("parameterFacade")
    private GenericFacade<Parameter, Long> genericFacade;

    @Get("/parameter")
    public List<ParameterDto> list() {
        return Lists.transform(genericFacade.findAll(), parameter -> new ParameterDto(parameter));
    }

    @Get("/parameter/:id")
    public ParameterDto get(Long id) {
        return new ParameterDto(genericFacade.findOne(id));
    }

    @Put("/parameter")
    public ParameterDto update(ParameterDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to update it");
        return new ParameterDto(genericFacade.save(parameter.toParameter()));
    }

    @Post("/parameter")
    public ParameterDto save(ParameterDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to save it");
        return new ParameterDto(genericFacade.save(parameter.toParameter()));
    }

    @Delete("/parameter/:id")
    public void delete(Long id) {
        genericFacade.delete(id);
    }
}
