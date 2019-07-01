import {
    SPClientRequestError,
    SelectOptions,
    SelectLookupValue,
    ProjectCardSettings,
} from './types/index';

import CamlBuilder from 'camljs';
import * as utils from './utilities';
import * as constants from './constants';
import { ProjectFormHelper, ProjectResult } from '@/projectFormHelper';

import proj = constants.Fkrea.Fields;
import { FormFieldText, FormFieldLookup, FormField } from './types/index';


export class ProjectFieldInitializer {
    private static setFieldValue(field: FormField, item: SP.ListItem, convert: boolean) {
        const value = item.get_item(field.name);
        if (!value || value === '') {
            return;
        }
        if (field.type === 'Lookup' || field.type === 'LookupMulti') {
            const lf = field as FormFieldLookup;
            if (lf.allowMulti) {
                const colllv = convert
                    ? ProjectFieldInitializer.parseMultiLookupValue(value)
                    : ProjectFieldInitializer.ConvertToSelectLookup(value as SP.FieldLookupValue[]);
                if (colllv && colllv.length > 0) {
                    lf.value = colllv;
                }
            } else {
                const lv = value as SP.FieldLookupValue[];
                if (lv && lv.length > 0) {
                    lf.value = {
                        LookupId: lv[0].get_lookupId(),
                        LookupValue: lv[0].get_lookupValue(),
                    } as SelectLookupValue;
                }
            }
        } else if (convert) {
            // try {
            const lf = field as FormFieldLookup;
            if (lf) {
                if (lf.allowMulti) {
                    const values = ProjectFieldInitializer.parseMultiLookupValue(value);
                    lf.value = values.map((v) => {
                        return { ...v } as SelectLookupValue;
                    });
                }
                // TODO: Single lookup;
            }
            // } catch { }
        } else {
            const tf = field as FormFieldText;
            tf.value = value + ''; // As String
        }
    }

    private static ConvertToSelectLookup(value: SP.FieldLookupValue[]) {
        if (!value) {
            return [];
        }
        return value.map((lv) => {
            return {
                LookupId: lv.get_lookupId(),
                LookupValue: lv.get_lookupValue(),
            } as SelectLookupValue;
        });
    }

    private static parseMultiLookupValue(valueStr: string): SelectLookupValue[] {
        if (valueStr === null || valueStr === '') {
            return [];
        }
        const valueArray = [];
        const valueLength = valueStr.length;
        let beginning = 0;
        let end = 0;
        let bEscapeCharactersFound = false;

        while (end < valueLength) {
            if (valueStr[end] === ';') {
                if (++end >= valueLength) {
                    break;
                }
                if (valueStr[end] === '#') {
                    if (end - 1 > beginning) {
                        let foundValue = valueStr.substr(beginning, end - beginning - 1);

                        if (bEscapeCharactersFound) {
                            foundValue = foundValue.replace(/;;/g, ';');
                        }
                        valueArray.push(foundValue);
                        bEscapeCharactersFound = false;
                    }
                    beginning = ++end;
                    continue;
                } else if (valueStr[end] === ';') {
                    end++;
                    bEscapeCharactersFound = true;
                    continue;
                } else {
                    return [];
                }
            }
            end++;
        }
        if (end > beginning) {
            let lastValue = valueStr.substr(beginning, end - beginning);
            if (bEscapeCharactersFound) {
                lastValue = lastValue.replace(/;;/g, ';');
            }
            valueArray.push(lastValue);
        }
        const resultArray = [];
        const resultLength = valueArray.length;

        for (let resultCount = 0; resultCount < resultLength; resultCount++) {
            resultArray.push({
                LookupId: Number(valueArray[resultCount++]),
                LookupValue: valueArray[resultCount],
            });
        }
        return resultArray;
    }

    public static async InitializeFields(
        payload: {
            siteUrl: string,
            listId: string,
            itemId: number,
        },
        fieldsToRender: string[]) {
        return new Promise<FormField[]>((resolve, reject) => {
            const fieldsMetadata = new Array<FormField>();
            const ctx = new SP.ClientContext(payload.siteUrl);
            const list = ctx.get_web().get_lists().getById(payload.listId);
            const fields = new Array<SP.Field>(); // list.get_fields();
            let item = null;
            if (payload.itemId > 0) {
                item = list.getItemById(payload.itemId);
                ctx.load(item);
            }
            ctx.load(list);
            fieldsToRender.forEach((name) => {
                const fldCtx = list.get_fields().getByInternalNameOrTitle(name);
                ctx.load(fldCtx);
                fields.push(fldCtx);
            });
            ctx.executeQueryAsync((s, a) => {
                fieldsToRender.forEach((name) => {
                    const fld = fields.find((f) => f.get_internalName() === name);
                    if (!fld) {
                        return;
                    }
                    const fieldType = fld.get_typeAsString();
                    if (fieldType === 'Lookup' || fieldType === 'LookupMulti') {
                        const fldLookup = fld.get_typedObject() as SP.FieldLookup;
                        if (fldLookup) {
                            const multi = name === proj.FieldBuildObj ? false : fldLookup.get_allowMultipleValues();
                            // const multi = fldLookup.get_allowMultipleValues();
                            fieldsMetadata.push(
                                new FormFieldLookup(
                                    fldLookup.get_internalName(),
                                    fldLookup.get_title(),
                                    fldLookup.get_lookupList(),
                                    multi ? [] : undefined,
                                    multi));
                        }
                    } else if ((fieldType === 'TextField' || fieldType === 'Text' || fieldType === 'Note')) {
                        const fldText = fld as SP.FieldText;
                        if (name === proj.FieldDesignerContracts || name === proj.FieldContracts) {
                            fieldsMetadata.push(new FormFieldLookup(
                                fldText.get_internalName(),
                                fldText.get_title(),
                                '',
                                [],
                                true));
                        } else {
                            fieldsMetadata.push(
                                new FormFieldText(fldText.get_internalName(), fldText.get_title(), undefined));
                        }
                    }
                });
                resolve(fieldsMetadata);
            }, (s, a: SP.ClientRequestFailedEventArgs) => {
                reject(new SPClientRequestError(a));
            });
            ctx.dispose();
        });
    }

