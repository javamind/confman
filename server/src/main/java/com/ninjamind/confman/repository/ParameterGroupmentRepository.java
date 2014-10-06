package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ParameterGroupment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ParameterGroupment}
 *
 * @author Guillaume EHRET
 */
public interface ParameterGroupmentRepository extends ConfmanRepository<ParameterGroupment, Long> {


    @Query(value = "SELECT a FROM ParameterGroupment a WHERE a.code = :code")
    ParameterGroupment findByCode(@Param("code") String code);

}
