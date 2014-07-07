package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.Environment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.Environment}
 *
 * @author ehret_g
 */
public interface EnvironmentRepository extends JpaRepository<Environment, Long> {

}
