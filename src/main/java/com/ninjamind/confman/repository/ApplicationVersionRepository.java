package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ApplicationVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ApplicationVersion}
 *
 * @author Guillaume EHRET
 */
public interface ApplicationVersionRepository extends ConfmanRepository<ApplicationVersion, Long> {

    @Query(value = "SELECT s FROM ApplicationVersion s WHERE s.application.id = :id order by s.code")
    List<ApplicationVersion> findByIdApp(@Param("id") Long id);

    @Query(value = "SELECT v FROM ApplicationVersion v left join fetch v.application a WHERE v.code = :codeVersion and a.code = :codeApp")
    ApplicationVersion findByCode(@Param("codeApp") String codeApp, @Param("codeVersion") String codeVersion);

}
