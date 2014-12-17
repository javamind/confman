package com.ninjamind.confman.service;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Authority;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.domain.User;
import com.ninjamind.confman.repository.AuthorityRepository;
import com.ninjamind.confman.repository.UserRepository;
import com.ninjamind.confman.security.AuthoritiesConstants;
import com.ninjamind.confman.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
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
    public User findByCode(User entity) {
        return userRepository.findOne(entity.getLogin());
    }

    @Override
    public User update(User entity){
        return create(entity);
    }

    @Override
    public User create(User user) {
        Preconditions.checkNotNull(user, "user is required");
        Preconditions.checkNotNull(user.getLogin(), "login is required");
        Preconditions.checkNotNull(user.getPassword(), "password is required");

        //We see if user exist
        User userAttached = userRepository.findOne(user.getLogin());
        if (userAttached == null) {
            userAttached = user;
        }
        else {
            //All the proprieties are copied except the version number
            BeanUtils.copyProperties(user, userAttached, "login", "version");
        }
        updateTracability(userAttached);
        userAttached.setActivated(true);
        userAttached.setActive(true);
        userAttached.setActiveChangeDate(new Date());

        //The default language is en
        userAttached.setLangKey(Objects.firstNonNull(user.getLangKey(), "en"));

        //The profiles are checked and attach with session
        Set<Authority> authorities = new HashSet<>();
        for(Authority authority : user.getAuthorities()){
            userAttached.getAuthorities().add(authorityRepository.findOne(authority.getName()));
        }
        return userRepository.save(userAttached);
    }
}
