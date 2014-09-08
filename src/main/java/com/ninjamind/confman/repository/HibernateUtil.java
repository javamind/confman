package com.ninjamind.confman.repository;

import org.hibernate.proxy.HibernateProxy;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class HibernateUtil {
    /**
     * If the objectUnproxy is not an Hibernate proxy, the object is returned. If not,
     * @param objectUnproxy object to unproxy if necessary
     * @param objetClass final class which will be the class of the final object
     * @return unproxied object
     * @throws ClassCastException
     */
    public static <T> T unproxy(Object objectUnproxy, Class<T> objetClass) throws ClassCastException {
        if (objectUnproxy instanceof HibernateProxy) {
            return objetClass.cast(((HibernateProxy) objectUnproxy).getHibernateLazyInitializer().getImplementation());
        }
        else {
            return objetClass.cast(objectUnproxy);
        }
    }
}
