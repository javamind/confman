package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.repository.EnvironmentRepository;
import com.ninjamind.confman.repository.InstanceRepository;

/**
 * {@link com.ninjamind.confman.domain.Environment}
 *
 * @author Guillaume EHRET
 */
public interface EnvironmentFacade extends GenericFacade<Environment, Long, EnvironmentRepository> {


}
