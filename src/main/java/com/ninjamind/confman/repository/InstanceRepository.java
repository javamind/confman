package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Instance;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Instance}
 *
 * @author ehret_g
 */
public interface InstanceRepository extends JpaRepository<Instance, Long> {

}
