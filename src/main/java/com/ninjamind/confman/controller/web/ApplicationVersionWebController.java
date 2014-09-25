package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.ApplicationVersionDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.ApplicationVersionFacade;
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
@RequestMapping(value = "/applicationversion")
public class ApplicationVersionWebController {
    @Autowired
    @Qualifier("applicationVersionFacade")
    private ApplicationVersionFacade genericFacade;

    @Autowired
    private ApplicationFacade applicationFacade;

    @RequestMapping
    public List<ApplicationVersionDto> list() {
        return Lists.transform(genericFacade.findAll(), version -> new ApplicationVersionDto(version));
    }

    @RequestMapping("application/{id}")
    public List<ApplicationVersionDto> getByApp(@PathVariable Long id) {
        return Lists.transform(applicationFacade.findApplicationVersionByIdApp(id), instance -> new ApplicationVersionDto(instance));
    }

    @RequestMapping("/check/{version}")
    public boolean check(@PathVariable String version) {
        return genericFacade.checkVersionNumber(version);
    }

    @RequestMapping("/{id}")
    public ApplicationVersionDto get(@PathVariable Long id) {
        return new ApplicationVersionDto(genericFacade.findOne(id));
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ApplicationVersionDto update(ApplicationVersionDto version) {
        Preconditions.checkNotNull(version, "Object is required to update it");
        return new ApplicationVersionDto(genericFacade.update(version.toApplicationVersion()));
    }

    @RequestMapping(method = RequestMethod.POST)
    public ApplicationVersionDto save(ApplicationVersionDto version) {
        Preconditions.checkNotNull(version, "Object is required to save it");
        return new ApplicationVersionDto(genericFacade.create(version.toApplicationVersion()));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        genericFacade.delete(id);
    }


}
