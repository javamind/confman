package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.repository.AuthorityRepository;
import com.ninjamind.confman.repository.EnvironmentRepository;
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

    @Autowired
    private AuthorityRepository authorityRepository;

    @Override
    public Environment findByCode(Environment entity) {
        return environmentRepository.findByCode(entity.getCode());
    }

    /**
     * Update a given entity. Use the returned instance for further operations as the save operation might have changed the
     * entity instance completely.
     *
     * @param entity
     * @return the saved entity
     */
    public Environment update(Environment entity){
        //We search the profile linked
        if(entity.getProfil()!=null && entity.getProfil().getName()!=null) {
            entity.setProfil(authorityRepository.findOne(entity.getProfil().getName()));
        }
        else{
           entity.setProfil(null);
        }
        updateTracability(entity);
        return getRepository().save(entity);
    }
}
