package com.ninjamind.confmanager.web;

import net.codestory.http.annotations.Get;

import java.util.Date;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class HourController {
    @Get("/date")
    public Date date() {
        return new Date();
    }
}
