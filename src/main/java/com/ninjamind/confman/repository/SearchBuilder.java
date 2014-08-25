package com.ninjamind.confman.repository;

import javax.persistence.Query;

/**
 *
 * @author ehret_g
 */
public interface SearchBuilder {

    /**
     * Help to build the clause from of the request. This part depends on yhe criteria
     * @return
     */
    public String buildFromClause();
    /**
     * Help to build the clause where of the request. This part depends on yhe criteria
     * @return
     */
    public String buildWhereClause();

    /**
     * Help to populate the values of the named parameters
     * @return
     */
    public Query populateQueryParam(Query query);
}