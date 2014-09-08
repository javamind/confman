package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.config.PersistenceConfig;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.sql.DataSource;

import static com.ninja_squad.dbsetup.Operations.sequenceOf;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test of {@link com.ninjamind.confman.repository.InstanceRepository}
 *
 * @author Guillaume EHRET
 */
@ContextConfiguration(classes = {PersistenceConfig.class})
@RunWith(SpringJUnit4ClassRunner.class)
public class InstanceRepositoryTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private InstanceRepository instanceRepository;

    @Before
    public void setUp(){
        Operation operation =
                sequenceOf(
                        CommonOperations.DELETE_ALL,
                        CommonOperations.INSERT_ENVIRONMENT,
                        CommonOperations.INSERT_SOFTWARE_SUITE,
                        CommonOperations.INSERT_APP,
                        CommonOperations.INSERT_INSTANCE
                );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(dataSource), operation);
        dbSetup.launch();
    }


    @Test
    public void shouldFindOneInstanceByIdApp() {
        assertThat(instanceRepository.findInstanceByIdApp(1L)).hasSize(1).extracting("code").containsExactly("WWD450");
    }

    @Test
    public void shouldFindOneInstanceByIdEnv() {
        assertThat(instanceRepository.findInstanceByIdEnv(1L)).hasSize(1).extracting("code").containsExactly("WWD450");
    }

    @Test
    public void shouldFindOneInstanceByIdAppAndEnv() {
        assertThat(instanceRepository.findInstanceByIdappAndEnv(1L, 1L)).hasSize(1).extracting("code").containsExactly("WWD450");
    }

    @Test
    public void shouldFindNoInstanceByIdAppAndEnv() {
        assertThat(instanceRepository.findInstanceByIdappAndEnv(1L, 4L)).isEmpty();
    }
}
