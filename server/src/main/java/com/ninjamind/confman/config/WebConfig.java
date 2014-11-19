package com.ninjamind.confman.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@EnableWebMvc
@Configuration
public class WebConfig extends WebMvcConfigurerAdapter {

    @Autowired
    private Environment env;

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }

    /**
     * The default port is 8082
     * @return
     */
    @Bean
    public Integer serverPort(){
        return Integer.valueOf(env.getProperty("client.port", "8082"));
    }

    /**
     * The default hostname is localhost
     * @return
     */
    @Bean
    public String serverHostname(){
        return env.getProperty("client.hostname", "localhost");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        if (!registry.hasMappingForPattern("/confman/**")) {
            registry.addResourceHandler("/confman/**").addResourceLocations("classpath:/static/confman/");
        }
    }


}
