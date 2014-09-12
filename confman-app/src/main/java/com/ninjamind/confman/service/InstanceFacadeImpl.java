package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.exception.FoundException;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.InstanceRepository;
import net.codestory.http.errors.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("instanceFacade")
@Transactional
public class InstanceFacadeImpl implements InstanceFacade<Instance, Long>{
    @Autowired
    private InstanceRepository instanceRepository;
    @Autowired
    private ApplicationtRepository applicationtRepository;

    @Override
    public JpaRepository<Instance, Long> getRepository() {
        return instanceRepository;
    }

    @Override
    public Class<Instance> getClassEntity() {
        return Instance.class;
    }

    @Override
    public void saveInstanceToApplication(String codeApp, String codeInstance, String labelInstance, boolean creation) {
        //Is the application exist? If not it's an error
        Application application = NotFoundException.notFoundIfNull(applicationtRepository.findByCode(codeApp));

        //Is the parameter exist ?
        Instance instance = instanceRepository.findByCode(codeApp, codeInstance);

        if(creation){
            //If we want to create a new one we throw an exception if parameter exist
            FoundException.foundIfNotNull(instance);
            instance = new Instance().setCode(codeInstance).setApplication(application);
        }

        instance.setLabel(labelInstance) ;
        instanceRepository.save(instance);
    }

}
