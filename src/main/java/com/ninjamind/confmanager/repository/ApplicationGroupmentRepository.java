package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.ApplicationGroupment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.ApplicationGroupment}
 *
 * @author ehret_g
 */
public interface ApplicationGroupmentRepository extends JpaRepository<ApplicationGroupment, Long> {

}
