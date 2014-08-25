package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ParameterValue;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author ehret_g
 */
public interface ParameterValueGenericRepository extends JpaRepository<ParameterValue, Long> {

}
