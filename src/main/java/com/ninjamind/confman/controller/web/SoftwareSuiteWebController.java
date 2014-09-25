package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.SoftwareSuiteDto;
import com.ninjamind.confman.dto.SoftwareSuiteEnvironmentDto;
import com.ninjamind.confman.service.SoftwareSuiteFacade;
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
@RequestMapping(value = "/softwaresuite")
public class SoftwareSuiteWebController {
    @Autowired
    @Qualifier("softwareSuiteFacade")
    private SoftwareSuiteFacade genericFacade;


    @RequestMapping
    public List<SoftwareSuiteDto> list() {
        return Lists.transform(genericFacade.findAll(), env -> new SoftwareSuiteDto(env));
    }

    @RequestMapping("/{id}")
    public SoftwareSuiteDto get(@PathVariable Long id) {
        return new SoftwareSuiteDto(genericFacade.findOne(id));
    }

    @RequestMapping("/{id}/environment")
    public List<SoftwareSuiteEnvironmentDto> getEnvironment(@PathVariable Long id) {
        Preconditions.checkNotNull(id, "Sowftware suite id is required to update it");
        return Lists.transform(genericFacade.findSoftwareSuiteEnvironmentByIdSoft(id), env -> new SoftwareSuiteEnvironmentDto(env));
    }

    @RequestMapping(method = RequestMethod.PUT)
    public SoftwareSuiteDto update(SoftwareSuiteDto env) {
        Preconditions.checkNotNull(env, "Object is required to update it");
        return new SoftwareSuiteDto(genericFacade.update(env.toSoftwareSuite(), env.toSoftwareSuiteEnvironment()));
    }

    @RequestMapping(method = RequestMethod.POST)
    public SoftwareSuiteDto save(SoftwareSuiteDto env) {
        Preconditions.checkNotNull(env, "Object is required to save it");
        return new SoftwareSuiteDto(genericFacade.create(env.toSoftwareSuite()));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        genericFacade.delete(id);
    }
}
