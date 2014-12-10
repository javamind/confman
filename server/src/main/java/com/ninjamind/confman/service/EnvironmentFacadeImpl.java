package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.repository.EnvironmentRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("environmentFacade")
@Transactional
public class EnvironmentFacadeImpl implements EnvironmentFacade{
    @Autowired
    private EnvironmentRepository environmentRepository;

    @Override
    public EnvironmentRepository getRepository() {
        return environmentRepository;
    }

    @Override
    public Class<Environment> getClassEntity() {
        return Environment.class;
    }


    @Override
    public Environment create(Environment entity) {
        //We see if an entity exist
        Environment env = environmentRepository.findByCode(entity.getCode());
        if(env!=null){
            //All the proprieties are copied except the version number
            BeanUtils.copyProperties(entity, env, "id", "version");
            return env.setActive(true);
        }
        updateTracability(env);
        return getRepository().save(entity.setActive(true));
    }
}
