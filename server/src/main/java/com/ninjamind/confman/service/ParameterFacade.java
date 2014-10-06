package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.repository.ParameterRepository;

/**
 * {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author Guillaume EHRET
 */
public interface ParameterFacade extends GenericFacade<Parameter, Long, ParameterRepository> {

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
