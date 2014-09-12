package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.SoftwareSuiteEnvironment}
 *
 * @author Guillaume EHRET
 */
public interface SofwareSuiteEnvironmentRepository extends JpaRepository<SoftwareSuiteEnvironment, SoftwareSuiteEnvironmentId> {

    @Query(value = "SELECT s FROM SoftwareSuiteEnvironment s WHERE s.id.softwareSuite.id = :id")
    List<SoftwareSuiteEnvironment> findByIdSoft(@Param("id") Long id);

    @Query(value = "SELECT s FROM SoftwareSuiteEnvironment s WHERE s.id.environment.id = :id")
    List<SoftwareSuiteEnvironment> findByIdEnv(@Param("id") Long id);

}
