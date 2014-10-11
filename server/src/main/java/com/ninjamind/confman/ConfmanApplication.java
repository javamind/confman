package com.ninjamind.confman;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;

/**
 * Lanceur de l'application web
 *
 * @author Guillaume EHRET
 */

@ComponentScan
@EnableAutoConfiguration
public class ConfmanApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(SpringApplicationBuilder.class);
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(ConfmanApplication.class, args);
    }

}
