interface ISearchResultsPanelBindings {
    [key: string]: any;

    transition: any;
    search: any;
    results: any;
    selected: any;
    _selectedIndex: any;
    onSearch: any;
    emptyMessage: any;
}

const SearchResultsPanelBindings: ISearchResultsPanelBindings = {
    transition: '=?iqsTransation',
    search: '=iqsSearch',
    results: '=iqsResults',
    selected: '=?iqsSeletced',
    _selectedIndex: '=?iqsSelectedIndex',
    onSearch: '&?iqsOnSearch',
    emptyMessage: '=?iqsEmptyMessage'
}

class SearchResultsPanelChanges implements ng.IOnChangesObject, ISearchResultsPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    transition: ng.IChangesObject<any>;
    search: ng.IChangesObject<any>;
    results: ng.IChangesObject<any>;
    selected: ng.IChangesObject<any>;
    _selectedIndex: ng.IChangesObject<any>;
    onSearch: ng.IChangesObject<any>;
    emptyMessage: ng.IChangesObject<string>;
}

class SearchResultsPanelController implements ng.IController {        //implements ISearchResultsPanelBindings 
    
    public $onInit() {}

    public transition: pip.services.Transaction;
    public results: any;
    public selected: any;
    public _selectedIndex: number = 0;
    public onSearch: any;

    private _showResults: boolean = false;
    public search: string;
    public defaultCollection: string[];
    public searchedCollection: string[];
    private emptyMessage: string;

    private objectType: string = iqs.shell.SearchObjectTypes.Device;

    constructor(
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $rootScope: any,
        private $scope: ng.IScope,
        public pipMedia: pip.layouts.IMediaService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        private pipTranslate: pip.services.ITranslateService,
        private pipToasts: pip.controls.IToastService
    ) {
        this.search = '';
        this.searchedCollection = _.union(this.iqsGlobalSearch.getSpecialSearchCollection(this.objectType), this.iqsGlobalSearch.getSpecialSearchCollection(iqs.shell.SearchObjectTypes.ControlObject));
        this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(iqs.shell.SearchObjectTypes.ControlObject);

        this.$scope.$watch('$ctrl.search', (newSearch) => {
            if (!newSearch) {
                this.search = '';
                this._showResults = false;
            } else{
                if (this.searchResults.length > 0) {
                    this._showResults = true;
                } else {
                    this.clearAll();
                    this.showNoResultsToats();
                }
            }
        });
    }

    private clearAll() {
        this.iqsStatesViewModel.cancelFiltered();
        this.search = '';
        this._showResults = false;
    }

    public get isFocused(): boolean {
        return this.iqsStatesViewModel.states[this._selectedIndex] ?
            this.iqsStatesViewModel.isFocused === this.iqsStatesViewModel.states[this._selectedIndex].device_id : false;
    }

    public onSearchResult(query: string) {
        if (!query) {
            this.clearAll();

            return;
        }

        this.iqsGlobalSearch.searchObjectsParallel(query, this.objectType,
            (data) => {
                switch (data.length) {
                    case 0: {
                        this.showNoResultsToats();
                        this.clearAll();
                        break;
                    }

                    default: {
                        this.iqsStatesViewModel.selectByDeviceIds(this.getIds(data));
                        if (this.searchResults.length > 0) {
                            this._showResults = true;
                        } else {
                            this.clearAll();
                            this.showNoResultsToats();
                        }
                    }
                }
            }
        );

        if (this.onSearch) {
            this.onSearch();
        }
    }

    private showNoResultsToats() {
        let message = this.emptyMessage ? this.emptyMessage : 'SEARCH_NO_RESULTS_ON_MAP';
        this.pipToasts.showNotification(this.pipTranslate.translate(message),
            ['ok'], () => { }, () => { }, '');
    }

    private getIds(data): string[] {
        let ids = [];
        _.each(data, (searchObj) => {
            ids.push(searchObj.id);
        });

        return ids;
    }

    public get selectedIndex() {
        return Math.min(this._selectedIndex, this.iqsStatesViewModel.states.length - 1);
    }

    public set selectedIndex(index) {
        this._selectedIndex = index;
    }

    public focusCurrent() {
        if (!this.isFocused && this.iqsStatesViewModel.states[this._selectedIndex]) {
            this.iqsStatesViewModel.focusByDeviceId(this.iqsStatesViewModel.states[this._selectedIndex].device_id, true, false, true);
            // this.iqsStatesViewModel.focusByObjectId(this.iqsStatesViewModel.states[this._selectedIndex].object_id, true, false, true);
        }
    }

    public onCancelClick() {
        this.search = '';
        this.onSearchResult('');
    }

    public onPrevClick() {
        if (this._selectedIndex > this.searchResults.length - 1) this._selectedIndex = this.searchResults.length - 1;

        if (this._selectedIndex > 0) {
            this._selectedIndex--;
            this.iqsStatesViewModel.panToObjectByDeviceId(this.iqsStatesViewModel.states[this._selectedIndex].device_id);
        }
    }

    public onNextClick() {
        if (this._selectedIndex < this.searchResults.length - 1) {
            this._selectedIndex++;
            this.iqsStatesViewModel.panToObjectByDeviceId(this.iqsStatesViewModel.states[this._selectedIndex].device_id);
        }
    }

    public get searchResults(): any {
        return this.iqsStatesViewModel.states;
    }

    public get showResults() {
        return this._showResults && this.iqsStatesViewModel.isSelected;
    }
}

(() => {
    angular
        .module('iqsSearchResultsPanel', [
            'iqsGlobalSearch',
            'iqsStates.ViewModel',
        ])
        .component('iqsSearchResultsPanel', {
            bindings: SearchResultsPanelBindings,
            templateUrl: 'retrospective/map/panels/SearchResultsPanel.html',
            controller: SearchResultsPanelController,
            controllerAs: '$ctrl'
        })
})();
