package com.ninjamind.confmanager.service;

import com.ninjamind.confmanager.domain.Environment;
import com.ninjamind.confmanager.repository.EnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utils.LoggerFactory;

import java.io.Serializable;
import java.util.List;
import java.util.ListIterator;
import java.util.Objects;
import java.util.function.UnaryOperator;
import java.util.logging.Logger;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public interface GenericFacade<T, ID extends Serializable> {

    static Logger LOG = LoggerFactory.make();

    JpaRepository<T, ID> getRepository();

    /**
     * Returns all instances of the type with the given IDs.
     * @return
     */
    default List<T> findAll(){
        return getRepository().findAll();
    }

    /**
     * Returns a reference to the entity with the given identifier.
     *
     * @param id must not be {@literal null}.
     * @return a reference to the entity with the given identifier.
     * @see javax.persistence.EntityManager#getReference(Class, Object)
     */
    default T findOne(ID id){
        return getRepository().getOne(id);
    }

    /**
     * Saves a given entity. Use the returned instance for further operations as the save operation might have changed the
     * entity instance completely.
     *
     * @param entity
     * @return the saved entity
     */
    default <S extends T> S save(S entity){
        return getRepository().save(entity);
    }

    /**
     * Deletes the entity with the given id.
     *
     * @param id must not be {@literal null}.
     * @throws IllegalArgumentException in case the given {@code id} is {@literal null}
     */
    default void delete(ID id){
        getRepository().delete(id);
    }
}
