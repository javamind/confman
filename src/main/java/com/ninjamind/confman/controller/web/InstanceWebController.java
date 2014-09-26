package com.ninjamind.confman.controller.web;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.InstanceFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Rest API for {@link com.ninjamind.confman.domain.Instance}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/instance")
public class InstanceWebController extends AbstractConfmanWebController<Instance, InstanceDto, Long>{

    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public InstanceWebController(InstanceFacade genericFacade) {
        super(genericFacade, InstanceDto.class, Instance.class);
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

}
