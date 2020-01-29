/// <reference path="../typings/tsd.d.ts" />
class PositronRetrospectiveAppController implements ng.IController {
    public $onInit() { }
    public isChrome: boolean;

    constructor(
        $rootScope: ng.IRootScopeService,
        $state: ng.ui.IStateService,
        pipSystemInfo: pip.services.ISystemInfo,
    ) {
        "ngInject";

        this.isChrome = pipSystemInfo.browserName == 'chrome' && pipSystemInfo.os == 'windows';
    }
}

angular
    .module('iqsPositronRetrospectiveApp', [
        'iqsPositronRetrospective.Config',
        'iqsPositronRetrospective.Templates',
        'iqsOrganizations.Service',
        'iqsRetrospective'
    ])
    .controller('iqsPositronRetrospectiveAppController', PositronRetrospectiveAppController);


