package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.Application;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.Application}
 *
 * @author ehret_g
 */
public interface ApplicationRepository extends JpaRepository<Application, Long> {

}
