class ZoneEventRulesPanelController implements ng.IController {          
    public zone: any;
    public includeEventRules: any[];
    public excludeEventRules: any[];

    constructor(
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private iqsEventRulesViewModel: iqs.shell.IEventRulesViewModel,
        private $rootScope: any,
        private $scope: ng.IScope
    ) {
        
    }

    public $onChanges(changes) {
        if (changes.zone) {
            this.setEventRules(changes.zone.currentValue);
        }
    }

    private setEventRules(zoneModel) {
        this.includeEventRules = this.iqsEventRulesViewModel.getEventRulesWithIncludeZone(zoneModel.id);
        this.excludeEventRules = this.iqsEventRulesViewModel.getEventRulesWithExcludeZone(zoneModel.id);
    }

    public $onInit() {
        
    }

    public $onDestroy() {
        
    }
}

(() => {
    angular
        .module('iqsZoneEventRulesPanel', [
            'iqsEventRules.ViewModel'
        ])
        .component('iqsZoneEventRulesPanel', {
            bindings: {
                zone: '<?iqsZone'
            },
            templateUrl: 'retrospective/map/panels/ZoneRulesPanel.html',
            controller: ZoneEventRulesPanelController,
            controllerAs: '$ctrl'
        })
})();
