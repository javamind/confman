package com.ninjamind.confman;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.resource.ResourceUrlEncodingFilter;

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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if (!registry.hasMappingForPattern("/confman/**")) {
            registry.addResourceHandler("/confman/**").addResourceLocations("classpath:/static/confman/");
        }

//        if (!registry.hasMappingForPattern("/**")) {
//            registry.addResourceHandler("/**").addResourceLocations(RESOURCE_LOCATIONS);
//        }
    }


}
