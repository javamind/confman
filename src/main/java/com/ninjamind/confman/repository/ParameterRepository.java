package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author ehret_g
 */
public interface ParameterRepository extends JpaRepository<Parameter, Long> {

}
