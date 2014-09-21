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
    private InstanceFacade instanceFacade;

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
        Preconditions.checkNotNull(confmanDto.getCodeEnvironment(), "environment code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "instance label is required");

        instanceFacade.saveInstanceToApplication(
                confmanDto.getCodeApplication(),
                confmanDto.getCodeInstance(),
                confmanDto.getCodeEnvironment(),
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
     * Read an instance
     * @param codeApp
     * @param codeInstance
     * @param codeEnv
     * @return
     */
    @Get("/confman/instance/:codeInstance/app/:codeApp/env/:codeEnv")
    public ConfmanDto getInstance(String codeInstance, String codeApp, String codeEnv) {
        Preconditions.checkNotNull(codeApp, "application code is required");
        Preconditions.checkNotNull(codeInstance, "instance code is required");
        Preconditions.checkNotNull(codeInstance, "instance code is required");
        Instance instance = instanceFacade.getRepository().findByCode(codeInstance, codeApp, codeEnv);

        if(instance==null){
            return null;
        }
        return new ConfmanDto()
                .setCode(instance.getCode())
                .setLabel(instance.getLabel())
                .setCodeApplication(codeApp)
                .setCodeEnvironment(codeApp)
                .setId(instance.getId());
    }
}
