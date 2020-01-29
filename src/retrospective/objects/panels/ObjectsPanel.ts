import { IStatusService } from '../../../services';

interface IRetrospectiveObjectsPanelBindings {
    [key: string]: any;

    type: any;
}

const RetrospectiveObjectsPanelBindings: IRetrospectiveObjectsPanelBindings = {
    type: '<iqsType'
}

class RetrospectiveObjectsPanelChanges implements ng.IOnChangesObject, IRetrospectiveObjectsPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    type: ng.IChangesObject<string>;
}

class RetrospectiveObjectStatues {
    title: string;
    id: string;
}
class RetrospectiveObjectTabs {
    title: string;
    id: number;
}

class RetrospectiveObjectsPanelController implements ng.IController {
    public $onInit() { }
    public statuses: RetrospectiveObjectStatues[] = [
        {
            title: 'PEOPLE',
            id: iqs.shell.ObjectCategory.People
        }, {
            title: 'EQUIPMENT',
            id: iqs.shell.ObjectCategory.Equipment
        }, {
            title: 'ASSETS',
            id: iqs.shell.ObjectCategory.Asset
        }];
    public sections: RetrospectiveObjectTabs[] = [
        {
            title: 'INFORMATION',
            id: 0
        }, {
            title: 'LOCATION',
            id: 1
        }, {
            title: 'EVENTS',
            id: 2
        }, {
            title: 'OBJECT_TAB_STATUS',
            id: 3
        }
    ];

    public details: boolean;
    public section: number;
    public search: string;
    public expand: boolean = true;
    public date: string = new Date().toISOString();

    public defaultCollection: string[];
    public searchedCollection: string[];

    public type: string;
    public play: boolean = false;
    public class = "iqs-flex-retro iqs-objects";
    private currState: string;
    private promise: any;
    public accessConfig: any;
    private cf: Function[] = [];

