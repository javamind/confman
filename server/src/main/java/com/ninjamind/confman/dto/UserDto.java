package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Authority;
import com.ninjamind.confman.domain.User;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class UserDto implements ConfmanAppDto<User>{

    private String login;

    private String password;

    private String firstName;

    private String lastName;

    private String email;

    private String langKey;

    private List<String> roles;

    public UserDto() {
    }

    public UserDto(User user) {
        this.email = user.getEmail();
        this.login =user.getLogin();
        this.firstName = user.getFirstName();
        this.langKey = user.getLangKey();
        this.lastName = user.getLastName();
        this.roles = user.getAuthorities()==null ?
                new ArrayList<>() :
                user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toList());
    }

    public UserDto(String login, String password, String firstName, String lastName, String email, String langKey,
                   List<String> roles) {
        this.login = login;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.langKey = langKey;
        this.roles = roles;
    }

    public String getPassword() {
        return password;
    }

    public String getLogin() {
        return login;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getLangKey() {
        return langKey;
    }

    public List<String> getRoles() {
        return roles;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("UserDTO{");
        sb.append("login='").append(login).append('\'');
        if(password != null) {
            sb.append(", password='").append(password.length()).append('\'');
        }
        sb.append(", firstName='").append(firstName).append('\'');
        sb.append(", lastName='").append(lastName).append('\'');
        sb.append(", email='").append(email).append('\'');
        sb.append(", langKey='").append(langKey).append('\'');
        sb.append(", roles=").append(roles);
        sb.append('}');
        return sb.toString();
    }

    @Override
    public User toDo() {
        return new User()
                .setEmail(getEmail())
                .setLangKey(getLangKey())
                .setFirstName(getFirstName())
                .setLastName(getLastName())
                .setLogin(getLogin())
                .setPassword(getPassword());
    }
}
