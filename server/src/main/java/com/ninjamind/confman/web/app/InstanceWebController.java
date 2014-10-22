package com.ninjamind.confman.web.app;

import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.InstanceFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rest API for {@link com.ninjamind.confman.domain.Instance}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/app/instance")
public class InstanceWebController extends AbstractConfmanWebController<Instance, InstanceDto, Long>{

    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public InstanceWebController(InstanceFacade genericFacade) {
        super(genericFacade, InstanceDto.class, Instance.class);
    }

    @RequestMapping("/application/{id}")
    public List<InstanceDto> listApp(@PathVariable Long id) {
        return applicationFacade.findInstanceByIdAppOrEnv(id, null).stream().map(instance -> new InstanceDto(instance)).collect(Collectors.toList());
    }

    @RequestMapping("/application/{idApp}/environment/{idEnv}")
    public List<InstanceDto> listApp(@PathVariable Long idApp, @PathVariable Long idEnv) {
        return applicationFacade.findInstanceByIdAppOrEnv(idApp, idEnv).stream().map(instance -> new InstanceDto(instance)).collect(Collectors.toList());
    }

    @RequestMapping("/environment/{id}")
    public List<InstanceDto> listEnv(@PathVariable Long id) {
        return applicationFacade.findInstanceByIdAppOrEnv(null, id).stream().map(instance -> new InstanceDto(instance)).collect(Collectors.toList());
    }

}
