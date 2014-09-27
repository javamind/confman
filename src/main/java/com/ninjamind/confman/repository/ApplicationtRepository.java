package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
public interface ApplicationtRepository extends ConfmanRepository<Application, Long> {

    Application findByCode(String code);

    @Query(value = "SELECT a FROM Application as a left join a.instances as i left join a.parameters as p left join a.applicationVersions as v WHERE a.id = :id")
    Application findOneWithDependencies(@Param("id") Long id);

    @Query(value = "SELECT a FROM Application a left join fetch a.softwareSuite s left join fetch s.softwareSuiteEnvironments se WHERE se.id.environment.id = :id")
    List<Application> findByIdEnv(@Param("id") Long id);
}

