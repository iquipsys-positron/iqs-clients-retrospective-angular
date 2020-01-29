import { IAddDeviceDialogService, IAddEqupmentDialogService } from '../../../common';
import { IStatusService } from '../../../services';

interface IRetrospectiveObjectsInformationPanelBindings {
    [key: string]: any;
    object: any;
    type: any;
    editable: any;
}

const RetrospectiveObjectsInformationPanelBindings: IRetrospectiveObjectsInformationPanelBindings = {
    object: '<iqsObject',
    type: '<iqsType',
    editable: '<iqsEditable'
}

class RetrospectiveObjectsInformationPanelChanges implements ng.IOnChangesObject, IRetrospectiveObjectsInformationPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    object: ng.IChangesObject<any>;
    type: ng.IChangesObject<string>;
    editable: ng.IChangesObject<boolean>;
}

class RetrospectiveObjectsInformationPanelController implements ng.IController {

    public $onInit() { }

    public object: iqs.shell.ObjectState;
    public type: string;
    public categoryCollection: iqs.shell.TypeCollection;
    public typeCollection: iqs.shell.TypeCollection;
    public deviceCollection: iqs.shell.TypeCollection;
    public editable: boolean;
    public objectGroups: iqs.shell.ObjectGroup[];

    private promise: any;
    public accessConfig: any;
    public device: iqs.shell.Device;
    public isActive: boolean;
    public car: iqs.shell.ControlObject;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        private $location: ng.ILocationService,
        private $state: ng.ui.IStateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private pipTranslate: pip.services.ITranslateService,
        private iqsAddDeviceDialog: IAddDeviceDialogService,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
        public iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        public iqsStatusService: IStatusService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsAddEqupmentDialog: IAddEqupmentDialogService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";


        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            iqsTypeCollectionsService.init();
            this.typeCollection = iqsTypeCollectionsService.getObjectType();
            this.categoryCollection = iqsTypeCollectionsService.getObjectCategory();
            this.deviceCollection = iqsTypeCollectionsService.getDeviceType();
            this.editable = this.editable || false;

            this.updateObject();
            if (this.type != 'retro') {
                this.promise = $interval(() => {
                    this.updateObject();
                }, 10000);
            }
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }

        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    public $onDestroy() {
        if(this.promise) this.$interval.cancel(this.promise);
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: RetrospectiveObjectsInformationPanelChanges): void {
        this.updateObject();
    }

    private setDevice(): void {
        this.device = this.object.object && this.object.object.device_id ? this.iqsDevicesViewModel.getDeviceById(this.object.object.device_id) :
            this.iqsDevicesViewModel.getDeviceById(this.object.device_id);
    }

    private setCar(): void {
        this.car = this.object.object ? this.iqsObjectsViewModel.getObjectById(this.object.object.perm_assign_id) : null;
    }

    public updateObject() {
        this.isActive = this.iqsStatesViewModel.isActive(this.object);
        this.object['localeFreezed'] = this.iqsStatesViewModel.isActive && this.object.freezed ? this.object.freezed * 1000 : null;
        this.object['localeOnline'] = this.iqsStatesViewModel.isActive ? this.object.online * 1000 : null;
        this.object['localeOfline'] = this.object['localeOnline'] ? null : new Date().getTime() - moment(this.object.time).valueOf();

        this.objectGroups = [];
        // todo if object is empty

        this.setDevice();

        if (!this.object.object) return;

        _.each(this.object.object.group_ids, (id: string) => {
            let group: iqs.shell.ObjectGroup = this.iqsObjectGroupsViewModel.getGroupById(id);
            if (group) {
                this.objectGroups.push(group);
            }
        });
        this.objectGroups = _.sortBy(this.objectGroups, (g: iqs.shell.ObjectGroup) => {
            return g.name ? g.name.toLocaleLowerCase() : '';
        });

        this.setCar();
    }

    public changeDevice(id: string) {
        this.iqsAddDeviceDialog.show({ device_id: id, showFree: true }, (id: string) => {
            this.object.device_id = id;
            this.object.object.device_id = id;
            this.iqsObjectsViewModel.updateObject(this.object.object, () => {
                this.iqsDevicesViewModel.read();
                this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('data');
                this.setDevice();
                let device: iqs.shell.Device = this.iqsDevicesViewModel.getDeviceById(id);
                let name = device.label || device.udi;
                if (device && device.status != iqs.shell.DeviceStatus.Active) {
                    this.pipConfirmationDialog.show(
                        {
                            event: null,
                            title: name ? this.pipTranslate.translate('DEVICE_ENABLE_CONFIRMATION_TITLE') + ' "' + name + '"?' : this.pipTranslate.translate('DEVICE_ENABLE_CONFIRMATION_TITLE') + '?',
                            ok: 'DEVICE_ENABLE',
                            cancel: 'CANCEL'
                        },
                        () => {
                            device.status = iqs.shell.DeviceStatus.Active;
                            device.object_id = this.object.id;
                            this.iqsDevicesViewModel.updateDevice(
                                device,
                                (item) => { },
                                (err) => { })
                        });
                }

            });
        })
    }

    public deviceClick() {
        if (!this.accessConfig.goToDevice) return;

        this.$location.search('device_id', this.object.device.id);
        // this.$state.go('settings_system.devices', { device_id: this.object.device.id });
        window.location.href = window.location.origin + `/config_devices/#/devices?device_id=${this.object.device.id}`;
    }

    public deleteClick() {
        let id: string = this.object.device_id;
        this.object.device_id = null;
        this.object.object.device_id = null;
        this.iqsObjectsViewModel.updateObject(this.object.object, () => {
            this.iqsDevicesViewModel.read();
            this.setDevice();
            this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('data');
        });
    }

    public carClick() {
        this.$location.search('object_id', this.object.object.perm_assign_id);
        // this.$state.go('settings_system.objects', { object_id: this.object.object.perm_assign_id });
        window.location.href = window.location.origin + `/config_objects/#/objects?object_id=${this.object.object.perm_assign_id}`;
    }

    public deleteCarClick() {
        if (this.object.object) {
            this.object.object.perm_assign_id = null;
            this.setCar();
            this.iqsObjectsViewModel.updateObject(this.object.object);
        }
    }

    public changeCar(id: string) {
        this.iqsAddEqupmentDialog.show({
            equipment_id: id
        }, (id: string) => {
            this.object.object.perm_assign_id = id;
            this.setCar();
            this.iqsObjectsViewModel.updateObject(this.object.object);
        })
    }

}

