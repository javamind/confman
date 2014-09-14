package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.repository.InstanceRepository;

import java.io.Serializable;

/**
 * {@link com.ninjamind.confman.domain.Instance}
 *
 * @author Guillaume EHRET
 */
public interface InstanceFacade extends GenericFacade<Instance, Long, InstanceRepository> {

    /**
     * Add an instance to an existent application.
     * @param codeApp
     * @param codeInstance
     * @param codeEnv
     * @param labelInstance
     * @param creation
     * @throws com.ninjamind.confman.exception.NotFoundException if app don't exist
     */
    void saveInstanceToApplication(String codeApp, String codeInstance, String codeEnv, String labelInstance, boolean creation);


}
