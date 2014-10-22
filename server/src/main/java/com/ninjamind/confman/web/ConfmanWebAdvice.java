package com.ninjamind.confman.web;

import com.ninjamind.confman.exception.ConverterException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

/**
 * We use a global configuration for errors in rest controllers
 * @author Guillaume EHRET
 */
@ControllerAdvice(annotations = RestController.class)
public class ConfmanWebAdvice {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<String>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConverterException.class)
    public ResponseEntity<String> handleConverterException(ConverterException ex) {
        return new ResponseEntity<String>(ex.getMessage(), HttpStatus.EXPECTATION_FAILED);
    }

}
