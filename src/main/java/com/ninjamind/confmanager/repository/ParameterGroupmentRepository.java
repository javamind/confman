package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.ParameterGroupment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.ParameterGroupment}
 *
 * @author ehret_g
 */
public interface ParameterGroupmentRepository extends JpaRepository<ParameterGroupment, Long> {

}
