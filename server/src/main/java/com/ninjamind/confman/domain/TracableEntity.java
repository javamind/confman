package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

/**
 * All our entities can tracabilities field
 *
 * @author Guillaume EHRET
 */
public interface TracableEntity<T extends TracableEntity> extends Serializable{

    public Date getActiveChangeDate();

    public T setActiveChangeDate(Date activeChangeDate);

    public Date getChangeDate();

    public T setChangeDate(Date changeDate) ;

    public String getChangeUser();

    public T setChangeUser(String changeUser);

    public Boolean isActive();

    public T setActive(Boolean active);
}
