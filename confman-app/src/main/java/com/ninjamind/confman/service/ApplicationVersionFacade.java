package com.ninjamind.confman.service;

import java.io.Serializable;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public interface ApplicationVersionFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * We use the standard way to design our applications wersions (http://semver.org/). If the
     * number is not valid, an exception is thrown
     * @param number
     * @return
     */
    boolean checkVersionNumber(String number);


    /**
     * Add a version to an existent application.
     * @param codeApp
     * @param codeVersion
     * @param labelVersion
     * @param creation
     * @throws com.ninjamind.confman.exception.NotFoundException if app don't exist
     */
    void saveVersionToApplication(String codeApp, String codeVersion, String labelVersion, boolean creation);


}
