package com.ninjamind.confman.controller.web;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.dto.ApplicationVersionDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.ApplicationVersionFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Rest API for {@link com.ninjamind.confman.domain.ApplicationVersion}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/applicationversion")
public class ApplicationVersionWebController extends AbstractConfmanWebController<ApplicationVersion, ApplicationVersionDto, Long>{

    private ApplicationVersionFacade applicationVersionFacade;

    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public ApplicationVersionWebController(ApplicationVersionFacade genericFacade) {
        super(genericFacade, ApplicationVersionDto.class, ApplicationVersion.class);
        this.applicationVersionFacade = genericFacade;
    }

    @RequestMapping("application/{id}")
    public List<ApplicationVersionDto> getByApp(@PathVariable Long id) {
        return Lists.transform(applicationFacade.findApplicationVersionByIdApp(id), instance -> new ApplicationVersionDto(instance));
    }

    @RequestMapping("/check/{version}")
    public boolean check(@PathVariable String version) {
        return applicationVersionFacade.checkVersionNumber(version);
    }

}
