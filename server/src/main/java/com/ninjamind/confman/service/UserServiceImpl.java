package com.ninjamind.confman.service;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Authority;
import com.ninjamind.confman.domain.User;
import com.ninjamind.confman.repository.AuthorityRepository;
import com.ninjamind.confman.repository.UserRepository;
import com.ninjamind.confman.security.AuthoritiesConstants;
import com.ninjamind.confman.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService{

    private final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    private static List<String> PROFILS = Lists.newArrayList(AuthoritiesConstants.DEV, AuthoritiesConstants.OPS, AuthoritiesConstants.ADMIN);

    @Override
    public void updateUserInformation(String firstName, String lastName, String email) {
        User currentUser = userRepository.findOne(SecurityUtils.getCurrentLogin());
        currentUser.setFirstName(firstName);
        currentUser.setLastName(lastName);
        currentUser.setEmail(email);
        userRepository.save(currentUser);
        log.debug("Changed Information for User: {}", currentUser);
    }

    @Override
    public void changePassword(String password) {
        User currentUser = userRepository.findOne(SecurityUtils.getCurrentLogin());
        String encryptedPassword = passwordEncoder.encode(password);
        currentUser.setPassword(encryptedPassword);
        userRepository.save(currentUser);
        log.debug("Changed password for User: {}", currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserWithAuthorities() {
        User currentUser = userRepository.findOne(SecurityUtils.getCurrentLogin());
        if(currentUser!=null && currentUser.getAuthorities()!=null){
            currentUser.getAuthorities().size(); // eagerly load the association
        }
        return currentUser;
    }

    @Override
    public UserRepository getRepository() {
        return userRepository;
    }

    @Override
    public Class<User> getClassEntity() {
        return User.class;
    }

    @Override
    public User create(User user) {
        Preconditions.checkNotNull(user, "user is required");
        Preconditions.checkNotNull(user.getLogin(), "login is required");
        Preconditions.checkNotNull(user.getPassword(), "password is required");

        //We change the password with newone encrypted
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);

        //The profiles are checked and attach with session
        Set<Authority> authorities = new HashSet<>();
        for(Authority authority : user.getAuthorities()){
            Authority authorityAttached = authorityRepository.findOne(authority.getName());
            if(authorityAttached==null){
                throw new IllegalArgumentException("One of the profiles is not known");
            }
        }

        //The default language is en
        user.setLangKey(Objects.firstNonNull(user.getLangKey(), "en"));

        userRepository.save(user);
        log.debug("Created Information for User: {}", user);
        return user;
    }
}
