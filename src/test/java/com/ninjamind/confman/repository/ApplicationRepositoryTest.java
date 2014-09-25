package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.ConfmanApplication;
import com.ninjamind.confman.config.PersistenceConfig;
import com.ninjamind.confman.domain.Application;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.sql.DataSource;

import static com.ninja_squad.dbsetup.Operations.sequenceOf;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test of {@link com.ninjamind.confman.repository.ApplicationtRepository}
 *
 * @author Guillaume EHRET
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = {ConfmanApplication.class})
public class ApplicationRepositoryTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ApplicationtRepository applicationRepository;

    @Before
    public void setUp(){
        Operation operation =
                sequenceOf(
                        CommonOperations.DELETE_ALL,
                        CommonOperations.INSERT_ENVIRONMENT,
                        CommonOperations.INSERT_SOFTWARE_SUITE,
                        CommonOperations.INSERT_SOFTWARE_SUITE_ENV,
                        CommonOperations.INSERT_APP,
                        CommonOperations.INSERT_INSTANCE,
                        CommonOperations.INSERT_VERSION,
                        CommonOperations.INSERT_PARAMETER
                );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(dataSource), operation);
        dbSetup.launch();
    }

    @Test
    public void shouldFindOneApplication() {
        Application app = applicationRepository.findOneWithDependencies(1L);
        assertThat(app.getCode()).isEqualTo("CFM");
        assertThat(app.getApplicationVersions()).hasSize(1);
        assertThat(app.getInstances()).hasSize(1);
        assertThat(app.getParameters()).hasSize(2);
    }

    @Test
    public void shouldFindNoApplicationByIdEnvWhenNoAppIsConfiguredOnEnv() {
        assertThat(applicationRepository.findByIdEnv(2L)).isEmpty();
    }

    @Test
    public void shouldFindNoApplicationByIdEnvWhenIdEnvIsNull() {
        assertThat(applicationRepository.findByIdEnv(null)).isEmpty();
    }

    @Test
    public void shouldFindApplicationByIdEnv() {
        assertThat(applicationRepository.findByIdEnv(1L)).hasSize(1).extracting("code").containsExactly("CFM");
    }
}
