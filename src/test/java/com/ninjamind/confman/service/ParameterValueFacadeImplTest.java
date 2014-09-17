package com.ninjamind.confman.service;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.repository.TrackingVersionRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@RunWith(MockitoJUnitRunner.class)
public class ParameterValueFacadeImplTest {

    @Mock
    private TrackingVersionRepository trackingVersionRepository;
    @InjectMocks
    private ParameterValueFacadeImpl parameterValueFacade = new ParameterValueFacadeImpl();

    @Test(expected = NullPointerException.class)
    public void shouldNotFindLastTrackingVersionIfListIsNull(){
        parameterValueFacade.findLastTrackingVersion(null);
    }

    @Test
    public void shouldNotFindLastTrackingVersionIfListIsEmpty(){
        assertThat(parameterValueFacade.findLastTrackingVersion(new ArrayList<>())).isEqualTo(Optional.empty());
    }

    @Test
    public void shouldFindLastTrackingVersion(){
        assertThat(parameterValueFacade.findLastTrackingVersion(
                 Lists.newArrayList(
                         new TrackingVersion().setId(1L).setCode("1.2.1-track.1"),
                         new TrackingVersion().setId(2L).setCode("1.4.1-track.2"),
                         new TrackingVersion().setId(3L).setCode("0.2.1-track.1"),
                         new TrackingVersion().setId(4L).setCode("1.4.1-track.1")
                 )).get().getCode()).isEqualTo("1.4.1-track.2");
    }

    @Test(expected = NullPointerException.class)
    public void shouldNotFindLastTrackingVersionUsedWhenVersionIsNull(){
        parameterValueFacade.findLastTrackingVersionUsed(null, new ArrayList<>());
    }

    @Test(expected = NullPointerException.class)
    public void shouldNotFindLastTrackingVersionUsedWhenListIsNull(){
        parameterValueFacade.findLastTrackingVersionUsed(new ApplicationVersion(), null);
    }

    @Test
    public void shouldNotFindLastTrackingVersionUsedIfListIsEmpty(){
        assertThat(parameterValueFacade.findLastTrackingVersionUsed(new ApplicationVersion().setCode("1.2.1"), new ArrayList<>())).isNull();
    }

    /**
     * Construct an ApplicationVersion list
     * @return
     */
    private List<ApplicationVersion> getApplicationVersions(){
        return Lists.newArrayList(
                new ApplicationVersion().setId(1L).setCode("1.2.1"),
                new ApplicationVersion().setId(2L).setCode("1.4.1"),
                new ApplicationVersion().setId(3L).setCode("0.2.1")
        );
    }

    @Test
    public void shouldNotFindLastTrackingVersionUsedIfNoTrackingVersionIsAttachedToApp(){
        Mockito.when(trackingVersionRepository.findByIdAppVersion(Mockito.anyLong())).thenReturn(new ArrayList<>());
        assertThat(parameterValueFacade.findLastTrackingVersionUsed(new ApplicationVersion().setCode("1.2.1"), getApplicationVersions())).isNull();
    }

    @Test
    public void shouldFindLastTrackingVersionUsed(){
        Mockito.when(trackingVersionRepository.findByIdAppVersion(Mockito.anyLong())).thenReturn(Lists.newArrayList(
                new TrackingVersion().setId(3L).setCode("0.2.1-track.1"),
                new TrackingVersion().setId(1L).setCode("0.2.1-track.5"),
                new TrackingVersion().setId(2L).setCode("0.2.1-track.2")));

        assertThat(parameterValueFacade.findLastTrackingVersionUsed(
                new ApplicationVersion().setCode("1.2.1"),
                getApplicationVersions()).getCode()).isEqualTo("0.2.1-track.5");
    }

    @Test
    public void shouldFindLastTrackingVersionUsedWhenTheFirstSonIsEmpty(){
        Mockito.when(trackingVersionRepository.findByIdAppVersion(Mockito.anyLong())).thenReturn(
                new ArrayList<>(),
                Lists.newArrayList(
                    new TrackingVersion().setId(3L).setCode("0.2.1-track.1"),
                    new TrackingVersion().setId(1L).setCode("0.2.1-track.5"),
                    new TrackingVersion().setId(2L).setCode("0.2.1-track.2")));

        assertThat(parameterValueFacade.findLastTrackingVersionUsed(new ApplicationVersion()
                .setCode("1.4.1"), getApplicationVersions()).getCode()).isEqualTo("0.2.1-track.5");
    }
}
