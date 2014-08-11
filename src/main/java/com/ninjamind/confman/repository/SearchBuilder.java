package com.ninjamind.confman.repository;

import com.google.common.base.Strings;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;

/**
 *
 * @author ehret_g
 */
public interface SearchBuilder {

    /**
     * Help to build the clause where of the p
     * @return
     */
    public String buildWhereClause();

    /**
     * Help to populate the values of the named parameters
     * @return
     */
    public Query populateQueryParam(Query query);
}