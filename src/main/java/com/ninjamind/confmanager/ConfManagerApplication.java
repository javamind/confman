package com.ninjamind.confmanager;

import com.ninjamind.confmanager.web.HourController;
import net.codestory.http.WebServer;

/**
 * Lanceur de l'application web
 *
 * @author EHRET_G
 */
public class ConfManagerApplication {

    public static void main(String[] args) {
        new WebServer(routes -> routes
                .get("/hello/:who", (context, name) -> "Welcome " + name)
                .add(HourController.class)
        ).start(8082);
    }
}
