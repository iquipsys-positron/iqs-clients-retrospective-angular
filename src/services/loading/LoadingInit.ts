function initPopulating(
    iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
    iqsStatesViewModel: iqs.shell.IStatesViewModel,
    iqsOperationalEventsViewModel: iqs.shell.IOperationalEventsViewModel,
    iqsEventRulesViewModel: iqs.shell.IEventRulesViewModel,
    iqsObjectRoutesViewModel: iqs.shell.IObjectRoutesViewModel,
    iqsDataProfilesViewModel: iqs.shell.IDataProfilesViewModel,
    iqsIncidentsViewModel: iqs.shell.IIncidentsViewModel,
    iqsMapViewModel: iqs.shell.IMapViewModel,
    iqsMapConfig: iqs.shell.IMapService,
    pipIdentity: pip.services.IIdentityService,
    iqsLoading: iqs.shell.ILoadingService,
    iqsOrganization: iqs.shell.IOrganizationService
) {
    iqsLoading.push('data', [
        iqsCurrentObjectStatesViewModel.clean.bind(iqsCurrentObjectStatesViewModel),
        iqsStatesViewModel.clean.bind(iqsStatesViewModel),
        iqsOperationalEventsViewModel.clean.bind(iqsOperationalEventsViewModel),
        iqsEventRulesViewModel.clean.bind(iqsEventRulesViewModel),
        iqsObjectRoutesViewModel.cleanUp.bind(iqsObjectRoutesViewModel),
        iqsDataProfilesViewModel.clean.bind(iqsDataProfilesViewModel),
        iqsMapConfig.clean.bind(iqsMapConfig)
    ], async.parallel, [
            (callback) => {
                iqsStatesViewModel.cleanUpAllStates();
                iqsStatesViewModel.initStates(new Date().toISOString(), 'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsOperationalEventsViewModel.filter = null;
                iqsOperationalEventsViewModel.isSort = true;
                iqsOperationalEventsViewModel.selectAllow = false;
                iqsOperationalEventsViewModel.reload(
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsEventRulesViewModel.filter = null;
                iqsEventRulesViewModel.isSort = true;
                iqsEventRulesViewModel.reload(
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsDataProfilesViewModel.initDataProfiles(
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    }
                )
            },
            (callback) => {
                iqsMapConfig.orgId = iqsOrganization.orgId;
                iqsMapViewModel.initMap(
                    () => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsIncidentsViewModel.readIncidentsCount(
                    () => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    }
                );
            }
        ]);
    if (pipIdentity.identity && pipIdentity.identity.id) {
        iqsLoading.start();
    }
}


let m: any;
const requires = [
    'iqsCurrentObjectStates.ViewModel',
    'iqsStates.ViewModel',
    'iqsOperationalEvents.ViewModel',
    'iqsEventRules.ViewModel',
    'iqsObjectRoutes.ViewModel',
    'iqsDataProfiles.ViewModel',
    'iqsIncidents.ViewModel',
    'iqsMap.ViewModel',
    'iqsMapConfig',
    'iqsOrganizations.Service',
];

try {
    m = angular.module('iqsLoading');
    m.requires.push(...requires);
    m.run(initPopulating);
} catch (err) { }