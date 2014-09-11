package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;

import java.io.Serializable;
import java.util.List;

/**
 * {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author Guillaume EHRET
 */
public interface ParameterFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * Add a parameter to an existent application
     * @param codeApp
     * @param codeParam
     * @param labelParam
     */
    void addParameterToApplication(String codeApp, String codeParam, String labelParam);

    /**
     * Find a parameter by application code and parameter code
     * @param codeApp
     * @param codeParam
     */
    Parameter findParameterApplication(String codeApp, String codeParam);

}
