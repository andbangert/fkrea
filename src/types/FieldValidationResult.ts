export class FieldValidationResult extends SPClientForms.ClientValidation.ValidationResult {
    public errorMessage: string = '';
    public validationError: boolean = false;
    constructor(hasError: boolean, errorMsg: string) {
        super(hasError, errorMsg);
    }
}
