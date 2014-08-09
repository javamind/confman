package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author ehret_g
 */
public interface ParameterRepository extends JpaRepository<Parameter, Long> {
    @Query(value = "SELECT s FROM Parameter s WHERE s.application.id = :id order by s.code" )
    List<Parameter> findParameterByIdApp(@Param("id") Long id);

}
