package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Instance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Instance}
 *
 * @author ehret_g
 */
public interface InstanceRepository extends JpaRepository<Instance, Long> {
    @Query(value = "SELECT s FROM Instance s WHERE s.application.id = :id order by s.code")
    List<Instance> findInstanceByIdApp(@Param("id") Long id);

    @Query(value = "SELECT s FROM Instance s WHERE s.environment.id = :id order by s.code")
    List<Instance> findInstanceByIdEnv(@Param("id") Long id);

    @Query(value = "SELECT s FROM Instance s WHERE s.application.id = :idApp and s.environment.id = :idEnv order by s.code")
    List<Instance> findInstanceByIdappAndEnv(@Param("idApp") Long idApp, @Param("idEnv") Long idEnv);
}
