declare var google: any;

import { IDevicesObjectsDialogService, ISearchDialogService } from '../../../common';

interface IRetrospectiveMapPanelBindings {
    [key: string]: any;
}

const RetrospectiveMapPanelBindings: IRetrospectiveMapPanelBindings = {
    type: '<iqsType'
}

class RetrospectiveMapPanelChanges implements ng.IOnChangesObject, IRetrospectiveMapPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    type: ng.IChangesObject<string>;
}

class RetrospectiveMapPanelController implements ng.IController {

    public $onInit() { }

    private strokeColor: string = '#F8E81C';
    private strokeWeight: number = 3;
    private intervalPromise: any;
    private intervalPromise1: any;
    private startPause: boolean = true;
    public initialized: boolean = false;
    public organizationCenter: any[];
    private zoomLevel: number;
    public searchEmptyMessage: string = null;

    public type: string;
    public markerOptions: any = {};
    public zoneOptions: any = {
        fill: 'fill',
        stroke: 'stroke',
        radius: 'distance',
        zIndex: 9
    };
    public polylineOptions: any = {
        stroke: 'stroke',
        icons: [{
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 2
            },
            repeat: '50px'
        }],
        static: 'static',
        options: 'options',
        zIndex: 10
    };
    public dottracesOptions: any = {};
    public searchCriteria: string;
    public debouncedSelect: Function;
    public date: string;
    public class: string = 'iqs-black iqs-big';
    public play: boolean = true;
    public toState: string;
    public accessConfig: any;
    public searchSelectedIndex: number = 0;
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private $scope: ng.IScope,
        private $timeout: ng.ITimeoutService,
        private $interval: ng.IIntervalService,
        private $rootScope: ng.IRootScopeService,
        private $location: ng.ILocationService,
        private iqsMapViewModel: iqs.shell.IMapViewModel,
        // private iqsObjectPositionsViewModel: IObjectPositionsViewModel,
        private iqsObjectRoutesViewModel: iqs.shell.IObjectRoutesViewModel,
        private iqsObjectConfigs: iqs.shell.IObjectConfigsService,
        private iqsSearchDialog: ISearchDialogService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsSmartZoom: iqs.shell.ISmartZoomService,
        private pipTranslate: pip.services.ITranslateService,
        private iqsDevicesObjectsDialog: IDevicesObjectsDialogService,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private pipToasts: pip.controls.IToastService,
        private iqsEventRulesViewModel: iqs.shell.IEventRulesViewModel,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        const runWhenReady = () => {
            this.iqsStatesViewModel.isSort = false;
            this.accessConfig = this.iqsAccessConfig.getStateConfigure().access;
            this.iqsMapConfig.addEvent('click', () => {
                this.iqsStatesViewModel.unfocusAll();
                $scope.$apply();
            });

            this.iqsMapConfig.addEvent('drag', () => {
                this.iqsStatesViewModel.unfocusAll(true);
                $scope.$apply();
            });

            this.iqsStatesViewModel.type = this.type;
            this.toState = 'app';
            if (this.$location.search()['retro_date']) {
                this.date = this.$location.search()['retro_date'];
            } else {
                let s = this.iqsStatesViewModel.getToTime();
                this.date = s ? moment(s).toISOString() : new Date().toISOString();
            }
            this.iqsSmartZoom.activate();
            this.iqsMapConfig.watchDragAndZoom();
            this.iqsMapConfig.addCenterChangeCallback((center) => {
                this.iqsMapViewModel.setCenter(center);
            });

            this.iqsStatesViewModel.initStates(this.date, 'all', (data) => {
                this.initialized = true;
                if (this.type !== 'monitoring') {
                    let obj_id = this.$location.search()['focus_object_id'];
                    let obj = this.iqsObjectsViewModel.getObjectById(obj_id);

                    if (obj) {
                        $timeout(() => {
                            if (this.type !== 'monitoring') {
                                this.iqsStatesViewModel.focusByObjectId(obj.id, true, false, true);
                                this.map.configs.zoom = 14;
                            }
                        }, 1000);
                    }
                }
            });

            $timeout(() => {
                this.startPause = false;

            }, 100);

            if (this.type === 'monitoring') {
                this.intervalPromise = this.$interval(() => {
                    if (!this.initialized) return;
                    this.iqsStatesViewModel.updateStates(this.date);
                }, 10000);
            }

            this.map.init(() => {
                this.organizationCenter = [angular.extend(this.iqsMapConfig.organizationCenter, { id: 0 })];
            });

            this.markerOptions.popup = {
                options: {
                    setPosition: true,
                    events: {
                        onDetails: (options, model) => {
                            options.updatePosition = false;
                            options.pixelOffset.height = -80;
                            model.details = true;
                            this.iqsStatesViewModel.unfocusAll(true);
                        },
                        onLess: (options, model) => {
                            options.updatePosition = true;
                            options.pixelOffset.height = 35;
                            model.details = false;
                        },
                        onAddObjects: (model) => {
                            let device = model.device;
                            if (!device) return;

                            this.iqsDevicesObjectsDialog.show({}, (data) => {
                                device.object_id = data.id;
                                this.iqsDevicesViewModel.updateDevice(device, (item) => {
                                }, (err) => {
                                    this.pipToasts.showNotification(this.pipTranslate.translate('DEVICE_NOT_ASSIGNED') + ' ' + data.name,
                                        ['ok'], () => { }, () => { }, '');
                                })
                            });
                        }
                    },
                    updatePosition: true
                },
                offset: {
                    width: -165,
                    height: this.type === 'retro' ? 108 : 35
                },
                className: this.type === 'retro' ? 'pip-map-info-top-margin' : '',
                templateUrl: 'retrospective/map/MapPopup.html',
            };

            this.zoneOptions.popup = {
                options: {
                    setPosition: true,
                    isZoneConfigure: this.accessConfig.zonePopapConfigure,
                    events: {
                        onConfigureZone: (zone) => {
                            // this.$state.go('settings_system.zones', { zone_id: zone.id, state: 'edit' });
                            window.location.href = window.location.origin + `/config_zones/#/zones?zone_id=${zone.id}&state=edit`;
                        }
                    }
                },
                offset: {
                    width: -165,
                    height: this.type === 'retro' ? 108 : 35
                },
                className: this.type === 'retro' ? 'pip-map-info-top-margin' : '',
                templateUrl: 'retrospective/map/ZonePopup.html',
            };

            this.zoneOptions.events = {
                'click': (eventObj: any) => {
                    this.iqsStatesViewModel.unfocusAll();
                    $scope.$apply();
                },
                'dblclick': (eventObj: any) => {
                    if (eventObj.model) {
                        this.setEventRules(eventObj.model);
                    }
                },
                'rightclick': (eventObj: any) => {
                    if (eventObj.model) {
                        this.setEventRules(eventObj.model);
                    }
                }
            }

            this.markerOptions.events = {
                'click': (eventObj: any) => {
                    if (eventObj.model) {
                        this.debouncedSelect(eventObj.model);
                    }
                },
                'dblclick': (eventObj: any) => {
                    /*if (eventObj.model) {
                        eventObj.model.details = false;
                        if (this.type === 'monitoring') {
                            eventObj.model.toTime = null;
                        } else {
                            eventObj.model.toTime = this.date;
                        }
                    }*/
                },
                'rightclick': function (eventObj: any) {
                    if (eventObj.model) {
                        eventObj.model.details = false;
                        if (this.type === 'monitoring') {
                            eventObj.model.toTime = null;
                        } else {
                            eventObj.model.toTime = this.date;
                        }
                    }
                    if (eventObj.gModel
                        && eventObj.gModel.map
                        && typeof eventObj.gModel.map.panBy === 'function'
                        && !this.mapCtrl.popup.isEnabled) {
                        const w = eventObj.gModel.map.bounds.northeast.longitude - eventObj.gModel.map.bounds.southwest.longitude
                        const pw = (eventObj.position.longitude - eventObj.gModel.map.bounds.southwest.longitude) / w
                        const h = eventObj.gModel.map.bounds.northeast.latitude - eventObj.gModel.map.bounds.southwest.latitude
                        const ph = (eventObj.position.latitude - eventObj.gModel.map.bounds.southwest.latitude) / h
                        if (pw > 0.65) {
                            eventObj.gModel.map.panBy(80, 0);
                        }
                        if (ph < 0.5) {
                            eventObj.gModel.map.panBy(0, 80);
                        }
                    }
                }
            };

            this.dottracesOptions.popup = {
                offset: {
                    width: -165,
                    height: this.type === 'retro' ? 108 : 35
                },
                options: {
                    setPosition: true
                },
                className: this.type === 'retro' ? 'pip-map-info-top-margin' : '',
                templateUrl: 'retrospective/map/DotTracesPopup.html'
            }

            this.polylineOptions.popup = {
                options: {
                    setPosition: true
                },
                className: 'pip-map-info-top-margin',
                offset: {
                    width: -165,
                    height: 108
                },
                templateUrl: 'retrospective/map/RoutePopup.html',
            };

            this.debouncedSelect = _.debounce((model) => { this.select(model) }, 50);
            this.zoomLevel = this.map.configs ? this.map.configs.zoom : null;
            this.iqsMapConfig.addZoomChangeCallback((zoom) => {
                this.zoomLevel = zoom;
            });
        };

        if (iqsLoading.isDone) { runWhenReady(); }

        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    public $onDestroy() {
        this.$interval.cancel(this.intervalPromise);
        this.$interval.cancel(this.intervalPromise1);
        this.iqsMapConfig.removeEvent('click');
        this.iqsMapConfig.unwatchDragAndZoom();
        this.iqsSmartZoom.deactivate();
        this.iqsObjectRoutesViewModel.unfocus();
        this.iqsStatesViewModel.unfocusAll();
        this.iqsStatesViewModel.unselectAll();
        for (const f of this.cf) { f(); }
    }

    private setEventRules(zoneModel) {
        zoneModel.includeEventRules = this.iqsEventRulesViewModel.getEventRulesWithIncludeZone(zoneModel.id);
        zoneModel.excludeEventRules = this.iqsEventRulesViewModel.getEventRulesWithExcludeZone(zoneModel.id);
    }

    // time component start
    public changeDate(date) {
        this.date = date;
        this.iqsStatesViewModel.updateStates(this.date);
    }

    public changePlay(play: boolean) {
        this.play = play;
    }

    public get state(): string {
        return this.startPause ? 'progress' : this.map.state;
    }

    public get map() {
        return this.iqsMapViewModel.map;
    }

    public get isAdmin(): boolean {
        return true;
    }

    public goToGlobalMapSettings() {
        // this.$state.go('settings_system.global_settings.location');
        window.location.href = window.location.origin + `/config_organization/#/organization/location`;
    }

    public get objects() {
        return this.iqsMapViewModel.objects;
    }

    public get states(): iqs.shell.ObjectState[] {
        return this.iqsStatesViewModel.allStates;
    }

    public get dottraces() {
        return this.iqsObjectRoutesViewModel.objectPositions;
    }

    public get dottracePoints() {
        return this.iqsObjectRoutesViewModel.objectPoints;
    }

    public get polygons(): any[] {
        return this.iqsMapViewModel.polygons;
    }

    public get lines(): any[] {
        return this.iqsMapViewModel.lines;
    }

    public get circles(): any[] {
        return this.iqsMapViewModel.circles;
    }

    public getActiveCount(type) {
        return this.iqsStatesViewModel.getActiveByCategory(type);
    }

    public getInactiveCount(type) {
        return this.iqsStatesViewModel.getInactiveByCategory(type);
    }

    public onZoomIn() {
        this.zoomLevel++;
        this.iqsMapViewModel.setZoom(this.zoomLevel);
    }

    public onZoomOut() {
        this.zoomLevel--;
        this.iqsMapViewModel.setZoom(this.zoomLevel);
    }

    public onSearchObjectsClick() {
        let fCollection: string[] = [];
        _.each(this.states, (item: iqs.shell.ObjectState) => {
            if (item.options && item.options.visible === false) {
                fCollection.push(item.object_id);
            }
        });
        this.iqsSearchDialog.show({ dataType: iqs.shell.SearchObjectTypes.ControlObject, retro: this.type === 'retro', excludeCollection: fCollection }, (callbackData: any) => {
            if (callbackData.item) {
                this.searchSelectedIndex = 0;
                this.iqsStatesViewModel.selectByDeviceIds([callbackData.item.device_id]);
                this.searchCriteria = callbackData.item.name || callbackData.item.device_id;
                this.searchEmptyMessage = null;
            }
        });
    }

    private getObjectsIntoZone(zone: iqs.shell.Zone): string[] {
        let result: string[] = [];

        _.each(this.iqsStatesViewModel.states, (item: iqs.shell.ObjectState) => {
            if (item.object_id && item.zones && item.zones.length > 0) {
                let index = _.findIndex(item.zones, (obj: any) => {
                    return obj.zone_id == zone.id;
                });

                if (index > -1) {
                    result.push(item.object_id)
                }
            }
        });

        return result;
    }

    public onSearchZonesClick() {
        this.iqsSearchDialog.show({ dataType: iqs.shell.SearchObjectTypes.Zone, retro: this.type === 'retro' }, (callbackData: any) => {
            if (callbackData.item) {
                this.searchSelectedIndex = 0;
                if (callbackData.item.type === 'object') {
                    this.iqsStatesViewModel.selectByObjectIds(this.getAllObjectIds(callbackData.item.included));
                } else {
                    const pos = callbackData.item.center;
                    this.iqsStatesViewModel.unfocusAll();
                    this.iqsStatesViewModel.unselectAll();
                    this.$rootScope.$broadcast(iqs.shell.UPDATE_MAP_MODEL_CENTER, {
                        latitude: pos.coordinates ? pos.coordinates[1] : pos.latitude,
                        longitude: pos.coordinates ? pos.coordinates[0] : pos.longitude
                    });

                    this.iqsStatesViewModel.selectByObjectIds(this.getObjectsIntoZone(callbackData.item));
                }
                this.searchEmptyMessage = 'SEARCH_OBJECT_IN_ZONE_EMPTY';
                this.searchCriteria = callbackData.item.name || callbackData.item.id;
            }
        });
    }

    public onSignalClick() {
        this.$rootScope.$broadcast('iqsSendSignalEvent');
    }

    private getAllObjectIds(included) {
        let objIds: string[] = [];

        _.each(included, (inc) => {
            if (inc.object_ids) {
                objIds = _.union(objIds, inc.object_ids);
            } else {
                objIds.push(inc.id);
            }
        });

        return objIds;
    }

    public onSearchGroupsClick() {
        this.iqsSearchDialog.show({ dataType: iqs.shell.SearchObjectTypes.ObjectGroup, retro: this.type === 'retro' }, (callbackData: any) => {
            if (callbackData.item) {
                this.searchSelectedIndex = 0;
                this.iqsStatesViewModel.unfocusAll();
                this.iqsStatesViewModel.unselectAll();
                this.iqsStatesViewModel.selectByObjectIds(callbackData.item.object_ids);
                this.searchCriteria = callbackData.item.name || callbackData.item.id;
                this.searchEmptyMessage = null;
            }
        });
    }

    public onSearchLocationsClick() {
        this.iqsSearchDialog.show({
            retro: this.type === 'retro',
            dataType: iqs.shell.SearchObjectTypes.Location, defaultVariants: [{
                item: {
                    name: this.pipTranslate.translate('ORGANIZATION_CENTER'),
                    pos: {
                        coordinates: [this.iqsMapConfig.organizationCenter.longitude, this.iqsMapConfig.organizationCenter.latitude]
                    }
                }
            }]
        }, (callbackData: any) => {
            if (callbackData.item) {
                const pos = callbackData.item.pos;

                this.iqsStatesViewModel.unfocusAll();
                this.$rootScope.$broadcast(iqs.shell.UPDATE_MAP_MODEL_CENTER, { latitude: pos.coordinates[1], longitude: pos.coordinates[0] });
                // this.iqsMapViewModel.setCenter({ latitude: pos.coordinates[1], longitude: pos.coordinates[0] });
            }
        });
    }

    private select(item) {
        let index = _.findIndex(this.iqsStatesViewModel.states, (state: iqs.shell.ObjectState) => {
            return state.device_id == item.device_id;
        })
        if (index == -1) {
            this.searchCriteria = '';
        }
        let centered: boolean;
        if (item.device_id) {
            if (this.zoomLevel < this.iqsSmartZoom.smartZoomLevels.large.min) {
                this.iqsMapViewModel.setZoom(this.iqsSmartZoom.smartZoomLevels.large.min);
                centered = true;
            }
            this.iqsStatesViewModel.focusByDeviceId(item.device_id, centered);
            // this.iqsStatesViewModel.focusByObjectId(item.object_id, centered);

            this.$scope.$apply();
        }
    }

    private onEditClick(model) {
        if (model.object_id) {
            // this.$state.go('settings_system.objects', { object_id: model.object_id, edit: 'edit' });
            window.location.href = window.location.origin + `/config_objects/#/objects?object_id=${model.object_id}&edit=edit`;
        } else {
            // this.$state.go('settings_system.devices', { device_id: model.device_id, edit: 'edit' });
            window.location.href = window.location.origin + `/config_devices/#/devices?device_id=${model.device_id}&edit=edit`;
        }
    }

    private onInfoClick(model) {
        if (model.object_id) {
            // this.$state.go('settings_system.objects', { object_id: model.object_id });
            window.location.href = window.location.origin + `/config_objects/#/objects?object_id=${model.object_id}`;
        } else {
            // this.$state.go('settings_system.devices', { device_id: model.device_id });
            window.location.href = window.location.origin + `/config_devices/#/devices?device_id=${model.device_id}`;
        }
    }

    private onAddObjects(model) {
        this.iqsDevicesObjectsDialog.show({}, (data) => {
            model.object_id = data.id;
            this.iqsDevicesViewModel.updateDevice(model, (item) => {
                this.iqsStatesViewModel.updateStates(this.date);
            }, (err) => { });
        }, () => { })
    }

    public goToObjects(type: string, objectId: string, edit: string = 'data') {
        const localType = this.pipTranslate.translate(type);

        this.$location.search('type', localType);
        this.iqsObjectConfigs.type = localType;
        if (objectId) {
            this.$location.search('object_id', objectId);
            this.iqsObjectConfigs.id = objectId;
        }
        this.$state.go(this.toState + '.objects', { type: localType, object_id: objectId, edit: edit });
    }

    public goToEvents() {
        this.$state.go(this.toState + '.events');
    }
}

(() => {
    angular
        .module('iqsRetrospectiveMapPanel', [
            'iqsDevicesObjectsDialog',
            'iqsOrganizationTimePanel',
            'iqsRoutePositionPanel',
            'iqsSearchDialog',
            'iqsObjectRoutes.ViewModel',
            'iqsObjectConfigs',
            'iqsMapConfig',
            'iqsSmartZoom',
            'iqsDevices.ViewModel',
            'iqsObjects.ViewModel',
            'iqsEventRules.ViewModel',
            'iqsStates.ViewModel',
        ])
        .component('iqsRetrospectiveMapPanel', {
            bindings: RetrospectiveMapPanelBindings,
            templateUrl: 'retrospective/map/panels/MapPanel.html',
            controller: RetrospectiveMapPanelController,
            controllerAs: '$ctrl'
        })
})();
