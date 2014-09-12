package com.ninjamind.confman.service;

import java.io.Serializable;

/**
 * {@link com.ninjamind.confman.domain.Instance}
 *
 * @author Guillaume EHRET
 */
public interface InstanceFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * Add an instance to an existent application.
     * @param codeApp
     * @param codeInstance
     * @param labelInstance
     * @param creation
     * @throws com.ninjamind.confman.exception.NotFoundException if app don't exist
     */
    void saveInstanceToApplication(String codeApp, String codeInstance, String labelInstance, boolean creation);


}
