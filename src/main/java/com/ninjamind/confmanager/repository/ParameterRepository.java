package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.Parameter;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.Parameter}
 *
 * @author ehret_g
 */
public interface ParameterRepository extends JpaRepository<Parameter, Long> {

}
