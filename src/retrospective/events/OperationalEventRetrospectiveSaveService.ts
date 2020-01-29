import { IOperationalEventRetrospectiveSaveService } from './IOperationalEventRetrospectiveSaveService';

class OperationalEventRetrospectiveSaveService implements IOperationalEventRetrospectiveSaveService {
    private _timeShift: any;
    private _eventId: string;
    private _currState: string;
    private _search: string;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
    ) {
        "ngInject";

    }

    public set timeShift(timeShift: any) {
        this._timeShift = timeShift;
    }

    public get timeShift(): any {
        return this._timeShift;
    }

    public set eventId(eventId: string) {
        this._eventId = eventId;
    }

    public get eventId(): string {
        return this._eventId;
    }

    public set currState(currState: string) {
        this._currState = currState;
    }

    public get currState(): string {
        return this._currState;
    }
    
    public set search(search: string) {
        this._search = search;
    }

    public get search(): string {
        return this._search;
    }

}

{
    angular.module('iqsRetrospective.EventSaveService', [])
        .service('iqsOperationalEventRetrospectiveSaveService', OperationalEventRetrospectiveSaveService);

}