package com.ninjamind.confman.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.google.common.base.Objects;
import com.ninjamind.confman.domain.AbstractConfManEntity;
import com.ninjamind.confman.domain.TracableEntity;

import java.io.Serializable;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
public interface ConfmanAppDto<E extends TracableEntity> extends Serializable {

    public E toDo();


}
