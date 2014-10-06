package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.exception.FoundException;
import com.ninjamind.confman.exception.NotFoundException;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.InstanceRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("instanceFacade")
@Transactional
public class InstanceFacadeImpl implements InstanceFacade {
    @Autowired
    private InstanceRepository instanceRepository;
    @Autowired
    private ApplicationtRepository applicationtRepository;

    @Override
    public InstanceRepository getRepository() {
        return instanceRepository;
    }

    @Override
    public Class<Instance> getClassEntity() {
        return Instance.class;
    }

    @Override
    public void saveInstanceToApplication(String codeApp, String codeInstance, String codeEnv, String labelInstance, boolean creation) {
        //Is the application exist? If not it's an error
        Application application = NotFoundException.notFoundIfNull(applicationtRepository.findByCode(codeApp));

        //Is the parameter exist ?
        Instance instance = instanceRepository.findByCode(codeInstance, codeApp, codeEnv);

        if(creation){
            //If we want to create a new one we throw an exception if parameter exist
            FoundException.foundExceptionIfNotNullAndActive(instance);
            instance = new Instance().setCode(codeInstance).setApplication(application);
        }

        instance.setLabel(labelInstance) ;

        if (creation) {
            create(instance);
        } else {
            update(instance);
        }
    }

    @Override
    public Instance create(Instance entity) {
        //We see if an entity exist
        Instance instance = instanceRepository.findByCode(entity.getCode(), entity.getApplication().getCode(), entity.getEnvironment().getCode());
        if (instance != null) {
            //All the proprieties are copied except the version number
            BeanUtils.copyProperties(entity, instance, "id", "version");
            return instance.setActive(true);
        }
        return getRepository().save(entity.setActive(true));
    }
}
