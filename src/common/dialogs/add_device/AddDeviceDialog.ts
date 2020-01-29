export class AddDeviceDialogController implements ng.IController {        
    
    public $onInit() {}

    public theme;
    public defaultCollection: string[];
    public searchedCollection: string[];
    public device_id: string;
    public search: string;
    public devices: iqs.shell.SearchResult[];
    public typeCollection: iqs.shell.TypeCollection;
    public showFreeDevice: boolean;

    constructor(
        private $mdDialog: angular.material.IDialogService,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        params: any
    ) {
        "ngInject";
        
        iqsTypeCollectionsService.init();
        this.typeCollection = iqsTypeCollectionsService.getDeviceType();

        this.theme = $rootScope[pip.themes.ThemeRootVar];
        this.device_id = params.device_id;
        this.search = '';
        this.showFreeDevice = !!params.showFree;

        let objectType: string = iqs.shell.SearchObjectTypes.Device;
        if (this.iqsGlobalSearch.isInit) {
            this.searchedCollection = params.searchCollection || this.iqsGlobalSearch.getSpecialSearchCollection(objectType);
        } else {
            this.searchedCollection = params.searchCollection || this.iqsGlobalSearch.init();
        }
        this.defaultCollection = params.searchCollection || this.iqsGlobalSearch.getDefaultCollection(objectType);

        this.onSearchResult(this.search);
    }

    public initSelectedItems() {

    }

    public onSearchResult(query: string) {
        this.search = query;
        this.iqsGlobalSearch.searchObjectsParallel(query, iqs.shell.SearchObjectTypes.Device,
            (data) => {
                this.devices = data;
                this.devices = _.sortBy(this.devices, (item: any) => {
                    return item.item.label ? item.item.label.toLocaleLowerCase() : item.item.udi;
                });
                if (this.showFreeDevice) {
                    this.devices = _.filter(this.devices, (item: any) => {
                        return !item.item.object_id;
                    });
                }
            });

    }

    public onCanselSearch() {
        this.search = '';
        this.onSearchResult(this.search);
    }

    public selectItem(index: number) {
        this.device_id = this.devices[index].id;
        //this.selected = this.devices[index].item;
    }

    public change() {
        this.$mdDialog.hide(this.device_id);
    }
    public cancel() {
        this.$mdDialog.cancel();
    }

    public config() {
        // this.$state.go('settings_system.devices', {});
        window.location.href = window.location.origin + `/config_devices/#/devices`;
         this.$mdDialog.hide();
    }


}

const translateConfig = function (pipTranslateProvider) {
    // Set translation strings for the module
    pipTranslateProvider.translations('en', {
        'DEVICE_DIALOG_TITLE': 'Attach tracker',
        'ADD_DEVICES_EMPTY': 'Free trackers were not found',
        ADD_DEVICE_DIALOG_ASSINE: 'Attach'
    });

    pipTranslateProvider.translations('ru', {
        'DEVICE_DIALOG_TITLE': 'Прикрепить трекер',
        'ADD_DEVICES_EMPTY': 'Свободные трекеры не найдены',
        ADD_DEVICE_DIALOG_ASSINE: 'Прикрепить'
    });
}
angular
    .module('iqsAddDeviceDialog', [
        'ngMaterial'
    ])
    .config(translateConfig)
    .controller('iqsAddDeviceDialogController', AddDeviceDialogController);

import "./AddDeviceDialogService"