package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository extends ConfmanRepository<User, String> {
    
    @Query("select u from User u where u.activationKey = ?1")
    User getUserByActivationKey(String activationKey);

}
