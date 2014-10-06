package com.ninjamind.confman.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

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
     * @return the actives
     */
    List<T> findByActiveTrue();

}
