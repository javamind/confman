package com.ninjamind.confman.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;


/**
 * Persistent tokens are used by Spring Security to automatically log in users.
 *
 * @see com.ninjamind.confman.security.CustomPersistentRememberMeServices
 */
@Entity
@Table(name = "T_PERSISTENT_TOKEN")
public class PersistentToken implements Serializable {

    private static final SimpleDateFormat DATE_TIME_FORMATTER = new SimpleDateFormat("d MMMM yyyy");

    private static final int MAX_USER_AGENT_LEN = 255;

    @Id
    private String series;

    @JsonIgnore
    @NotNull
    @Column(name = "token_value", nullable = false)
    private String tokenValue;

    @JsonIgnore
    @Column(name = "token_date")
    private Date tokenDate;

    //an IPV6 address max length is 39 characters
    @Size(min = 0, max = 39)
    @Column(name = "ip_address", length = 39)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @JsonIgnore
    @ManyToOne
    private User user;

    public String getSeries() {
        return series;
    }

    public PersistentToken setSeries(String series) {
        this.series = series;
        return this;
    }

    public String getTokenValue() {
        return tokenValue;
    }

    public PersistentToken setTokenValue(String tokenValue) {
        this.tokenValue = tokenValue;
        return this;
    }

    public Date getTokenDate() {
        return tokenDate;
    }

    public PersistentToken setTokenDate(Date tokenDate) {
        this.tokenDate = tokenDate;
        return this;
    }

    @JsonGetter
    public String getFormattedTokenDate() {
        return DATE_TIME_FORMATTER.format(this.tokenDate);
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public PersistentToken setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public PersistentToken setUserAgent(String userAgent) {
        if (userAgent.length() >= MAX_USER_AGENT_LEN) {
            this.userAgent = userAgent.substring(0, MAX_USER_AGENT_LEN - 1);
        } else {
            this.userAgent = userAgent;
        }
        return this;
    }

    public User getUser() {
        return user;
    }

    public PersistentToken setUser(User user) {
        this.user = user;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        PersistentToken that = (PersistentToken) o;

        if (!series.equals(that.series)) {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return series.hashCode();
    }

    @Override
    public String toString() {
        return "PersistentToken{" +
                "series='" + series + '\'' +
                ", tokenValue='" + tokenValue + '\'' +
                ", tokenDate=" + tokenDate +
                ", ipAddress='" + ipAddress + '\'' +
                ", userAgent='" + userAgent + '\'' +
                "}";
    }
}