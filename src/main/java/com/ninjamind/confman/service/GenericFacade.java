package com.ninjamind.confman.service;

import com.ninjamind.confman.repository.HibernateUtil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Transactional
public interface GenericFacade<T, ID extends Serializable> {

    /**
     *
     * @return
     */
    JpaRepository<T, ID> getRepository();

    /**
     *
     * @return
     */
    Class<T> getClassEntity();

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
        return HibernateUtil.unproxy(getRepository().getOne(id), getClassEntity());
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
