package com.ninjamind.confman.controller.api;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.dto.ConfmanDto;
import com.ninjamind.confman.repository.InstanceRepository;
import com.ninjamind.confman.service.InstanceFacade;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
public class InstanceApiController {

    @Autowired
    private InstanceFacade<Instance, Long> instanceFacade;

    /**
     * Create a instance in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Post("/confman/instance")
    public void addParam(ConfmanDto confmanDto) {
        saveparam(confmanDto, true);
    }

    /**
     * Save or update param
     * @param confmanDto
     * @param creation
     */
    private void saveparam(ConfmanDto confmanDto, boolean creation) {
        Preconditions.checkNotNull(confmanDto, "DTO ConfmanDto is required");
        Preconditions.checkNotNull(confmanDto.getCodeApplication(), "application code is required");
        Preconditions.checkNotNull(confmanDto.getCodeInstance(), "instance code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "instance label is required");

        instanceFacade.saveInstanceToApplication(
                confmanDto.getCodeApplication(),
                confmanDto.getCodeInstance(),
                confmanDto.getLabel(),
                creation);
    }

    /**
     * Update a instance in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Put("/confman/instance")
    public void updateParam(ConfmanDto confmanDto) {
        saveparam(confmanDto, false);
    }

    /**
     * Read a instance
     * @param codeApp
     * @param codeInstance
     * @return
     */
    @Get("/confman/instance/:codeInstance/app/:codeApp")
    public ConfmanDto getParam(String codeInstance, String codeApp) {
        Preconditions.checkNotNull(codeApp, "application code is required");
        Preconditions.checkNotNull(codeInstance, "instance code is required");
        Instance instance = ((InstanceRepository)instanceFacade.getRepository()).findByCode(codeApp, codeInstance);

        if(instance==null){
            return null;
        }
        return new ConfmanDto().setCodeInstance(instance.getCode()).setLabel(instance.getLabel()).setCodeApplication(instance.getApplication().getCode())
                .setId(instance.getId());
    }
}
