package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Parameters can be grouped
 *
 * @author Guillaume EHRET
 */
@Entity
@Table(name=ParameterGroupment.TABLE_NAME)
public class ParameterGroupment extends AbstractConfManEntity<ParameterGroupment>{
    public final static String TABLE_NAME="parametergrpt";
    public final static String SEQ_NAME= "seq_parameter_grpt";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = ParameterGroupment.SEQ_NAME)
    @SequenceGenerator(name = ParameterGroupment.SEQ_NAME, sequenceName = ParameterGroupment.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "parameterGroupment")
    private Set<Parameter> parameters= new HashSet<>();

    public ParameterGroupment() {
    }


    public ParameterGroupment addParameter(Parameter instance) {
         parameters.add(instance);
        return this;
    }

    public ParameterGroupment removeParameter(Object o) {
        parameters.remove(o);
        return this;
    }

    public void clearParameter() {
        parameters.clear();
    }

    public Set<Parameter> getParameters() {
        return Collections.unmodifiableSet(parameters);
    }

    public Long getId() {
        return id;
    }

    public ParameterGroupment setId(Long id) {
        this.id = id;
        return this;

    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .toString();
    }

}
