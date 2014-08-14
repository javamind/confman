package com.ninjamind.confman.exception;

import com.github.rjeschke.txtmark.Run;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class VersionException extends RuntimeException{
    public VersionException() {
    }

    public VersionException(String message) {
        super(message);
    }

    public VersionException(String message, Throwable cause) {
        super(message, cause);
    }

    public VersionException(Throwable cause) {
        super(cause);
    }

    public VersionException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
