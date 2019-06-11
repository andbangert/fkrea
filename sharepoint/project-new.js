/// <reference path="../src/index.d.ts" />
var ProjectForms;
(function (ProjectForms) {
    var ProjectForm = /** @class */ (function () {
        function ProjectForm() {
            this.fieldsToRender = [
                'BuildObj',
                'Title',
                'Designer',
                'DesignerContracts',
                'Contractor',
                'Contracts',
                'TypeOfJobs',
            ];
        }
        ProjectForm.prototype.renderContent = function (context) {
            var fields = context.ListSchema.Field;
            var resultHtml = '<span id="part1">';
            resultHtml += '<table width="100%" class="ms-formtitle" border="0" cellspacing="0" cellpadding="0"><tr><td>';
            resultHtml += '<span class="form-title">Карточка проекта</span>';
            resultHtml += '</td></tr></table>';
            resultHtml += '<table width="100%" class="ms-formtable" border="0" cellspacing="0" cellpadding="0">';
            this.fieldsToRender.forEach(function (fname) {
                var field = fields.find(function (f) { return f.Name === fname; });
                if (field) {
                    resultHtml += RenderFieldRow(context, field);
                }
            });
            resultHtml += '</table>';
            // Render hidden Fields 
            var pathField = fields.find(function (f) { return f.Name === 'Path'; });
            if (pathField) {
                resultHtml += RenderHidden(context, pathField);
            }
            resultHtml += this.renderFooter();
            return resultHtml;
        };
        ProjectForm.prototype.renderFooter = function () {
            return '<div id="_toolBarSection"></div></span>';
        };
        return ProjectForm;
    }());
    function RenderHidden(context, field) {
        if (!context || !context.RenderFieldByName) {
            return '';
        }
        return context.RenderFieldByName(context, field.Name);
    }
    function RenderFieldRow(context, field) {
        if (!context || !context.RenderFieldByName) {
            return '';
        }
        var addStyle = '';
        if (field.Name === 'DesignerContracts' || field.Name === 'Contracts') {
            addStyle = 'add-field-label';
        }
        var resultHtml = '<tr>';
        resultHtml += '<td width="113" class="ms-formlabel ' + addStyle + '" nowrap="true" valign="top"><h3 class="ms-standardheader"><nobr>';
        resultHtml += field.Title;
        if (field.Required && context.FieldControlModes[field.Name] != SPClientTemplates.ClientControlMode.DisplayForm) {
            resultHtml += String.format('<span title="{0}" class="ms-accentText"> *</span>', Strings.STS.L_RequiredField_Tooltip);
        }
        resultHtml += '</nobr></h3></td>';
        resultHtml += String.format('<td width="350" class="ms-formbody" valign="top">{0}</td>', context.RenderFieldByName(context, field.Name));
        resultHtml += '</tr>';
        return resultHtml;
    }
    function renderPathField(ctx) {
        if (ctx == null) {
            return '';
        }
        var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
        if (formCtx == null || formCtx.fieldSchema == null) {
            return '';
        }
        var _inputElt;
        var eleId = formCtx.fieldName + '_' + formCtx.fieldSchema.Id + '_$TextField';
        // Default control parameters
        function InitControl() {
            _inputElt = document.getElementById(eleId);
            if (_inputElt != null) {
                AddEvtHandler(_inputElt, "onchange", OnValueChanged);
            }
        }
        function OnValueChanged() {
            if (_inputElt != null) {
                formCtx.updateControlValue(formCtx.fieldName, _inputElt.value);
            }
        }
        formCtx.registerInitCallback(formCtx.fieldName, InitControl);
        formCtx.registerGetValueCallback(formCtx.fieldName, function () {
            return _inputElt == null ? '' : _inputElt.value;
        });
        // End default initializations
        var html = "<input type=\"hidden\" id='" + eleId + "' />";
        return html;
    }
    function renderTitleField(rCtx) {
        if (rCtx == null)
            return '';
        var _myData = SPClientTemplates.Utility.GetFormContextForCurrentField(rCtx);
        if (_myData == null || _myData.fieldSchema == null)
            return '';
        var _value = _myData.fieldValue != null ? _myData.fieldValue : '';
        var _inputId = _myData.fieldName + '_' + _myData.fieldSchema.Id + '_$TextField';
        var _inputElt;
        if (_myData.fieldSchema.Required) {
            var validators = new SPClientForms.ClientValidation.ValidatorSet();
            validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
            _myData.registerClientValidator(_myData.fieldName, validators);
        }
        _myData.registerInitCallback(_myData.fieldName, InitControl);
        _myData.registerValidationErrorCallback(_myData.fieldName, function (errorResult) {
            SPFormControl_AppendValidationErrorMessage(_inputId, errorResult);
        });
        _myData.registerGetValueCallback(_myData.fieldName, function () {
            return _inputElt == null ? '' : _inputElt.value;
        });
        _myData.updateControlValue(_myData.fieldName, _value);
        var _styleStr = _myData.fieldSchema.IMEMode == '' ? '' : 'style="ime-mode : ' + STSHtmlEncode(_myData.fieldSchema.IMEMode) + '"';
        var result = '<span dir="' + STSHtmlEncode(_myData.fieldSchema.Direction) + '">';
        result += '<input type="text" value="' + STSHtmlEncode(_value) + '"';
        result += 'id="' + STSHtmlEncode(_inputId) + '" title="' + STSHtmlEncode(_myData.fieldSchema.Title);
        if (Boolean(Strings.STS.L_RequiredField_Text)) {
            if (_myData.fieldSchema.Required) {
                result += ' ' + STSHtmlEncode(Strings.STS.L_RequiredField_Text);
            }
        }
        result += '" ' + _styleStr;
        result += ' class="ms-long ms-spellcheck-true" />';
        result += '<br /></span>';
        return result;
        function InitControl() {
            _inputElt = document.getElementById(_inputId);
            if (_inputElt != null) {
                AddEvtHandler(_inputElt, "onchange", OnValueChanged);
            }
        }
        function OnValueChanged() {
            if (_inputElt != null) {
                _myData.updateControlValue(_myData.fieldName, _inputElt.value);
                if (_myData.controlMode === SPClientTemplates.ClientControlMode.NewForm) {
                    _myData.updateControlValue('Path', _inputElt.value);
                }
            }
        }
    }
    function renderSelectField(ctx) {
        if (ctx == null) {
            return '';
        }
        var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
        if (formCtx == null || formCtx.fieldSchema == null) {
            return '';
        }
        var eleId = '';
        var _inputElt;
        var fieldRootElementId = formCtx.fieldName + "_" + formCtx.fieldSchema.Id + "_$" + formCtx.fieldSchema.FieldType + "Field_fld";
        if (formCtx.fieldSchema.FieldType === 'LookupMulti') {
            eleId = formCtx.fieldName + '_' + formCtx.fieldSchema.Id + '_MultiLookup';
        }
        else if (formCtx.fieldSchema.FieldType === 'Lookup') {
            eleId = formCtx.fieldName + '_' + formCtx.fieldSchema.Id + '_$LookupField';
        }
        // // Default control parameters
        // function InitControl() {
        //     _inputElt = document.getElementById(eleId) as HTMLInputElement;
        //     if (_inputElt != null) {
        //         AddEvtHandler(_inputElt, "onchange", OnValueChanged);
        //     }
        // }
        // function OnValueChanged() {
        //     if (_inputElt != null) {
        //         formCtx.updateControlValue(formCtx.fieldName, _inputElt.value);
        //     }
        // }
        // if (formCtx.fieldSchema.Required) {
        //     var validators = new SPClientForms.ClientValidation.ValidatorSet();
        //     validators.RegisterValidator(new SPClientForms.ClientValidation.RequiredValidator());
        //     formCtx.registerClientValidator(formCtx.fieldName, validators);
        // }
        // ///formCtx.registerInitCallback(formCtx.fieldName, InitControl);
        // formCtx.registerFocusCallback(formCtx.fieldName, function () { });
        // formCtx.registerGetValueCallback(formCtx.fieldName, function () {
        //     return _inputElt == null ? '' : _inputElt.value;
        // });
        // End default initializations
        var html = "<input type=\"hidden\" id='" + eleId + "' />";
        html += "<div id=" + fieldRootElementId + "></div>";
        return html;
    }
    function renderTextFieldAsLookup(ctx) {
        if (ctx == null) {
            return '';
        }
        var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
        if (formCtx == null || formCtx.fieldSchema == null) {
            return '';
        }
        var eleId = formCtx.fieldName + '_' + formCtx.fieldSchema.Id + '_$TextField';
        var fieldRootElementId = formCtx.fieldName + "_" + formCtx.fieldSchema.Id + "_$" + formCtx.fieldSchema.FieldType + "Field_fld";
        var html = "<input type=\"hidden\" id='" + eleId + "' />";
        html += "<div id=" + fieldRootElementId + "></div>";
        return html;
    }
    function renderTextFieldAsLookup_InView(ctx) {
        if (ctx == null) {
            return '';
        }
        return '';
    }
    function init() {
        var form = new ProjectForm();
        var options = {
            Templates: {
                Item: function (ctx) {
                    var context = ctx;
                    if (context) {
                        return form.renderContent(context);
                    }
                    return '';
                },
                Fields: {
                    'BuildObj': {
                        NewForm: renderSelectField,
                        EditForm: renderSelectField
                    },
                    'TypeOfJobs': {
                        NewForm: renderSelectField,
                        EditForm: renderSelectField
                    },
                    'Designer': {
                        NewForm: renderSelectField,
                        EditForm: renderSelectField
                    },
                    'Contractor': {
                        NewForm: renderSelectField,
                        EditForm: renderSelectField
                    },
                    'Contracts': {
                        NewForm: renderTextFieldAsLookup,
                        EditForm: renderTextFieldAsLookup,
                        View: renderTextFieldAsLookup_InView
                    },
                    'DesignerContracts': {
                        NewForm: renderTextFieldAsLookup,
                        EditForm: renderTextFieldAsLookup,
                        View: renderTextFieldAsLookup_InView
                    },
                    'Path': {
                        NewForm: renderPathField,
                        EditForm: renderPathField
                    },
                    'Title': {
                        NewForm: renderTitleField
                    }
                }
            },
            OnPostRender: function (ctx) {
                var ctxForm = ctx;
                if (!fkrea.projectCardSettings) {
                    console.error('settings must be sets first!');
                    return;
                }
                fkrea.InitProjectNewForm(ctxForm, fkrea.projectCardSettings);
            },
            OnPreRender: function (ctx) {
                // Add Styles to Page head
                var head = document.getElementsByTagName('head')[0];
                var urlcss = SPClientTemplates.Utility.ReplaceUrlTokens('~siteCollection/Style Library/fkrea/project/app.css');
                var appcss = document.createElement('link');
                appcss.type = 'text/css';
                appcss.rel = 'stylesheet';
                appcss.href = urlcss;
                head.appendChild(appcss);
            }
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(options);
    }
    ProjectForms.init = init;
})(ProjectForms || (ProjectForms = {}));
SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
    var init = ProjectForms.init;
    RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens('~siteCollection/SiteAssets/fkrea/docs/js/project-new.js'), init);
    init();
});
//~siteCollection/SiteAssets/fkrea/docs/js/project-new.js | ~siteCollection/SiteAssets/fkrea/docs/js/chunk-vendors.js | ~siteCollection/SiteAssets/fkrea/docs/js/app.js
// Test Server
// fkrea.projectCardSettings = {
//     contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616',
//     contractorListId: '{0d2d2424-dee8-48d4-8bc2-a70a88b31956}', // Main site
//     designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
//     docListId: '{4d45929a-e485-44e7-9d45-69a3f7fe711c}', // Main site
//     siteUrl: '/',
//     scanLib: '{f966ae2c-75f9-4e64-b37a-c5c2b9e408c8}',
//     executiveLib: '{8CE27767-7234-43C9-A78E-C81F3B042B49}',
//   };
// Prod
//  fkrea.projectCardSettings = {
//     contractContentTypeId: '0x01',
// contractorListId: '{0d2d2424-dee8-48d4-8bc2-a70a88b31956}', // Main site
// designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
// docListId: '{4d45929a-e485-44e7-9d45-69a3f7fe711c}', // Main site
// siteUrl: '/',
// scanLib: '{f966ae2c-75f9-4e64-b37a-c5c2b9e408c8}',
// };
//~siteCollection/SitePages/js/project/chunk-vendors.js | ~siteCollection/SitePages/js/project/app.js | ~siteCollection/SitePages/js/project/project-new.js
//~siteCollection/SitePages/js/project/chunk-vendors.js | ~siteCollection/SitePages/js/project/app.js | ~siteCollection/SitePages/js/project/project-new-config.js | ~siteCollection/SitePages/js/project/project-new.js
