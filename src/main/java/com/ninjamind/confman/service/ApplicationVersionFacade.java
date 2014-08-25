package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.*;

import java.io.Serializable;
import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public interface ApplicationVersionFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * We use the standard way to design our applications wersions (http://semver.org/). If the
     * number is not valid, an exception is thrown
     * @param number
     * @return
     */
    boolean checkVersionNumber(String number);


}
