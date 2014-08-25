package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.config.PersistenceConfig;
import com.ninjamind.confman.domain.Application;
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
 * Test of {@link com.ninjamind.confman.repository.ApplicationtVersionRepository}
 *
 * @author EHRET_G
 */
@ContextConfiguration(classes = {PersistenceConfig.class})
@RunWith(SpringJUnit4ClassRunner.class)
public class ApplicationVersionRepositoryTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ApplicationtVersionRepository applicationtVersionRepository;

    @Before
    public void setUp(){
        Operation operation =
                sequenceOf(
                        CommonOperations.DELETE_ALL,
                        CommonOperations.INSERT_ENVIRONMENT,
                        CommonOperations.INSERT_SOFTWARE_SUITE,
                        CommonOperations.INSERT_APP,
                        CommonOperations.INSERT_VERSION
                );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(dataSource), operation);
        dbSetup.launch();
    }


    @Test
    public void shouldFindOneApplicationVersion() {
        assertThat(applicationtVersionRepository.findApplicationVersionByIdApp(1L)).hasSize(1).extracting("code").containsExactly("1.0.0");
    }

    @Test
    public void shouldNotFindApplicationVersionByCodeWhenCodeIsNull() {
        assertThat(applicationtVersionRepository.findApplicationVersionByCode(null)).isNull();
    }

    @Test
    public void shouldFindApplicationVersionByCode() {
        assertThat(applicationtVersionRepository.findApplicationVersionByCode("1.0.0").getLabel()).isEqualTo("app version");
    }
}
