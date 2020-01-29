class ZoomButtonsPanelController implements ng.IController {          
    
    public $onInit() {}
    
    public zoomIn: Function;
    public zoomOut: Function;

    constructor(
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private $rootScope: any,
        private iqsMapConfig: iqs.shell.IMapService
    ) {
        "ngInject";
        
    }

    public onZoomIn() {
        if (this.zoomIn)  this.zoomIn();
    }

    public onZoomOut() {
        if (this.zoomIn)  this.zoomOut();
    }

}

(() => {
    angular
        .module('iqsZoomButtonsPanel', [
            'iqsMapConfig'
        ])
        .component('iqsZoomButtonsPanel', {
            bindings: {
                zoomIn: '&?iqsZoomIn',
                zoomOut: '&?iqsZoomOut'
            },
            templateUrl: 'retrospective/map/panels/ZoomButtonsPanel.html',
            controller: ZoomButtonsPanelController,
            controllerAs: '$ctrl'
        })
})();
