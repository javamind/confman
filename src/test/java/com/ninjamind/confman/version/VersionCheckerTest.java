package com.ninjamind.confman.version;

import com.github.zafarkhaja.semver.Version;
import com.github.zafarkhaja.semver.util.UnexpectedElementTypeException;
import org.assertj.core.api.Assertions;
import org.junit.Test;

/**
 * Created by ehret_g on 13/08/14.
 */
public class VersionCheckerTest {


    @Test(expected = UnexpectedElementTypeException.class)
    public void shouldThrowExceptionIfVersonIsNotValid(){
        Version.valueOf("1.0");
    }

    @Test
    public void shouldIncrementMinorVersion(){
        Assertions.assertThat(Version.valueOf("1.0.0").incrementMinorVersion().toString()).isEqualTo("1.1.0");
    }

    @Test
    public void shouldIncrementMinorVersionForSnapshot(){
        Assertions.assertThat(Version.valueOf("1.0.0-SNAPSHOT").incrementMinorVersion().toString()).isEqualTo("1.1.0");
    }

    @Test
    public void shouldIncrementBuildMetadataForSnapshot(){
        Assertions.assertThat(Version.valueOf("1.0.0-SNAPSHOT").incrementMinorVersion().setPreReleaseVersion("SNAPSHOT").toString()).isEqualTo("1.1.0-SNAPSHOT");
    }
}
