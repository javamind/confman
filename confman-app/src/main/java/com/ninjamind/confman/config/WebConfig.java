package com.ninjamind.confman.config;

import com.ninjamind.confman.controller.api.ApplicationVersionApiController;
import com.ninjamind.confman.controller.api.InstanceApiController;
import com.ninjamind.confman.controller.api.ParameterApiController;
import com.ninjamind.confman.controller.api.ParameterValueApiController;
import com.ninjamind.confman.controller.web.*;
import com.ninjamind.confman.controller.web.ParameterWebController;
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
    public EnvironmentWebController environmentController(){
        return new EnvironmentWebController();
    }

    @Bean
    public SoftwareSuiteWebController softwareSuiteController(){
        return new SoftwareSuiteWebController();
    }

    @Bean
    public ApplicationWebController applicationController(){
        return new ApplicationWebController();
    }

    @Bean
    public ApplicationVersionWebController applicationVersionController(){
        return new ApplicationVersionWebController();
    }

    @Bean
    public TrackingVersionWebController trackingVersionController(){
        return new TrackingVersionWebController();
    }

    @Bean
    public InstanceWebController instanceController(){
        return new InstanceWebController();
    }

    @Bean
    public ParameterWebController parameterController(){
        return new ParameterWebController();
    }

    @Bean
    public ParameterValueWebController parameterValueController(){
        return new ParameterValueWebController();
    }

    @Bean
    public ParameterValueApiController publicController() {
        return new ParameterValueApiController();
    }

    @Bean
    public ApplicationVersionApiController applicationVersionApiController() {
        return new ApplicationVersionApiController();
    }

    @Bean
    InstanceApiController instanceApiController(){
        return new InstanceApiController();
    }

    @Bean
    ParameterApiController parameterApiController(){
        return new ParameterApiController();
    }
}
