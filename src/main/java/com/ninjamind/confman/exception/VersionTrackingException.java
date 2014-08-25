package com.ninjamind.confman.exception;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class VersionTrackingException extends RuntimeException{
    public VersionTrackingException() {
    }

    public VersionTrackingException(String message) {
        super(message);
    }

    public VersionTrackingException(String message, Throwable cause) {
        super(message, cause);
    }

    public VersionTrackingException(Throwable cause) {
        super(cause);
    }

    public VersionTrackingException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
