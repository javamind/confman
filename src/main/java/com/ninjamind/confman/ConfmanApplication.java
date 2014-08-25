package com.ninjamind.confman;

import com.ninjamind.confman.config.PersistenceConfig;
import com.ninjamind.confman.config.WebConfig;
import com.ninjamind.confman.web.*;
import net.codestory.http.WebServer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Lanceur de l'application web
 *
 * @author EHRET_G
 */
public class ConfmanApplication {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext rootContext = new AnnotationConfigApplicationContext();
        rootContext.register(PersistenceConfig.class, WebConfig.class);
        rootContext.refresh();

        new WebServer(routes -> routes
                .add(rootContext.getBean(EnvironmentController.class))
                .add(rootContext.getBean(SoftwareSuiteController.class))
                .add(rootContext.getBean(ApplicationController.class))
                .add(rootContext.getBean(InstanceController.class))
                .add(rootContext.getBean(ApplicationVersionController.class))
                .add(rootContext.getBean(ParameterController.class))
                .add(rootContext.getBean(TrackingVersionController.class))
                .add(rootContext.getBean(ParameterValueController.class))
                .add(rootContext.getBean(PublicController.class))
        ).start(8082);
    }
}
