package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.ConfmanApplication;
import com.ninjamind.confman.config.PersistenceConfig;
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
 * One test to verify database connection
 *
 * @author Guillaume EHRET
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = {ConfmanApplication.class})
public class EnvironmentRepositoryTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private EnvironmentRepository environmentRepository;

    @Before
    public void setUp(){
        Operation operation =
                sequenceOf(
                        CommonOperations.DELETE_ALL,
                        CommonOperations.INSERT_ENVIRONMENT,
                        CommonOperations.INSERT_SOFTWARE_SUITE,
                        CommonOperations.INSERT_APP,
                        CommonOperations.INSERT_SOFTWARE_SUITE_ENV,
                        CommonOperations.INSERT_INSTANCE
                );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(dataSource), operation);
        dbSetup.launch();
    }

    @Test
    public void shouldFindOneEnvironment() {
        assertThat(environmentRepository.findOne(1L).getCode()).isEqualTo("dev");
    }

    @Test
    public void shouldFindEnvironmentByIdApp() {
        assertThat(environmentRepository.findByIdApp(1L)).extracting("code").containsExactly("dev");
    }

    @Test
    public void shouldNotFindEnvironmentByCodeWhenCodeIsNull() {
        assertThat(environmentRepository.findByCode(null)).isNull();
    }

    @Test
    public void shouldFindEnvironmentByCode() {
        assertThat(environmentRepository.findByCode("DEV").getCode()).isEqualTo("dev");
    }
}
