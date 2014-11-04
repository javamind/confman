package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.PersistentToken;
import com.ninjamind.confman.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

/**
 * Spring Data JPA repository for the PersistentToken entity.
 */
public interface PersistentTokenRepository extends JpaRepository<PersistentToken, String> {

    List<PersistentToken> findByUser(User user);

    List<PersistentToken> findByTokenDateBefore(Date localDate);

}
