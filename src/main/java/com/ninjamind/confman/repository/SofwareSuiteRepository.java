package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.domain.SoftwareSuite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author Guillaume EHRET
 */
public interface SofwareSuiteRepository extends ConfmanRepository<SoftwareSuite, Long> {

    SoftwareSuite findByCode(String code);
}
