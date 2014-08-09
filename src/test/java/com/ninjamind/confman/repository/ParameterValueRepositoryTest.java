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
 * Test of {@link ParameterValueRepositoryImpl}
 *
 * @author EHRET_G
 */
@ContextConfiguration(classes = {PersistenceConfig.class})
@RunWith(SpringJUnit4ClassRunner.class)
public class ParameterValueRepositoryTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ParameterValueRepositoryImpl parameterValueRepository;

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
                        CommonOperations.INSERT_PARAMETER,
                        CommonOperations.INSERT_VERSION_TRACKING,
                        CommonOperations.INSERT_PARAMETER_VALUE
                );
        DbSetup dbSetup = new DbSetup(new DataSourceDestination(dataSource), operation);
        dbSetup.launch();
    }

    @Test
    public void shouldFindParameterValueByIdApp() {
//        assertThat(parameterValueRepository.findParameterValueByIdApp(1L)).hasSize(2).extracting("code").contains("app.maxuser", "server.name");
    }
//
//    @Test
//    public void shouldFindParameterValueByIdVersionTracking() {
//        assertThat(parameterValueRepository.findParameterValueByIdVersionTracking(1L)).hasSize(2).extracting("code").contains("app.maxuser", "server.name");
//    }

}
