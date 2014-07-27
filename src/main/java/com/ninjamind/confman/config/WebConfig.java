package com.ninjamind.confman.config;

import com.ninjamind.confman.web.ApplicationController;
import com.ninjamind.confman.web.EnvironmentController;
import com.ninjamind.confman.web.SoftwareSuiteController;
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
}
