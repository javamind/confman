package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.ParameterDto;
import com.ninjamind.confman.service.ParameterFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/parameter")
public class ParameterWebController {
    @Autowired
    @Qualifier("parameterFacade")
    private ParameterFacade genericFacade;

    @RequestMapping
    public List<ParameterDto> list() {
        return Lists.transform(genericFacade.findAll(), parameter -> new ParameterDto(parameter));
    }

    @RequestMapping("/{id}")
    public ParameterDto get(@PathVariable Long id) {
        return new ParameterDto(genericFacade.findOne(id));
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ParameterDto update(ParameterDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to update it");
        return new ParameterDto(genericFacade.update(parameter.toParameter()));
    }

    @RequestMapping(method = RequestMethod.POST)
    public ParameterDto save(ParameterDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to save it");
        return new ParameterDto(genericFacade.create(parameter.toParameter()));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        genericFacade.delete(id);
    }
}
