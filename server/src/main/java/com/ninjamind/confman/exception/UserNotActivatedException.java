package com.ninjamind.confman.exception;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class UserNotActivatedException extends RuntimeException{
    public UserNotActivatedException() {
    }

    public UserNotActivatedException(String message) {
        super(message);
    }

    public UserNotActivatedException(String message, Throwable cause) {
        super(message, cause);
    }

    public UserNotActivatedException(Throwable cause) {
        super(cause);
    }

    public UserNotActivatedException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
