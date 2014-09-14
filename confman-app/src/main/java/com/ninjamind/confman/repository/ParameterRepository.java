package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterGroupment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author Guillaume EHRET
 */
public interface ParameterRepository extends ConfmanRepository<Parameter, Long> {
    @Query(value = "SELECT a FROM Parameter a WHERE a.active = true")
    List<Parameter> findAllActive();

    @Query(value = "SELECT s FROM Parameter s WHERE s.application.id = :id order by s.code" )
    List<Parameter> findByIdApp(@Param("id") Long id);

    @Query(value = "SELECT s FROM Parameter s inner join s.application a WHERE s.code = :codeParam and a.code = :codeApp" )
    Parameter findByCode(@Param("codeApp") String codeApp, @Param("codeParam") String codeParam);
}
