package com.ninjamind.confman.repository;

import com.google.common.base.Strings;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;

/**
 * Helper to build the request to search {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author ehret_g
 */
public class ParameterValueSearchBuilder implements  SearchBuilder{

    private Long idApplication;
    private Long idVersionTracking;
    private Long idParameter;
    private Long idEnvironment;
    private Long idInstance;
    private String code;

    public ParameterValueSearchBuilder setIdApplication(Long idApplication) {
        this.idApplication = idApplication;
        return this;
    }

    public ParameterValueSearchBuilder setIdEnvironment(Long idEnvironment) {
        this.idEnvironment = idEnvironment;
        return this;
    }

    public ParameterValueSearchBuilder setIdVersionTracking(Long idVersionTracking) {
        this.idVersionTracking = idVersionTracking;
        return this;
    }

    public ParameterValueSearchBuilder setIdParameter(Long idParameter) {
        this.idParameter = idParameter;
        return this;
    }

    public ParameterValueSearchBuilder setIdInstance(Long idInstance) {
        this.idInstance = idInstance;
        return this;
    }

    public ParameterValueSearchBuilder setCode(String code) {
        this.code = code;
        return this;
    }

    @Override
    public String buildFromClause() {
        StringBuilder from = new StringBuilder(" from ParameterValue p ");
        if (idApplication != null) {
            from.append("inner join p.application ");
        }
        if (idVersionTracking != null) {
            from.append("inner join p.versionTracking ");
        }
        if (idParameter != null) {
            from.append("inner join p.parameter ");
        }
        if (idInstance != null) {
            from.append("inner join p.instance ");
        }
        if (idEnvironment != null) {
            from.append("inner join p.environment ");
        }
        return from.toString();
    }

    @Override
    public String buildWhereClause() {
        StringBuilder query = new StringBuilder("where 1=1 ");
        if (!Strings.isNullOrEmpty(code)) {
            query.append("and p.code like :code ");
        }
        if (idApplication != null) {
            query.append("and p.application.id = :idApplication ");
        }
        if (idVersionTracking != null) {
            query.append("and p.versionTracking.id = :idVersionTracking ");
        }
        if (idParameter != null) {
            query.append("and p.parameter.id = :idParameter ");
        }
        if (idInstance != null) {
            query.append("and p.instance.id = :idInstance ");
        }
        if (idEnvironment != null) {
            query.append("and p.environment.id = :idEnvironment ");
        }
        return query.toString();
    }

    @Override
    public Query populateQueryParam(Query query) {
        if (!Strings.isNullOrEmpty(code)) {
            query.setParameter("code", "%" + code + "%");
        }
        if (idApplication != null) {
            query.setParameter("idApplication", idApplication);
        }
        if (idVersionTracking != null) {
            query.setParameter("idVersionTracking", idVersionTracking);
        }
        if (idParameter != null) {
            query.setParameter("idParameter", idParameter);
        }
        if (idInstance != null) {
            query.setParameter("idInstance", idInstance);
        }
        if (idEnvironment != null) {
            query.setParameter("idEnvironment", idEnvironment);
        }
        return query;
    }
}