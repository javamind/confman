package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Authority;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.security.AuthoritiesConstants;

/**
 * {@link com.ninjamind.confman.domain.Environment}
 *
 * @author Guillaume EHRET
 */
public class EnvironmentDto extends AbstractConfmanAppDto<EnvironmentDto, Environment> {
    private String profile;

    public EnvironmentDto() {
        super();
    }

    public EnvironmentDto(Environment environment) {
        super(
                environment.getId(),
                environment.getCode(),
                environment.getLabel(),
                environment.getVersion(),
                environment.isActive()
        );
        this.profile = environment.getProfil()!=null ? environment.getProfil().getName() : null;
    }

    public Environment toDo() {
        String profile = getProfile() !=null && "*".equals(getProfile()) ? null : getProfile();

        return new Environment()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive())
                .setProfil(getProfile() !=null ? new Authority().setName(profile) : null);
    }

    public String getProfile() {
        return profile;
    }

    public EnvironmentDto setProfile(String profile) {
        this.profile = profile;
        return this;
    }
}
