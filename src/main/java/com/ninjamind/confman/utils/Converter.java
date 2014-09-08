package com.ninjamind.confman.utils;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class Converter {

    public static Long convertId(Object value){
        if(value==null){
            return null;
        }
        return (Long)((Integer) value).longValue();
    }

    public static <T> T convert(Object value, Class<T> type){
        if(value==null){
            return null;
        }
        return (T) value;
    }

}
