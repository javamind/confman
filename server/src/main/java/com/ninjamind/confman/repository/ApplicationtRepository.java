package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
public interface ApplicationtRepository extends ConfmanRepository<Application, Long> {

    Application findByCode(String code);

    @Query(value = "SELECT a FROM Application as a left join fetch a.instances as i left join fetch a.parameters as p left join fetch a.applicationVersions as v WHERE a.id = :id")
    Application findOneWithDependencies(@Param("id") Long id);

    @Query(value = "SELECT a FROM Application a left join fetch a.softwareSuite s left join fetch s.softwareSuiteEnvironments se WHERE se.id.environment.id = :id")
    List<Application> findByIdEnv(@Param("id") Long id);
}

