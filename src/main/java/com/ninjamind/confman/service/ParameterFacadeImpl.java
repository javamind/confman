package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("parameterFacade")
@Transactional
public class ParameterFacadeImpl implements GenericFacade<Parameter, Long>{
    @Autowired
    private JpaRepository<Parameter, Long> parameterRepository;

    @Override
    public JpaRepository<Parameter, Long> getRepository() {
        return parameterRepository;
    }

    @Override
    public Class<Parameter> getClassEntity() {
        return Parameter.class;
    }

}
