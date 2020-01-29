import { cloneDeep, keyBy } from 'lodash';

class CurrentStateObjectDetailsPanelController implements ng.IController {         
    public state: any;
    public details: any;
    public popupOptions: any;
    public retro: Date | string;
    private intervalPromise: any;
    public isPopup: boolean;
    public paramTypes: Object;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private iqsDataProfilesViewModel: iqs.shell.IDataProfilesViewModel,
        private $scope: ng.IScope,
        private iqsLoading: iqs.shell.ILoadingService,
        private iqsOrganization: iqs.shell.IOrganizationService

    ) {
        "ngInject";
        $element.addClass('iqs-object-state-details-panel');

        if (!this.retro) {
            this.stateUpdating();
        }

        const runWhenReady = () => {
            if (this.iqsDataProfilesViewModel.state !== iqs.shell.States.Data) return;
            const pt = this.iqsDataProfilesViewModel.dataProfile.param_types;
            if (pt && Array.isArray(pt)) this.paramTypes = keyBy(pt.filter(it => { return it.id > 100; }), 'id');
        }

        if (this.iqsLoading.isDone) runWhenReady();
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    public $onChanges(changes) {
        if (changes.state && changes.state.currentValue) {
            this.updateState(changes.state.currentValue.device_id);
        }
    }

    public $onInit() {
        this.isPopup = !!this.popupOptions;

        if (this.popupOptions) {
            this.popupOptions.updatePosition = !this.details;
            if (this.popupOptions.updatePosition) {
                this.popupOptions.pixelOffset.height = 35;
            }
        }
    }

    public $onDestroy() {
        this.details = false;
        this.$interval.cancel(this.intervalPromise);
    }

    public get dataProfileState() {
        return this.iqsDataProfilesViewModel.state;
    }

    public isActive() {
        return this.iqsStatesViewModel.isActive(this.state);
    }

    private trimUdi(udi: string): string {
        if (udi.length < 17) {

            return udi;
        }
        let first: string = udi.slice(0, 8);
        let last: string = udi.slice(-8, udi.length);
        
        return first + '...' + last;
    }

    private getBeacons(): string {
        if (!this.state || !this.state.beacons || this.state.beacons.length == 0) return null;

        let str: string = '';
        for (let i = 0; i < this.state.beacons.length - 1; i++) {
            str += this.trimUdi(this.state.beacons[i]) + ', ';
        }
        str += this.trimUdi(this.state.beacons[this.state.beacons.length - 1]);

        return str;
    }

    private updateState(device_id) {
        this.state = this.iqsStatesViewModel.getStateByDeviceId(device_id);
        let date = this.retro ? moment(this.retro).valueOf() : Date.now();

        if (this.state.object) this.state['permAssignObject'] = this.iqsObjectsViewModel.getObjectById(this.state.object.perm_assign_id);
        this.state['localeFreezed'] = this.iqsStatesViewModel.isActive(this.state) && this.state.freezed ? this.state.freezed * 1000 : null;
        this.state['localeImmobile'] = this.iqsStatesViewModel.isActive(this.state) && this.state.immobile ? this.state.immobile * 1000 : null;
        this.state['localeOnline'] = this.iqsStatesViewModel.isActive(this.state) ? this.state.online * 1000 : null;
        this.state['localeOfline'] = this.state['localeOnline'] ? null : new Date(date).getTime() - new Date(this.state.time).getTime();
        this.state['paramsCustom'] = this.state['params'].filter(it => { return it.id > 5; });
        if (this.iqsOrganization.orgId === 'b6becc564c2a4175aa7f4533713572f9') {
            this.state['paramsCustom'] = cloneDeep(this.state['paramsCustom']).map(it => {
                if (it.id === 9) {
                    it.val = ((it.val - 8000) / 10000).toFixed(2) + ' бар';
                }
                return it;
            });
        }

        this.state.beaconsString = this.getBeacons();
    }

    private stateUpdating() {
        this.intervalPromise = this.$interval(() => {
            this.updateState(this.state.device_id);
        }, 10000);
    }
}

(() => {
    angular
        .module('iqsCurrentStateObjectDetailsPanel', [
            'iqsStates.ViewModel',
            'iqsObjects.ViewModel',
            'iqsDataProfiles.ViewModel',
        ])
        .component('iqsCurrentStateObjectDetailsPanel', {
            bindings: {
                state: '<iqsState',
                details: '=iqsDetails',
                popupOptions: '=?iqsPopupOptions',
                retro: '<?iqsRetro',
                objectStatus: '=iqsObjectStatus'
            },
            templateUrl: 'retrospective/map/panels/CurrentStateObjectDetailsPanel.html',
            controller: CurrentStateObjectDetailsPanelController,
            controllerAs: '$ctrl'
        })
})();
