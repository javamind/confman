package com.ninjamind.confman.config;

import com.ninjamind.confman.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.StandardPasswordEncoder;
import org.springframework.security.web.authentication.RememberMeServices;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
//@EnableWebSecurity
@Configuration
@EnableWebMvcSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

//    @Autowired
//    private Environment env;
//
//    @Autowired
//    private AjaxAuthenticationSuccessHandler ajaxAuthenticationSuccessHandler;
//
//    @Autowired
//    private AjaxAuthenticationFailureHandler ajaxAuthenticationFailureHandler;
//
//    @Autowired
//    private AjaxLogoutSuccessHandler ajaxLogoutSuccessHandler;
//
//    @Autowired
//    private Http401UnauthorizedEntryPoint authenticationEntryPoint;
//
//    @Autowired
//    private UserDetailsService userDetailsService;
//
//    @Autowired
//    private RememberMeServices rememberMeServices;

//    @Autowired
//    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
//        auth
//                .userDetailsService(userDetailsService)
//                .passwordEncoder(passwordEncoder());
//    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new StandardPasswordEncoder();
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/**");
//        web.ignoring()
//                .antMatchers("/confman/*")
//                .antMatchers("/confman/img/**")
//                .antMatchers("/confman/less/**")
//                .antMatchers("/confman/i18n/**")
//                .antMatchers("/confman/js/**")
//                .antMatchers("/confman/lib/**")
//                .antMatchers("/confman/styles/**")
//                .antMatchers("/confman/views/**");

    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
                .formLogin()
                    .loginPage("/login")
                    .permitAll()
                    .and()
                .logout()
                    .permitAll()
                    .and()
                .authorizeRequests()
                    .antMatchers("/", "/home").permitAll()
                    .anyRequest().authenticated();
//        http
//                .exceptionHandling()
//                    .authenticationEntryPoint(authenticationEntryPoint)
//                    .and()
//                .rememberMe()
//                    .rememberMeServices(rememberMeServices)
//                    .key(env.getProperty("confman.security.rememberme.key"))
//                    .and()
//                .formLogin()
//                    .loginProcessingUrl("/app/authentication")
//                    .successHandler(ajaxAuthenticationSuccessHandler)
//                    .failureHandler(ajaxAuthenticationFailureHandler)
//                    .usernameParameter("username")
//                    .passwordParameter("password")
//                    .permitAll()
//                    .and()
//                .logout()
//                    .logoutUrl("/app/logout")
//                    .logoutSuccessHandler(ajaxLogoutSuccessHandler)
//                    .deleteCookies("JSESSIONID")
//                    .permitAll()
//                    .and()
//                .headers()
//                    .frameOptions().disable()
//                    .authorizeRequests()
//                .antMatchers("/confman/*").permitAll()
//                .antMatchers("/app/rest/register").permitAll()
//                .antMatchers("/app/rest/activate").permitAll()
//                .antMatchers("/app/rest/authenticate").permitAll()
//                .antMatchers("/app/rest/logs/**").hasAuthority(AuthoritiesConstants.ADMIN)
//                .antMatchers("/app/**").authenticated()
//                .antMatchers("/api/**").authenticated();


    }

    @Configuration
    protected static class AuthenticationConfiguration extends GlobalAuthenticationConfigurerAdapter {

        @Override
        public void init(AuthenticationManagerBuilder auth) throws Exception {
            auth.inMemoryAuthentication().withUser("user").password("password").roles("USER");
        }

    }


}
