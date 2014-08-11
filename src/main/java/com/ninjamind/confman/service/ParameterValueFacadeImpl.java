package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.repository.ParameterValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("parameterValueFacade")
@Transactional
public class ParameterValueFacadeImpl implements ParameterValueFacade<ParameterValue, Long>{
    @Autowired
    private ParameterValueRepository parameterValueRepository;

    @Autowired
    private JpaRepository<ParameterValue, Long> parameterValueRepositoryGeneric;

    @Override
    public JpaRepository<ParameterValue, Long> getRepository() {
        return parameterValueRepositoryGeneric;
    }

    @Override
    public Class<ParameterValue> getClassEntity() {
        return ParameterValue.class;
    }

}
