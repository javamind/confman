package com.ninjamind.confman.service;

import com.google.common.base.Objects;
import com.ninjamind.confman.domain.AbstractConfManEntity;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.TracableEntity;
import com.ninjamind.confman.repository.ConfmanRepository;
import com.ninjamind.confman.repository.HibernateUtil;
import com.ninjamind.confman.security.AuthoritiesConstants;
import com.ninjamind.confman.security.SecurityUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * A generic facade which manage entity of type T. ID represent the identifiant type, Repository is the
 * default repository to manage the entity
 *
 * @author Guillaume EHRET
 */
@Transactional
public interface GenericFacade<T extends TracableEntity, ID extends Serializable, Repository extends ConfmanRepository<T, ID>> {

    /**
     *
     * @return
     */
    Repository getRepository();

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
        return getRepository().findByActiveTrue();
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
     * Set the user and the change date. if user is unknown we use {@link com.ninjamind.confman.security.AuthoritiesConstants#UNKNOWN}
     * @param entity
     */
    default <S extends TracableEntity> void updateTracability(S entity){
        entity.setChangeDate(new Date());
        entity.setChangeUser(Objects.firstNonNull(SecurityUtils.getCurrentLogin(), AuthoritiesConstants.UNKNOWN));
    }

    /**
     * Update a given entity. Use the returned instance for further operations as the save operation might have changed the
     * entity instance completely.
     *
     * @param entity
     * @return the saved entity
     */
    default <S extends T> S update(S entity){
        updateTracability(entity);
        return getRepository().save(entity);
    }

    /**
     * Create a given entity. Use the returned instance for further operations as the save operation might have changed the
     * entity instance completely. We can make logical deletion. So if an non active element is find in database we update it
     * We use {@link #findByCode(com.ninjamind.confman.domain.TracableEntity)}
     * @param entity
     * @return the saved entity
     */
    default <S extends T> S create(S entity){
        //We see if an entity exist
        S object = findByCode(entity);
        boolean creation = false;
        if(object==null){
            object = entity;
            creation = true;
        }
        else{
            //All the proprieties are copied except the version number
            BeanUtils.copyProperties(entity, object, "id", "version");
        }
        if(creation || !Boolean.TRUE.equals(entity.isActive())){
            entity.setActiveChangeDate(new Date());
        }
        entity.setActive(true);
        updateTracability(entity);
        return getRepository().save(object);
    }

    /**
     * Default method use in entity creation
     * @param entity
     * @param <S>
     * @see #create(com.ninjamind.confman.domain.TracableEntity)
     * @return
     */
    <S extends T> S findByCode(S entity);

    /**
     * Deletes the entity with the given id. It's logical delete and entity is inactived
     *
     * @param id must not be {@literal null}.
     * @throws IllegalArgumentException in case the given {@code id} is {@literal null}
     */
    default void delete(ID id){
        //if the element exist we make a logical delete
        T myObject = getRepository().findOne(id);
        if(myObject!=null){
            updateTracability(myObject.setActive(false).setActiveChangeDate(new Date()));
        }
    }

    /**
     * Deletes the entity with the given id
     *
     * @param id must not be {@literal null}.
     * @throws IllegalArgumentException in case the given {@code id} is {@literal null}
     */
    default void deleteReal(ID id){
        //if the element exist we make a logical delete
        getRepository().delete(id);
    }

}
