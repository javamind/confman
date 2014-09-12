package com.ninjamind.confman.exception;

/**
 * This exception is thrown when a data is found
 *
 * @author Guillaume EHRET
 */
public class FoundException extends RuntimeException{

    public FoundException(String message) {
        super(message);
    }

    public FoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public static <T> T foundIfNotNull(T value) {
        if (value != null) {
            return value;
        }
        throw new FoundException(value.getClass() + " was not found");
    }
}