    constructor(
        private $location: ng.ILocationService,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        //private iqsObjectsViewModel: IObjectsViewModel,
        private $timeout: ng.ITimeoutService,
        private $state: ng.ui.IStateService,
        private iqsObjectConfigs: iqs.shell.IObjectConfigsService,
        private pipMedia: pip.layouts.IMediaService,
        private $rootScope: ng.IRootScopeService,
        $scope: ng.IScope,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        public iqsStatusService: IStatusService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private $interval: ng.IIntervalService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (!this.pipMedia('gt-sm')) {

            } else {
                this.details = false;
                this.$location.search('details', 'main');
                this.$rootScope.$broadcast('iqsChangeNav');
            }
        }));

        this.cf.push($rootScope.$on('iqsChangeNavPage', () => {
            if (!this.pipMedia('gt-sm')) {
                this.details = $location.search().details == 'details' ? true : false;
            }
        }));

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.iqsStatesViewModel.isSort = true;
            this.config();
            let objectType: string = iqs.shell.SearchObjectTypes.ControlObject;

            this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(objectType);
            this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(objectType);

            this.date = this.$location.search()['retro_date'] || this.iqsStatesViewModel.getToTime().toISOString();
            this.iqsStatesViewModel.type = this.type;
            this.currState = iqs.shell.States.Progress;
            this.iqsStatesViewModel.initStates(
                this.date, 'all',
                (data: iqs.shell.ObjectState[]) => {
                    this.onSearchResult(this.search);
                }
            );

            if (!this.pipMedia('gt-sm')) {
                this.details = $location.search().details == 'details' ? true : false;
            } else {
                this.details = false;
                this.$location.search('details', 'main');
            }

            if (this.type == 'monitoring') {
                this.promise = $interval(() => {
                    this.updateStates();
                }, 10000);
            }
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }

        $rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this));
    }

    public $onDestroy() {
        if(this.promise) this.$interval.cancel(this.promise);
        for (const f of this.cf) { f(); }
    }

    public changePlay(play: boolean) {
        this.play = play;
    }

    public changeDate(date: string) {
        this.date = date;
        if (this.search) {
            this.onSearchResult(this.search);
        } else {
            this.selectButtons(null);
        }
    }

    public getObjectName(id: string) {
        return this.iqsObjectsViewModel.getObjectById(id) ?
            this.iqsObjectsViewModel.getObjectById(id).name : id;
    }

    public objectStatus(object): string {
        return this.iqsStatesViewModel.statusObject(object);
    }

    public onSearchResult(query: string) {
        this.search = query;
        this.iqsGlobalSearch.searchObjectsParallel(query, iqs.shell.SearchObjectTypes.ControlObject,
            (data) => {
                this.selectButtons(data);
            });
    }

    public onCanselSearch() {
        this.search = '';
        this.onSearchResult('');
    }

    public detailsClick() {
        this.details = true;
        this.$location.search('details', 'details');
        this.$rootScope.$broadcast('iqsChangeNav');
    }

    public config() {
        if (this.iqsObjectConfigs.type) {
            this.$location.search('type', this.iqsObjectConfigs.type);
        }

        if (this.iqsObjectConfigs.section) {
            this.$location.search('section', this.iqsObjectConfigs.section);
        }

        this.search = this.iqsObjectConfigs.type || this.$location.search()['type'] || null;
        this.section = this.iqsObjectConfigs.section || this.$location.search()['section'] || this.sections[0].id;
        this.iqsObjectConfigs.type = this.search;
        this.iqsObjectConfigs.section = this.section;
    }

    public get collection() {
        return this.iqsStatesViewModel.states;
    }

    public state() {
        return this.currState ? this.currState : this.iqsStatesViewModel.state;
    }

    public get selectedIndex(): number {
        return this.state() != iqs.shell.States.Add ? this.iqsStatesViewModel.selectedIndex : -1;
    }

    public set selectedIndex(value: number) {

    }

    public changeExpand(index) {
        if (this.selectedIndex == index)
            this.expand = !this.expand;
        else {
            this.selectItem(index);
        }
    }

    public selectItem(index?: number) {
        if (this.state() != iqs.shell.States.Data) { return };

        if (this.iqsStatesViewModel.states.length > 0 && this.collection[index]) {
            this.iqsObjectConfigs.id = this.collection[index].object_id;
            this.$location.search('curr_object_id', this.collection[index].object_id);
        }
        if (index !== undefined && index !== null) {
            this.iqsStatesViewModel.selectedIndex = index;
        } else {
            this.iqsStatesViewModel.selectedIndex = 0;
        }
        if (!this.pipMedia('gt-sm')) {
            this.detailsClick();
        }
    }

    public editClick() {
        // this.$state.go(
        //     'settings_system.objects',
        //     {
        //         object_id: this.iqsStatesViewModel.states[this.iqsStatesViewModel.selectedIndex].object_id,
        //         edit: 'edit',
        //         details: 'edit'
        //     });
        window.location.href = window.location.origin + `/config_objects/#/bojects?object_id=${this.iqsStatesViewModel.states[this.iqsStatesViewModel.selectedIndex].object_id}&edit=edit&details=edit`;
    }

    public selectButtons(data) {
        this.expand = true;
        this.$location.search('type', this.search);

        // show empty if search is empty: !this.search
        let showUnknown: boolean = !this.search;

        if (this.type == 'monitoring') {

            if (data) {
                this.iqsStatesViewModel.filterStatesObjectsSearch(data, showUnknown);
            }
            this.iqsStatesViewModel.selectIndex();
            this.currState = null;

        } else {
            if (data) {
                this.iqsStatesViewModel.initStates(
                    this.date, 'all',
                    () => {
                        this.iqsStatesViewModel.filterStatesObjectsSearch(data, showUnknown);
                        this.iqsStatesViewModel.selectIndex();
                        this.currState = null;
                    },
                    () => {
                        // todo error
                        this.currState = null;
                    });
            } else {
                this.iqsStatesViewModel.initStates(
                    this.date, 'all',
                    () => {
                        this.currState = null;
                        this.iqsStatesViewModel.selectIndex();
                    },
                    () => {
                        // todo error
                        this.currState = null;
                    });
                this.iqsStatesViewModel.selectIndex();
            }
        }
    }

    public selectSection(id: number) {
        this.section = id;
        this.$location.search('section', this.section);
        this.iqsObjectConfigs.section = this.section;
    }

    public singleContent() {
        this.details = !this.details;
    }

    public updateStates() {
        this.iqsStatesViewModel.updateStates(this.date);
    }

    public deviceClick(object) {
        if (object && object.device) {

            this.$location.search('device_id', object.device.id);
        }
        // this.$state.go('settings_system.devices', { device_id: object && object.device ? object.device.id : null });
        let url = `/config_devices/#/devices`;
        if (object && object.device) {
            url += '?device_id=' + object.device.id;
        }
        window.location.href = window.location.origin + url;
    }
}

(() => {
    angular
        .module('iqsRetrospectiveObjectsPanel', [
            'iqsObjectConfigs',
            'iqsStatus',
            'iqsOperationalEventPanel',
            'iqsRetrospectiveObjectsInformationPanel',
            'iqsRetrospectiveObjectsMapPanel',
            'iqsGlobalSearch',
            'iqsObjects.ViewModel',
        ])
        .component('iqsRetrospectiveObjectsPanel', {
            bindings: RetrospectiveObjectsPanelBindings,
            templateUrl: 'retrospective/objects/panels/ObjectsPanel.html',
            controller: RetrospectiveObjectsPanelController,
            controllerAs: '$ctrl'
        })

})();