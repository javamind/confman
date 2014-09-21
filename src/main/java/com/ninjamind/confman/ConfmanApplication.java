package com.ninjamind.confman;

import com.ninjamind.confman.config.PersistenceConfig;
import com.ninjamind.confman.config.WebConfig;
import com.ninjamind.confman.controller.api.VersionApiController;
import com.ninjamind.confman.controller.api.InstanceApiController;
import com.ninjamind.confman.controller.api.ParameterApiController;
import com.ninjamind.confman.controller.api.ParameterValueApiController;
import com.ninjamind.confman.controller.web.*;
import com.ninjamind.confman.controller.web.ParameterWebController;
import net.codestory.http.WebServer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Lanceur de l'application web
 *
 * @author Guillaume EHRET
 */
public class ConfmanApplication {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext rootContext = new AnnotationConfigApplicationContext();
        rootContext.register(PersistenceConfig.class, WebConfig.class);
        rootContext.refresh();

        new WebServer(routes -> routes
                .add(rootContext.getBean(EnvironmentWebController.class))
                .add(rootContext.getBean(SoftwareSuiteWebController.class))
                .add(rootContext.getBean(ApplicationWebController.class))
                .add(rootContext.getBean(InstanceWebController.class))
                .add(rootContext.getBean(ApplicationVersionWebController.class))
                .add(rootContext.getBean(ParameterWebController.class))
                .add(rootContext.getBean(TrackingVersionWebController.class))
                .add(rootContext.getBean(ParameterValueWebController.class))
                .add(rootContext.getBean(ParameterValueApiController.class))
                .add(rootContext.getBean(ParameterApiController.class))
                .add(rootContext.getBean(InstanceApiController.class))
                .add(rootContext.getBean(VersionApiController.class))
        ).start((Integer) rootContext.getBean("serverPort"));
    }
}
