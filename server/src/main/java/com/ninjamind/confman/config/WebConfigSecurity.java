package com.ninjamind.confman.config;

import com.ninjamind.confman.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;

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
                .formLogin()
                    .loginProcessingUrl("/app/authentication")
                    .successHandler(ajaxAuthenticationSuccessHandler)
                    .failureHandler(ajaxAuthenticationFailureHandler)
                    .usernameParameter("j_username")
                    .passwordParameter("j_password")
                    .permitAll()
                    .and()
                .logout()
                    .logoutUrl("/app/logout")
                    .logoutSuccessHandler(ajaxLogoutSuccessHandler)
                    .deleteCookies("JSESSIONID")
                    .permitAll()
                    .and()
                .csrf()
                    .disable()
                    .headers()
                    .frameOptions().disable()
                    .authorizeRequests()
                        .antMatchers("/app/authenticated").permitAll()
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
