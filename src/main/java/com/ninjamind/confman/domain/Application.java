package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
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
public class Application extends AbstractConfManEntity<Application>{
    public final static String TABLE_NAME="application";
    public final static String SEQ_NAME= "seq_application";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = Application.SEQ_NAME)
    @SequenceGenerator(name = Application.SEQ_NAME, sequenceName = Application.SEQ_NAME, allocationSize = 1)
    private Long id;


    @OneToMany(mappedBy = "application")
    private Set<ApplicationVersion> applicationVersions= new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "softwareSuite_id")
    private SoftwareSuite softwareSuite;

    public Application() {
    }

    public SoftwareSuite getSoftwareSuite() {
        return softwareSuite;
    }

    public Application setSoftwareSuite(SoftwareSuite softwareSuite) {
        this.softwareSuite = softwareSuite;
        return this;
    }

    public Application addApplicationVersion(ApplicationVersion applicationVersion) {
        applicationVersions.add(applicationVersion);
        return this;
    }

    public Application removeApplicationVersion(Object o) {
        applicationVersions.remove(o);
        return this;
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

    public Application setId(Long id) {
        this.id = id;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Application)) return false;
        if (!super.equals(o)) return false;

        Application that = (Application) o;

        if (softwareSuite != null ? !softwareSuite.equals(that.softwareSuite) : that.softwareSuite != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (softwareSuite != null ? softwareSuite.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .add("softwareSuite", softwareSuite)
                .toString();
    }
}
