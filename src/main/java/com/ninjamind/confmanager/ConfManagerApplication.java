package com.ninjamind.confmanager;

import com.ninjamind.confmanager.config.PersistenceConfig;
import com.ninjamind.confmanager.config.WebConfig;
import com.ninjamind.confmanager.web.EnvironmentController;
import net.codestory.http.WebServer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Lanceur de l'application web
 *
 * @author EHRET_G
 */
public class ConfManagerApplication {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext rootContext = new AnnotationConfigApplicationContext();
        rootContext.register(PersistenceConfig.class, WebConfig.class);
        rootContext.refresh();

        new WebServer(routes -> routes
                .get("/hello/:who", (context, name) -> "Welcome " + name)
                .add(rootContext.getBean(EnvironmentController.class))
        ).start(8082);
    }
}
