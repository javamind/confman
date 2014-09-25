package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author Guillaume EHRET
 */
public interface ParameterValueGenericRepository extends ConfmanRepository<ParameterValue, Long> {

}
