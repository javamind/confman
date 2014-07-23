package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Environment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author ehret_g
 */
public interface ApplicationtRepository extends JpaRepository<Application, Long> {

}
