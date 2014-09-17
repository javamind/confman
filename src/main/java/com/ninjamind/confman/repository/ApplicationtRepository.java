package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
public interface ApplicationtRepository extends ConfmanRepository<Application, Long> {

    @Query(value = "SELECT a FROM Application a WHERE a.active = true")
    List<Application> findAllActive();

    @Query(value = "SELECT a FROM Application a WHERE a.code = :code")
    Application findByCode(@Param("code") String code);

    @Query(value = "SELECT a FROM Application a left join fetch a.instances left join fetch a.parameters left join fetch a.applicationVersions WHERE a.id = :id")
    Application findOneWithDependencies(@Param("id") Long id);

    @Query(value = "SELECT a FROM Application a left join fetch a.softwareSuite s left join fetch s.softwareSuiteEnvironments se WHERE se.id.environment.id = :id")
    List<Application> findByIdEnv(@Param("id") Long id);
}
