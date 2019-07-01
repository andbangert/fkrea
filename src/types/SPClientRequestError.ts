export class SPClientRequestError extends Error {
    private spError: SP.ClientRequestFailedEventArgs;
    private errorType: string;
    constructor(spError: SP.ClientRequestFailedEventArgs, message?: string | undefined) {
        super(message);
        this.spError = spError;
        this.errorType = spError.get_errorTypeName();
    }

    get errorTypeName(): string {
        return this.errorType;
    }

    get error() {
        return this.spError;
    }
}
