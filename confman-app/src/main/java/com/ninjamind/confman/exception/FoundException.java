package com.ninjamind.confman.exception;

import com.ninjamind.confman.domain.AbstractConfManEntity;

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

    public static <T extends AbstractConfManEntity> T foundExceptionIfNotNullAndActive(T value) {
        if (value != null && value.isActive()) {
            throw new FoundException(value.getClass() + " was found and active. You can't create twice an entity");
        }
        return value;

    }
}
