package com.ninjamind.confman.config;

import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.web.*;
import org.hibernate.jpa.HibernatePersistenceProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.sql.DataSource;
import java.util.Properties;

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
}
