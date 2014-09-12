package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ParameterGroupment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ParameterGroupment}
 *
 * @author Guillaume EHRET
 */
public interface ParameterGroupmentRepository extends JpaRepository<ParameterGroupment, Long> {

}
