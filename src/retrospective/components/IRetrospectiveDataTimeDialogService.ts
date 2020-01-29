export interface IRetrospectiveDataTimeDialogService {
    show(params: any, successCallback?: (date: Date) => void, cancelCallback?: () => void): any;
}