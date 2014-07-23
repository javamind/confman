package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.ParameterGroupment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("parameterGroupmentFacade")
@Transactional
public class ParameterGroupmentFacadeImpl implements GenericFacade<ParameterGroupment, Long>{
    @Autowired
    private JpaRepository<ParameterGroupment, Long> parameterGroupmentRepository;

    @Override
    public JpaRepository<ParameterGroupment, Long> getRepository() {
        return parameterGroupmentRepository;
    }

    @Override
    public Class<ParameterGroupment> getClassEntity() {
        return ParameterGroupment.class;
    }

}
