package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.lang.annotation.Target;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * one application evolve in the time and we do several release
 *
 * @author EHRET_G
 */
@Entity
@Table(name=Application.TABLE_NAME)
public class Application extends AbstractConfManEntity{
    public final static String TABLE_NAME="application";
    public final static String SEQ_NAME= "seq_application";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = Application.SEQ_NAME)
    @SequenceGenerator(name = Application.SEQ_NAME, sequenceName = Application.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "application")
    private Set<ApplicationVersion> applicationVersions= new HashSet<>();
    @ManyToOne
    @JoinColumn(name = "applicationGroupment_id")
    private ApplicationGroupment applicationGroupment;

    public Application() {
    }

    public Application(String code, String label) {
        super(code, label);
    }

    public Application(String code, String label, ApplicationGroupment applicationGroupment) {
        super(code, label);
        this.applicationGroupment = applicationGroupment;
    }

    public ApplicationGroupment getApplicationGroupment() {
        return applicationGroupment;
    }

    public void setApplicationGroupment(ApplicationGroupment applicationGroupment) {
        this.applicationGroupment = applicationGroupment;
    }

    public boolean addApplicationVersion(ApplicationVersion applicationVersion) {
        return applicationVersions.add(applicationVersion);
    }

    public boolean removeApplicationVersion(Object o) {
        return applicationVersions.remove(o);
    }

    public void clearApplicationVersion() {
        applicationVersions.clear();
    }

    public Set<ApplicationVersion> getApplicationVersions() {
        return Collections.unmodifiableSet(applicationVersions);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Application)) return false;
        if (!super.equals(o)) return false;

        Application that = (Application) o;

        if (applicationGroupment != null ? !applicationGroupment.equals(that.applicationGroupment) : that.applicationGroupment != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (applicationGroupment != null ? applicationGroupment.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .add("applicationGroupment", applicationGroupment)
                .toString();
    }
}
