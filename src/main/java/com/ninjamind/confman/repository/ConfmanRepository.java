package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.io.Serializable;
import java.util.List;

/**
 * Repository
 *
 * @author Guillaume EHRET
 */
@NoRepositoryBean
public interface ConfmanRepository<T, ID extends Serializable> extends JpaRepository<T, ID> {
    /**
     * All the repositories have to implement to return only enregistrements
     * @return
     */
    List<T> findAllActive();

}
