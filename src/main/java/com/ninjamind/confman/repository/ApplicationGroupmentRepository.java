package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ApplicationGroupment;
import com.ninjamind.confman.domain.Environment;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ApplicationGroupment}
 *
 * @author ehret_g
 */
public interface ApplicationGroupmentRepository extends JpaRepository<ApplicationGroupment, Long> {

}
