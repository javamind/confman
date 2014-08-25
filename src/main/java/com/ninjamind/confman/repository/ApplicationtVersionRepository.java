package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ApplicationVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ApplicationVersion}
 *
 * @author ehret_g
 */
public interface ApplicationtVersionRepository extends JpaRepository<ApplicationVersion, Long> {
    @Query(value = "SELECT s FROM ApplicationVersion s WHERE s.application.id = :id order by s.code")
    List<ApplicationVersion> findApplicationVersionByIdApp(@Param("id") Long id);

    @Query(value = "SELECT v FROM ApplicationVersion v WHERE v.code = :code")
    ApplicationVersion findApplicationVersionByCode(@Param("code") String code);

}
