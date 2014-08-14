package com.ninjamind.confman.repository;

import com.ninja_squad.dbsetup.DbSetup;
import com.ninja_squad.dbsetup.destination.DataSourceDestination;
import com.ninja_squad.dbsetup.operation.Operation;
import com.ninjamind.confman.config.PersistenceConfig;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
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
    public void setUp() {
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

    @Test(expected = NullPointerException.class)
    public void shouldThrowNullPointerExceptionWhenFindParameterValueByIdAppWithNoPaginatedList() {
        parameterValueRepository.findParameterValue(null, new ParameterValueSearchBuilder());
    }

    @Test(expected = NullPointerException.class)
    public void shouldThrowNullPointerExceptionWhenFindParameterValueByIdAppWithNoCriteria() {
        parameterValueRepository.findParameterValue(new PaginatedList(), null);
    }

    @Test
    public void shouldFindParameterValueWhenCriteriaIsValid() {
        assertThat(parameterValueRepository.findParameterValue(
                new PaginatedList(),
                new ParameterValueSearchBuilder()
                        .setCode(".nam")
                        .setIdApplication(1L)
                        .setIdEnvironment(1L)
                        .setIdInstance(1L)
                        .setIdParameter(2L)
                        .setIdTrackingVersion(1L)))
                .hasSize(1)
                .extracting("code")
                .contains("server.name");
    }

    @Test
    public void shouldFindAllParameterValueWhenNoCriteriaIsDefined() {
        assertThat(parameterValueRepository.findParameterValue(
                new PaginatedList(),
                new ParameterValueSearchBuilder()))
                .hasSize(9);
    }

    @Test
    public void shouldFindParameterValuePaginated() {
        PaginatedList<ParameterValue> list = parameterValueRepository.findParameterValue(
                new PaginatedList().setCurrentPage(2).setNbElementByPage(3),
                new ParameterValueSearchBuilder().setCode("pagin"));

        assertThat(list).hasSize(3).extracting("code").containsExactly("pagination4","pagination5","pagination6");
        assertThat(list.getCompleteSize()).isEqualTo(7);
    }

    @Test
    public void shouldFindNoParameterValueIfPageIsTooHigh() {
        PaginatedList<ParameterValue> list = parameterValueRepository.findParameterValue(
                new PaginatedList().setCurrentPage(8).setNbElementByPage(3),
                new ParameterValueSearchBuilder().setCode("pagin"));

        assertThat(list).isEmpty();
        assertThat(list.getCompleteSize()).isEqualTo(7);
    }

}
