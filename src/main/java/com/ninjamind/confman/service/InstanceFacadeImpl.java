package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.Instance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("instanceFacade")
@Transactional
public class InstanceFacadeImpl implements GenericFacade<Instance, Long>{
    @Autowired
    private JpaRepository<Instance, Long> instanceRepository;

    @Override
    public JpaRepository<Instance, Long> getRepository() {
        return instanceRepository;
    }

    @Override
    public Class<Instance> getClassEntity() {
        return Instance.class;
    }
}
