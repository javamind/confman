package com.ninjamind.confman;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

/**
 * Lanceur de l'application web
 *
 * @author Guillaume EHRET
 */

@ComponentScan
@EnableAutoConfiguration
public class ConfmanApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(ConfmanApplication.class, args);
    }

}
