package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.InstanceFacade;
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
@RequestMapping(value = "/instance")
public class InstanceWebController {
    @Autowired
    @Qualifier("instanceFacade")
    private InstanceFacade genericFacade;

    @Autowired
    private ApplicationFacade applicationFacade;

    @RequestMapping
    public List<InstanceDto> list() {
        return Lists.transform(genericFacade.findAll(), instance -> new InstanceDto(instance));
    }

    @RequestMapping("/application/{id}")
    public List<InstanceDto> listApp(@PathVariable Long id) {
        return Lists.transform(applicationFacade.findInstanceByIdAppOrEnv(id, null), instance -> new InstanceDto(instance));
    }

    @RequestMapping("/application/{id}/environment/{idEnv}")
    public List<InstanceDto> listApp(@PathVariable Long idApp, @PathVariable Long idEnv) {
        return Lists.transform(applicationFacade.findInstanceByIdAppOrEnv(idApp, idEnv), instance -> new InstanceDto(instance));
    }

    @RequestMapping("/environment/{id}")
    public List<InstanceDto> listEnv(@PathVariable Long id) {
        return Lists.transform(applicationFacade.findInstanceByIdAppOrEnv(null, id), instance -> new InstanceDto(instance));
    }

    @RequestMapping("/{id}")
    public InstanceDto get(@PathVariable Long id) {
        return new InstanceDto(genericFacade.findOne(id));
    }

    @RequestMapping(method = RequestMethod.PUT)
    public InstanceDto update(InstanceDto instance) {
        Preconditions.checkNotNull(instance, "Object is required to update it");
        return new InstanceDto(genericFacade.update(instance.toInstance()));
    }

    @RequestMapping(method = RequestMethod.POST)
    public InstanceDto save(InstanceDto instance) {
        Preconditions.checkNotNull(instance, "Object is required to save it");
        return new InstanceDto(genericFacade.create(instance.toInstance()));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        genericFacade.delete(id);
    }
}
