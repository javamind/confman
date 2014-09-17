package com.ninjamind.confman.exception;

/**
 * This exception is thrown when a data is not found
 *
 * @author Guillaume EHRET
 */
public class NotFoundException extends RuntimeException{

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public static <T> T notFoundIfNull(T value) {
        if (value != null) {
            return value;
        }
        throw new NotFoundException(value.getClass() + " was not found");
    }
}
