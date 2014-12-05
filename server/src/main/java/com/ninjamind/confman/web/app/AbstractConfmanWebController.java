package com.ninjamind.confman.web.app;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.AbstractConfManEntity;
import com.ninjamind.confman.dto.AbstractConfmanApiDto;
import com.ninjamind.confman.dto.AbstractConfmanAppDto;
import com.ninjamind.confman.exception.ConverterException;
import com.ninjamind.confman.service.GenericFacade;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Abstract Rest contoller to manage entity
 *
 * @author Guillaume EHRET
 */
@RestController
public abstract class AbstractConfmanWebController<
        E extends AbstractConfManEntity,
        D extends AbstractConfmanAppDto,
        ID extends Serializable> {

    private GenericFacade<E, ID, ?> genericFacade;
    private Class<D> dtoClass;
    private Class<E> doClass;

    public AbstractConfmanWebController(GenericFacade<E, ID, ?> genericFacade, Class<D> dtoClass, Class<E> doClass) {
        this.genericFacade = genericFacade;
        this.dtoClass = dtoClass;
        this.doClass = doClass;
    }

    /**
     * Template method to convert domain object in data transfert obect
     * @param entity
     * @return
     */
    private D convertToDto(E entity){
        try {
            return dtoClass.getConstructor(doClass).newInstance(entity);
        }
        catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            throw new ConverterException("Error on DTO converting " + e.getMessage(), e);
        }
    }

    /**
     * @return all the active entities
     */
    @RequestMapping
    @ResponseStatus(HttpStatus.OK)
    public List<D> list() {
        return genericFacade.findAll().stream().map(elt -> convertToDto(elt)).collect(Collectors.toList());
    }

    /**
     * @return one entity by its identifiant
     */
    @RequestMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public D get(@PathVariable ID id) {
        return convertToDto(genericFacade.findOne(id));
    }

    /**
     * Update one entity
     * @return
     */
    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<D> update(@RequestBody D object) {
        Preconditions.checkNotNull(object, "Object is required to update it");
        return new ResponseEntity(convertToDto(genericFacade.update((E)object.toDo())) ,HttpStatus.CREATED);
    }

    /**
     * Create one entity
     * @return
     */
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<D> save(@RequestBody D object) {
        Preconditions.checkNotNull(object, "Object is required to save it");
        return new ResponseEntity(convertToDto(genericFacade.create((E)object.toDo())) ,HttpStatus.CREATED);
    }

    /**
     * Create one entity by its identifiant
     * @return
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable ID id) {
        genericFacade.delete(id);
    }


}
