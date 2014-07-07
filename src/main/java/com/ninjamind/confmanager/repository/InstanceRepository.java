package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.Instance;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.Instance}
 *
 * @author ehret_g
 */
public interface InstanceRepository extends JpaRepository<Instance, Long> {

}
