package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.TrackingVersion;
import org.assertj.core.api.Assertions;
import org.junit.Before;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class TrackingVersionFacadeImplTest {

    private TrackingVersionFacade<TrackingVersion, Long> trackingVersionFacade;

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


}
