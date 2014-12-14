package com.ninjamind.confman.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    private AuthoritiesConstants() {
    }

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String DEV = "ROLE_DEV";

    public static final String OPS = "ROLE_OPS";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String UNKNOWN = "UNKNOWN";
}
