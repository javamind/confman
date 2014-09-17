package com.ninjamind.confman.service;

import com.github.zafarkhaja.semver.Version;
import com.ninjamind.confman.domain.TrackingVersion;
import org.junit.Before;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class TrackingVersionFacadeImplTest {

    private TrackingVersionFacade trackingVersionFacade;

    @Before
    public void setUp() throws Exception {
        trackingVersionFacade = new TrackingVersionFacadeImpl();
    }

    @Test(expected = NullPointerException.class)
    public void shouldNotCreateTrackingVersionWhenCodeAppVersionIsNull(){
        trackingVersionFacade.createTrackingVersion(null);
    }

    @Test(expected = NullPointerException.class)
    public void shouldNotIncrementTrackingVersionWhenCodeIsNull(){
        trackingVersionFacade.incrementTrackingVersion(null);
    }

    @Test
    public void shouldCreateTrackingVersion(){
        assertThat(trackingVersionFacade.createTrackingVersion("1.0.0")).isEqualTo("1.0.0-track.1");
    }

    @Test
    public void shouldCreateTrackingVersionWhenAppIsSnapshot(){
        assertThat(trackingVersionFacade.createTrackingVersion("1.0.0-SNAPSHOT")).isEqualTo("1.0.0-track.1");
    }

    @Test
    public void shouldIncrementTrackingVersion(){
        assertThat(trackingVersionFacade.incrementTrackingVersion("1.0.0-track.1")).isEqualTo("1.0.0-track.2");
    }

    @Test
    public void theSnapShotShouldBeHigher(){
        assertThat(Version.valueOf("1.0.1-SNAPSHOT").compareTo(Version.valueOf("1.0.0"))).isGreaterThan(0);
    }

    @Test
    public void theSnapShotShouldBeLesser(){
        assertThat(Version.valueOf("1.0.1-SNAPSHOT").compareTo(Version.valueOf("1.0.2"))).isLessThan(0);
    }

    @Test
    public void theSnapShotShouldBeLesserWhenCoreIsTheSame(){
        assertThat(Version.valueOf("1.0.1-SNAPSHOT").compareTo(Version.valueOf("1.0.1"))).isLessThan(0);
    }
}
