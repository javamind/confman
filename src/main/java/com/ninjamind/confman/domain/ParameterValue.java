package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;

/**
 * For one tracking, each parameter has a value for the entire applicaton or one instance
 *
 * @author EHRET_G
 */
@Entity
@Table(name= ParameterValue.TABLE_NAME)
@AttributeOverride(name = "label", column = @Column(name = "value"))
public class ParameterValue extends AbstractConfManEntity<ParameterValue>{
    public final static String TABLE_NAME="parametervalue";
    public final static String SEQ_NAME= "seq_parameter_value";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = ParameterValue.SEQ_NAME)
    @SequenceGenerator(name = ParameterValue.SEQ_NAME, sequenceName = ParameterValue.SEQ_NAME, allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "versionTracking_id")
    private VersionTracking versionTracking;

    @ManyToOne
    @JoinColumn(name = "parameter_id")
    private Parameter parameter;

    @ManyToOne
    @JoinColumn(name = "instance_id")
    private Instance instance;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    public ParameterValue() {
    }

    public Long getId() {
        return id;
    }

    public ParameterValue setId(Long id) {
        this.id = id;
        return this;
    }

    /**
     * In the hibernate entities value is mapped with the property label
     * @return
     */
    public String getValue() {
        return super.getLabel();
    }

    /**
     * In the hibernate entities value is mapped with the property label
     * @return
     */
    public ParameterValue setValue(String value) {
        setLabel(value);
        return this;
    }

    public VersionTracking getVersionTracking() {
        return versionTracking;
    }

    public ParameterValue setVersionTracking(VersionTracking versionTracking) {
        this.versionTracking = versionTracking;
        return this;
    }

    public Parameter getParameter() {
        return parameter;
    }

    public ParameterValue setParameter(Parameter parameter) {
        this.parameter = parameter;
        return this;
    }

    public Instance getInstance() {
        return instance;
    }

    public ParameterValue setInstance(Instance instance) {
        this.instance = instance;
        return this;
    }

    public Application getApplication() {
        return application;
    }

    public ParameterValue setApplication(Application application) {
        this.application = application;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ParameterValue that = (ParameterValue) o;

        if (application != null ? !application.equals(that.application) : that.application != null) return false;
        if (instance != null ? !instance.equals(that.instance) : that.instance != null) return false;
        if (parameter != null ? !parameter.equals(that.parameter) : that.parameter != null) return false;
        if (versionTracking != null ? !versionTracking.equals(that.versionTracking) : that.versionTracking != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (versionTracking != null ? versionTracking.hashCode() : 0);
        result = 31 * result + (parameter != null ? parameter.hashCode() : 0);
        result = 31 * result + (instance != null ? instance.hashCode() : 0);
        result = 31 * result + (application != null ? application.hashCode() : 0);
        return result;
    }
}
