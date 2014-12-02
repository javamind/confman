package com.ninjamind.confman.domain;

import javax.persistence.*;

/**
 * For one tracking, each parameter has a value for the entire applicaton or one instance
 *
 * @author Guillaume EHRET
 */
@Entity
@Table(name= ParameterValue.TABLE_NAME)
public class ParameterValue extends AbstractConfManEntity<ParameterValue>{
    public final static String TABLE_NAME="parametervalue";
    public final static String SEQ_NAME= "seq_parameter_value";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = ParameterValue.SEQ_NAME)
    @SequenceGenerator(name = ParameterValue.SEQ_NAME, sequenceName = ParameterValue.SEQ_NAME, allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trackingversion_id")
    private TrackingVersion trackingVersion;
    @Column(name = "trackingversion_code")
    private String codeTrackingVersion;
    @Column(name = "trackingversion_label")
    private String labelTrackingVersion;

    @ManyToOne
    @JoinColumn(name = "parameter_id")
    private Parameter parameter;
    @Column(name = "parameter_label")
    private String labelParameter;


    @ManyToOne
    @JoinColumn(name = "instance_id")
    private Instance instance;
    @Column(name = "instance_code")
    private String codeInstance;
    @Column(name = "instance_label")
    private String labelInstance;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;
    @Column(name = "application_code")
    private String codeApplication;
    @Column(name = "application_label")
    private String labelApplication;

    @ManyToOne
    @JoinColumn(name = "environment_id")
    private Environment environment;
    @Column(name = "environment_code")
    private String codeEnvironment;
    @Column(name = "environment_label")
    private String labelEnvironment;

    /**
     * the old value
     */
    private String oldvalue;

    public ParameterValue() {
    }

    public Long getId() {
        return id;
    }

    public ParameterValue setId(Long id) {
        this.id = id;
        return this;
    }

    public TrackingVersion getTrackingVersion() {
        return trackingVersion;
    }

    public ParameterValue setTrackingVersion(TrackingVersion trackingVersion) {
        this.trackingVersion = trackingVersion;
        this.codeTrackingVersion = trackingVersion.getCode();
        this.labelTrackingVersion = trackingVersion.getLabel();
        return this;
    }

    public Parameter getParameter() {
        return parameter;
    }

    public ParameterValue setParameter(Parameter parameter) {
        this.parameter = parameter;
        this.labelParameter = parameter.getLabel();
        return this;
    }

    public Environment getEnvironment() {
        return environment;
    }

    public ParameterValue setEnvironment(Environment environment) {
        this.environment = environment;
        this.codeEnvironment = environment.getCode();
        this.labelEnvironment = environment.getLabel();
        return this;
    }

    public Instance getInstance() {
        return instance;
    }

    public ParameterValue setInstance(Instance instance) {
        this.instance = instance;
        if(instance!=null) {
            this.codeInstance = instance.getCode();
            this.labelInstance = instance.getLabel();
        }
        else{
            this.codeInstance = null;
            this.labelInstance = null;
        }
        return this;
    }

    public Application getApplication() {
        return application;
    }

    public ParameterValue setApplication(Application application) {
        this.application = application;
        this.codeApplication = application.getCode();
        this.labelApplication = application.getLabel();
        return this;
    }

    public String getOldvalue() {
        return oldvalue;
    }

    public ParameterValue setOldvalue(String oldvalue) {
        this.oldvalue = oldvalue;
        return this;
    }

    public String getCodeTrackingVersion() {
        return codeTrackingVersion;
    }

    public String getLabelTrackingVersion() {
        return labelTrackingVersion;
    }

    public ParameterValue setLabelTrackingVersion(String labelTrackingVersion) {
        this.labelTrackingVersion = labelTrackingVersion;
        return this;
    }

    public ParameterValue setCodeTrackingVersion(String codeTrackingVersion) {
        this.codeTrackingVersion = codeTrackingVersion;
        return this;
    }

    public String getLabelParameter() {
        return labelParameter;
    }

    public ParameterValue setLabelParameter(String labelParameter) {
        this.labelParameter = labelParameter;
        return this;
    }

    public String getCodeInstance() {
        return codeInstance;
    }

    public ParameterValue setCodeInstance(String codeInstance) {
        this.codeInstance = codeInstance;
        return this;
    }

    public String getLabelInstance() {
        return labelInstance;
    }

    public ParameterValue setLabelInstance(String labelInstance) {
        this.labelInstance = labelInstance;
        return this;
    }

    public String getCodeApplication() {
        return codeApplication;
    }

    public ParameterValue setCodeApplication(String codeApplication) {
        this.codeApplication = codeApplication;
        return this;
    }

    public String getLabelApplication() {
        return labelApplication;
    }

    public ParameterValue setLabelApplication(String labelApplication) {
        this.labelApplication = labelApplication;
        return this;
    }

    public String getCodeEnvironment() {
        return codeEnvironment;
    }

    public ParameterValue setCodeEnvironment(String codeEnvironment) {
        this.codeEnvironment = codeEnvironment;
        return this;
    }

    public String getLabelEnvironment() {
        return labelEnvironment;
    }

    public ParameterValue setLabelEnvironment(String labelEnvironment) {
        this.labelEnvironment = labelEnvironment;
        return this;
    }

    /**
     * Several fields are denormalized. We have to update them when changes occurs on the parameters
     * @return
     */
    public ParameterValue updateDependencies(){
        return setCode(parameter.getCode()).setParameter(parameter).setInstance(instance).setApplication(application).setEnvironment(environment);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ParameterValue that = (ParameterValue) o;

        if (application != null ? !application.equals(that.application) : that.application != null) return false;
        if (environment != null ? !environment.equals(that.environment) : that.environment != null) return false;
        if (instance != null ? !instance.equals(that.instance) : that.instance != null) return false;
        if (parameter != null ? !parameter.equals(that.parameter) : that.parameter != null) return false;
        if (trackingVersion != null ? !trackingVersion.equals(that.trackingVersion) : that.trackingVersion != null) return false;

        return true;
    }

    public boolean compareWithOldTrackingVersion(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ParameterValue that = (ParameterValue) o;

        if (application != null ? !application.equals(that.application) : that.application != null) return false;
        if (environment != null ? !environment.equals(that.environment) : that.environment != null) return false;
        if (parameter != null ? !parameter.equals(that.parameter) : that.parameter != null) return false;
        if (!getCode().equals(that.getCode())) return false;
        if (instance != null &&  !instance.equals(that.instance)) return false;
        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (trackingVersion != null ? trackingVersion.hashCode() : 0);
        result = 31 * result + (parameter != null ? parameter.hashCode() : 0);
        result = 31 * result + (instance != null ? instance.hashCode() : 0);
        result = 31 * result + (application != null ? application.hashCode() : 0);
        return result;
    }
}
