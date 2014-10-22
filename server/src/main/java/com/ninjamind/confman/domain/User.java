package com.ninjamind.confman.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.validator.constraints.Email;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A user.
 */
@Entity
@Table(name = "T_USER")
public class User  implements Serializable {

    @NotNull
    @Size(min = 0, max = 50)
    @Id
    @Column(length = 50)
    private String login;

    @JsonIgnore
    @Size(min = 0, max = 100)
    @Column(length = 100)
    private String password;

    @Size(min = 0, max = 50)
    @Column(name = "first_name", length = 50)
    private String firstName;

    @Size(min = 0, max = 50)
    @Column(name = "last_name", length = 50)
    private String lastName;

    @Email
    @Size(min = 0, max = 100)
    @Column(length = 100)
    private String email;

    private boolean activated = false;

    @Size(min = 2, max = 5)
    @Column(name = "lang_key", length = 5)
    private String langKey;

    @Size(min = 0, max = 20)
    @Column(name = "activation_key", length = 20)
    private String activationKey;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "T_USER_AUTHORITY",
            joinColumns = {@JoinColumn(name = "login", referencedColumnName = "login")},
            inverseJoinColumns = {@JoinColumn(name = "name", referencedColumnName = "name")})
    private Set<Authority> authorities = new HashSet<>();

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "user")
    private Set<PersistentToken> persistentTokens = new HashSet<>();

    public String getLogin() {
        return login;
    }

    public User setLogin(String login) {
        this.login = login;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public User setPassword(String password) {
        this.password = password;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public User setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public User setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public User setEmail(String email) {
        this.email = email;
        return this;
    }

    public boolean getActivated() {
        return activated;
    }

    public User setActivated(boolean activated) {
        this.activated = activated;
        return this;
    }

    public String getActivationKey() {
        return activationKey;
    }

    public User setActivationKey(String activationKey) {
        this.activationKey = activationKey;
        return this;
    }

    public String getLangKey() {
        return langKey;
    }

    public User setLangKey(String langKey) {
        this.langKey = langKey;
        return this;
    }

    public Set<Authority> getAuthorities() {
        return authorities;
    }

    public User setAuthorities(Set<Authority> authorities) {
        this.authorities = authorities;
        return this;
    }
    
    public Set<PersistentToken> getPersistentTokens() {
        return persistentTokens;
    }

    public User setPersistentTokens(Set<PersistentToken> persistentTokens) {
        this.persistentTokens = persistentTokens;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        User user = (User) o;

        if (!login.equals(user.login)) {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return login.hashCode();
    }

    @Override
    public String toString() {
        return "User{" +
                "login='" + login + '\'' +
                ", password='" + password + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", activated='" + activated + '\'' +
                ", langKey='" + langKey + '\'' +
                ", activationKey='" + activationKey + '\'' +
                "}";
    }
}