(() => {

    const translateConfig = function (pipTranslateProvider) {
        // Set translation strings for the module
        pipTranslateProvider.translations('en', {

            "INFO_ADD_TRACKER": 'Attached tracker',
            "INFO_CHANGE_DEVICE": 'Change',
            "INFO_DETAILS": "Details",
            "INFO_EMPTY_DEVICE": "This object has no attached tracker",
            "INFO_ADD_DEVICE": 'Attach tracker',
            'INFO_DELETE_DEVICE': 'Detach',

            "INFO_TITLE_ADD_CAR": 'Permanently assigned to',
            "INFO_CHANGE_CAR": 'Change',
            "INFO_EMPTY_CAR": 'Assignment is not set',
            "INFO_ADD_CAR": 'Assign equipment or asset',
            INFO_DELETE_CAR: 'Unassign',
            INFO_CONNECT: 'Online',
            INFO_INCONNECT: 'Offline',

            "INFO_TITLE_ADD_OBJECT": 'Attached object',
            "INFO_CHANGE_OBJECT": 'Change',
            "INFO_EMPTY_OBJECT": 'There is no attached object',
            "INFO_ADD_OBJECT": 'Attach object',
            INFO_DELETE_OBJECT: 'Detach',
            DEVICE_ENABLE_CONFIRMATION_TITLE: 'The tracker is inactive. To activate the tracker',
            DEVICE_ENABLE: 'Activate'
        });

        pipTranslateProvider.translations('ru', {

            "INFO_ADD_TRACKER": 'Прикреплен трекер',
            "INFO_CHANGE_DEVICE": 'Редактировать',
            "INFO_DETAILS": "Подробнее",
            "INFO_EMPTY_DEVICE": "У данного объекта нет прикрепленного трекера",
            "INFO_ADD_DEVICE": 'Прикрепить трекер',
            'INFO_DELETE_DEVICE': 'Отсоединить',

            "INFO_TITLE_ADD_CAR": 'Постоянно назначен',
            "INFO_CHANGE_CAR": 'Редактировать',
            "INFO_EMPTY_CAR": 'Назначение отсутствует',
            "INFO_ADD_CAR": 'Назначить машину или механизм',
            INFO_DELETE_CAR: 'Отсоединить',
            INFO_CONNECT: 'На связи',
            INFO_INCONNECT: 'Отключен',

            "INFO_TITLE_ADD_OBJECT": 'Прикреплен объект',
            "INFO_CHANGE_OBJECT": 'Редактировать',
            "INFO_EMPTY_OBJECT": 'Нет прикрепленного объекта',
            "INFO_ADD_OBJECT": 'Прикрепить объект',
            INFO_DELETE_OBJECT: 'Отсоединить',
            DEVICE_ENABLE_CONFIRMATION_TITLE: 'Трекер отключен, включить',
            DEVICE_ENABLE: 'Включить'
        });
    }

    angular
        .module('iqsRetrospectiveObjectsInformationPanel', [
            'iqsAddDeviceDialog',
            'iqsAddEqupmentDialog',
            'iqsStatus',
            'iqsDevices.ViewModel',
            'iqsObjects.ViewModel',
            'iqsTypeCollections.Service',
            'iqsCurrentObjectStates.ViewModel',
            'iqsObjectGroups.ViewModel'
        ])
        .component('iqsRetrospectiveObjectsInformationPanel', {
            bindings: RetrospectiveObjectsInformationPanelBindings,
            templateUrl: 'retrospective/objects/panels/ObjectsInformationPanel.html',
            controller: RetrospectiveObjectsInformationPanelController,
            controllerAs: '$ctrl'
        })
        .config(translateConfig)

})();
