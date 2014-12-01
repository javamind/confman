package com.ninjamind.confman.config;

import com.ninjamind.confman.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;
import org.springframework.security.web.authentication.RememberMeServices;

/**
 * @author Guillaume EHRET
 */
@Configuration
@EnableWebSecurity
public class WebConfigSecurity extends WebSecurityConfigurerAdapter {
    @Autowired
    private Environment env;

    @Autowired
    private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;

    @Autowired
    private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;

    @Autowired
    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;

    @Autowired
    private Http401UnauthorizedEntryPoint authenticationEntryPoint;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private RememberMeServices rememberMeServices;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new StandardPasswordEncoder();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());
    }


    @Bean
    @Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public UserDetails authenticatedUserDetails() {
        SecurityContextHolder.getContext().getAuthentication();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            if (authentication instanceof UsernamePasswordAuthenticationToken) {
                return (UserDetails) ((UsernamePasswordAuthenticationToken) authentication).getPrincipal();
            }
            if (authentication instanceof RememberMeAuthenticationToken) {
                return (UserDetails) ((RememberMeAuthenticationToken) authentication).getPrincipal();
            }
        }
        return null;
    }



    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/confman/**");
    }


    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .exceptionHandling()
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .and()
                .rememberMe()
                    .rememberMeServices(rememberMeServices)
                    .key(env.getProperty("confman.security.rememberme.key"))
                .and()
                .formLogin()
                    .loginProcessingUrl("/app/authentication")
                    .successHandler(ajaxAuthenticationSuccessHandler)
                    .failureHandler(ajaxAuthenticationFailureHandler)
                    .permitAll()
                    .and()
                .logout()
                    .logoutUrl("/app/logout")
                    .logoutSuccessUrl("/")
                    .logoutSuccessHandler(ajaxLogoutSuccessHandler)
                    .deleteCookies("JSESSIONID")
                    .permitAll()
                    .and()
                .csrf()
                    .disable()
                .headers()
                    .frameOptions().disable()
                .authorizeRequests()
                    .antMatchers(HttpMethod.OPTIONS, "/app/**").permitAll()//a  llow CORS option calls
                    .antMatchers("/app/authenticated").permitAll()
                    //TODO
                    .antMatchers("/app/account").permitAll()
                    .antMatchers("/app/**").authenticated()
                    .antMatchers("/metrics/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/health/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/dump/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/shutdown/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/beans/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/info/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/autoconfig/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/env/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/trace/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/api-docs/**").hasAuthority(AuthoritiesConstants.ADMIN)
                    .antMatchers("/protected/**").authenticated();

    }


    @EnableGlobalMethodSecurity(prePostEnabled = true, jsr250Enabled = true)
    private static class GlobalSecurityConfiguration extends GlobalMethodSecurityConfiguration {

    }



}
