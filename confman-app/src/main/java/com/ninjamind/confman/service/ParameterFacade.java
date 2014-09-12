package com.ninjamind.confman.service;

import java.io.Serializable;

/**
 * {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author Guillaume EHRET
 */
public interface ParameterFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * Add a parameter to an existent application.
     * @param codeApp
     * @param codeParam
     * @param labelParam
     * @param typeParam
     * @param creation
     * @throws com.ninjamind.confman.exception.NotFoundException if app don't exist
     */
    void saveParameterToApplication(String codeApp, String codeParam, String labelParam, String typeParam, boolean creation);

}
