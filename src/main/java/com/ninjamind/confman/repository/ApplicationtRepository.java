package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author ehret_g
 */
public interface ApplicationtRepository extends JpaRepository<Application, Long> {

    @Query(value = "SELECT a FROM Application a left join fetch a.instances left join fetch a.parameters left join fetch a.applicationVersions WHERE a.id = :id")
    Application findOneWithDependencies(@Param("id") Long id);
}