    public static async InitializeFieldOptions(payload: {
        siteUrl: string,
        listId: string,
        itemId: number
    },
    fields: FormField[],
    settings: ProjectCardSettings) {
        const fieldsOptions = new Array<SelectOptions>();
        let result: ProjectResult | undefined;
        let item: SP.ListItem | undefined;
        if (payload.itemId > 0) {
            item = await utils.getItemById(payload.siteUrl, payload.listId, payload.itemId);
            if (item) {
                const helper = new ProjectFormHelper(fields, settings);
                // console.log(item.get_fieldValues());
                const itemVals = item.get_fieldValues();
                const boval: SP.FieldLookupValue[] = itemVals[proj.FieldBuildObj] as SP.FieldLookupValue[];
                if (boval && boval.length > 0) {
                    const value: SelectLookupValue = {
                        LookupId: Number(boval[0].get_lookupId()),
                        LookupValue: boval[0].get_lookupValue(),
                    };
                    const boField = fields.find((f) => f.name === proj.FieldBuildObj) as FormFieldLookup;
                    const boItem = await utils
                        .getItemById(payload.siteUrl, boField.lookupListId, value.LookupId);
                    value.externalID = boItem.get_fieldValues()[proj.FieldExternalId] + '';
                    result = await helper.changeBuildObject(value);
                }
            }
        }

        const tojFld = fields.find((f) => f.name === proj.FieldTypeOfJobs);
        if (tojFld) {
            const tojOptions = await ProjectFieldInitializer.getTypeOfJobsOptions(tojFld as FormFieldLookup);
            fieldsOptions.push({ fieldName: tojFld.name, options: tojOptions ? tojOptions : [] });
        }
        fields.forEach((fld) => {
            if (fld.name === proj.FieldContracts || fld.name === proj.FieldDesignerContracts) {
                if (result) {
                    fieldsOptions.push({
                        fieldName: fld.name,
                        options: result.contracts ? result.contracts : [],
                    });
                } else {
                    fieldsOptions.push({
                        fieldName: fld.name,
                        options: [],
                    });
                }
                // Set Field Value
                if (item) {
                    this.setFieldValue(fld, item, true);
                }
            } else if (fld.name === proj.FieldDesigner || fld.name === proj.FieldContractor) {
                if (result) {
                    fieldsOptions.push({
                        fieldName: fld.name,
                        options: result.builders ? result.builders : [],
                    });
                } else {
                    fieldsOptions.push({
                        fieldName: fld.name,
                        options: [],
                    });
                }
                // Set Field Value
                if (item) {
                    this.setFieldValue(fld, item, false);
                }
            } else if (fld.name === proj.FieldBuildObj) {
                fieldsOptions.push({
                    fieldName: fld.name,
                    options: [],
                });
                // Set Field Value
                if (item) {
                    this.setFieldValue(fld, item, false);
                }
            } else {
                // Set Field Value
                if (item) {
                    this.setFieldValue(fld, item, false);
                }
            }
        });
        return fieldsOptions;
    }

    public static async getTypeOfJobsOptions(fld: FormFieldLookup) {
        let typeOfJobs = new Array<SelectLookupValue>();
        if (fld) {
            const query = new CamlBuilder()
                .View()
                .RowLimit(1000)
                .Query()
                .OrderBy('ID').ToString();
            const result = await utils.getItemsByQuery(
                _spPageContextInfo.webServerRelativeUrl,
                fld.lookupListId, query);

            if (result.data && result.data.length > 0) {
                typeOfJobs = result.data.map((ele) => {
                    const val: SelectLookupValue = {
                        LookupId: ele.get_id(),
                        LookupValue: ele.get_item(proj.FieldTitle),
                    };
                    return val;
                });
                return typeOfJobs;
            }
        }
        return null;
    }
}
