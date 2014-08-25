package com.ninjamind.confman.config;

import com.ninjamind.confman.web.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@ComponentScan("com.ninjamind.confman.service")
@Transactional(propagation = Propagation.REQUIRES_NEW)
public class WebConfig {

    @Bean
    public EnvironmentController environmentController(){
        return new EnvironmentController();
    }

    @Bean
    public SoftwareSuiteController softwareSuiteController(){
        return new SoftwareSuiteController();
    }

    @Bean
    public ApplicationController applicationController(){
        return new ApplicationController();
    }

    @Bean
    public ApplicationVersionController applicationVersionController(){
        return new ApplicationVersionController();
    }

    @Bean
    public TrackingVersionController trackingVersionController(){
        return new TrackingVersionController();
    }

    @Bean
    public InstanceController instanceController(){
        return new InstanceController();
    }

    @Bean
    public ParameterController parameterController(){
        return new ParameterController();
    }

    @Bean
    public ParameterValueController parameterValueController(){
        return new ParameterValueController();
    }

    @Bean
    public PublicController publicController() {
        return new PublicController();
    }
}
