export interface IAddDeviceDialogService {
    show(params,successCallback?: (data?: any) => void, cancelCallback?: () => void): any;
}