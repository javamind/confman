package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.ApplicationVersion;
import junit.framework.TestCase;
import org.assertj.core.api.Assertions;
import org.junit.Before;
import org.junit.Test;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class ApplicationVersionFacadeImplTest {
    private ApplicationVersionFacade<ApplicationVersion, Long> applicationVersionFacade;

    @Before
    public void setUp() throws Exception {
        applicationVersionFacade = new ApplicationVersionFacadeImpl();
    }

    @Test
    public void shouldNotCheckVersionNumberWhenVersionIsNull() throws Exception {
        Assertions.assertThat(applicationVersionFacade.checkVersionNumber(null)).isFalse();
    }

    @Test
    public void shouldNotCheckVersionNumberWhenVersionIsIncomplete() throws Exception {
        Assertions.assertThat(applicationVersionFacade.checkVersionNumber("1.0")).isFalse();
    }

    @Test
    public void shouldCheckVersionNumber() throws Exception {
        Assertions.assertThat(applicationVersionFacade.checkVersionNumber("1.0.0")).isTrue();
    }

    @Test
    public void shouldCheckVersionNumberForASnapshot() throws Exception {
        Assertions.assertThat(applicationVersionFacade.checkVersionNumber("1.0.0-SNAPSHOT")).isTrue();
    }

    @Test
    public void shouldCheckVersionNumberForARC() throws Exception {
        Assertions.assertThat(applicationVersionFacade.checkVersionNumber("1.0.0+rc1")).isTrue();
    }
}
