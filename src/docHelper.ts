import {
    ExecutiveDocument,
    SelectLookupValue,
    FieldValueCollection,
    Project,
    FileData,
} from '@/types';
import CamlBuilder, { IFieldExpression, ITextFieldExpression } from 'camljs';
import axios from 'axios';
import { FieldNames } from '@/constants';
import {
    getItemById,
    getItemsByQuery,
    createOrUpdateItem,
    createBatchItems,
    dateToFormString
} from '@/utilities';

function getExecDocAsFields(document: ExecutiveDocument): FieldValueCollection {
    console.log(document.scanDate);
    const values: FieldValueCollection = {
        [FieldNames.FieldTitle]: document.title && document.title !== '' ? document.title : '',
        [FieldNames.FieldHasRemarks]: document.hasRemarks,
        [FieldNames.FieldRemarks]: document.hasRemarks ? document.remarks : '',
        [FieldNames.FieldRequired]: document.required,
        [FieldNames.FieldComment]: document.comment,
        [FieldNames.FieldProject]: document.projectId,
        [FieldNames.FieldDocForm]: document.formType,
        [FieldNames.FieldDocumentType]:
            ((document.docTypeId && document.docTypeId > 0)
                ? document.docTypeId
                : 0),
        [FieldNames.FieldBarCode]: document.barCode,
    };

    if (document.jobTypeId) {
        values[FieldNames.FieldJobType] = document.jobTypeId;
    }
    if (document.scanSize) {
        values[FieldNames.FieldScanFileSize] = document.scanSize;
    } else {
        values[FieldNames.FieldScanFileSize] = 0;
    }

    if (document.scanLink) {
        const url = new SP.FieldUrlValue();
        url.set_url(document.scanLink);
        values[FieldNames.FieldScanLink] = url;
    } else {
        const url = new SP.FieldUrlValue();
        url.set_url('');
        values[FieldNames.FieldScanLink] = url;
    }
    console.log(document.scanDate);
    if (document.scanDate) {
        // const Utility = {
        //     pad: function (number: number) {
        //         if (number < 10) {
        //             return '0' + number;
        //         }
        //         return number;
        //     },

        //     CreateISO8601DateTimeFromSystemDateTime: function (dt: Date) {
        //         return dt.getFullYear() +
        //             '-' + Utility.pad(dt.getMonth() + 1) +
        //             '-' + Utility.pad(dt.getDate()) +
        //             'T' + Utility.pad(dt.getHours()) +
        //             ':' + Utility.pad(dt.getMinutes()) +
        //             ':' + Utility.pad(dt.getSeconds()) +
        //             'Z';
        //     },
        // };
        values[FieldNames.FieldScanModified] = dateToFormString(document.scanDate);
    } else {
        values[FieldNames.FieldScanModified] = '';//dateToFormString(document.scanDate)
    }
    return values;
}

export function getEmptyExecutiveDoc(project?: Project, jobTypeId?: number) {
    console.log(jobTypeId);
    const file: ExecutiveDocument = {
        id: 0,
        hasRemarks: false,
        required: false,
        projectId: project ? project.id : 0,
        changed: false,
        barCode: '',
        scanDate: null,
        scanLink: '',
        scanSize: 0,
        title: '',
        jobTypeId: jobTypeId ? jobTypeId : 0,
    };
    return file;
}

function lisItemToExecDoc(item: SP.ListItem<any>): ExecutiveDocument {
    const values = item.get_fieldValues();
    const title = values[FieldNames.FieldTitle] as string;
    const barCode = values[FieldNames.FieldBarCode] as string;
    const jobType = values[FieldNames.FieldJobType] as SP.FieldLookupValue;
    const hasRemarks = values[FieldNames.FieldHasRemarks] as boolean;
    const remarks = values[FieldNames.FieldRemarks] as string;
    const required = values[FieldNames.FieldRequired] as boolean;
    const comment = values[FieldNames.FieldComment] as string;
    const project = values[FieldNames.FieldProject] as SP.FieldLookupValue;
    const formType = values[FieldNames.FieldDocForm] as string;
    const docType = values[FieldNames.FieldDocumentType] as SP.FieldLookupValue;
    const scanSize = values[FieldNames.FieldScanFileSize] as number;
    const scanLink = values[FieldNames.FieldScanLink] as SP.FieldUrlValue;
    const scanDate = values[FieldNames.FieldScanModified] as Date;

    const doc: ExecutiveDocument = {
        id: item.get_id(),
        required,
        hasRemarks,
        title,
        comment,
        formType,
        remarks,
        barCode,
        docTypeName: docType ? docType.get_lookupValue() : undefined,
        docTypeId: docType ? docType.get_lookupId() : undefined,
        jobTypeId: jobType ? jobType.get_lookupId() : 0,
        projectId: project.get_lookupId(),
        changed: false,
        scanLink: scanLink ? scanLink.get_url() : '',
        scanSize: scanSize ? scanSize : 0,
        scanDate,
    };

    return doc;
}

export async function getExecutiveDocs(siteUrl: string, execDocCardListId: string, projectId: number)
    : Promise<ExecutiveDocument[]> {
    const caml = new CamlBuilder()
        .View()
        .RowLimit(200, false)
        .Query()
        .Where()
        .LookupField(FieldNames.FieldProject).Id().EqualTo(projectId)
        .OrderBy(FieldNames.FieldTitle)
        .ToString();
    const execDocItems = await getItemsByQuery(siteUrl, execDocCardListId, caml);
    const docs: ExecutiveDocument[] = new Array<ExecutiveDocument>();
    execDocItems.data.map((docItem) => {
        docs.push(lisItemToExecDoc(docItem));
    });
    return docs;
}

export async function addExecutiveDoc(siteUrl: string, listId: string, document: ExecutiveDocument, checkNull: boolean = true) {
    const values = getExecDocAsFields(document);
    const item = await createOrUpdateItem(siteUrl, listId, document.id, values, checkNull);
    return lisItemToExecDoc(item);
}

// This function should be executed afted saving project item.
export async function initializeExecutiveDocs(
    siteUrl: string,
    execDocCardListId: string,
    docTypesListId: string,
    project: Project,
) {
    // Get document Types
    if (project.jobTypes && project.jobTypes.length > 0) {
        const jtId = project.jobTypes.map((jt) => {
            return jt.LookupId;
        });
        const caml = new CamlBuilder()
            .View()
            .Query()
            .Where()
            .LookupField(FieldNames.FieldJobType).Id().In(jtId)
            .And().BooleanField(FieldNames.FieldObligatory).IsTrue()
            .OrderBy(FieldNames.FieldTitle)
            .ToString();

        const camlCommon = new CamlBuilder()
            .View()
            .Query()
            .Where().LookupField(FieldNames.FieldJobType).ValueAsText().IsNull()
            .And().BooleanField(FieldNames.FieldObligatory).IsTrue()
            .OrderBy(FieldNames.FieldTitle)
            .ToString();

        const docTypeItems = await getItemsByQuery(siteUrl, docTypesListId, caml);
        const docTypeCommonItems = await getItemsByQuery(siteUrl, docTypesListId, camlCommon);

        const items = new Array<SP.ListItem>();
        if (docTypeItems && docTypeItems.data && docTypeItems.data.length > 0) {
            items.push(...docTypeItems.data);
        }
        if (docTypeCommonItems && docTypeCommonItems.data && docTypeCommonItems.data.length > 0) {
            items.push(...docTypeCommonItems.data);
        }
        if (items.length > 0) {
            const batch: FieldValueCollection[] = Array<FieldValueCollection>();
            //const items = docTypeItems.data;
            items.forEach((item) => {
                const itemValues = item.get_fieldValues();
                const jobTypeLv = itemValues[FieldNames.FieldJobType] as SP.FieldLookupValue;
                const title = itemValues[FieldNames.FieldTitle] as string;
                const required = itemValues[FieldNames.FieldObligatory] as boolean;
                const jobTypeId = jobTypeLv ? jobTypeLv.get_lookupId() : 0;
                const doc: ExecutiveDocument = {
                    id: 0,
                    required, //required: required ? required : false,
                    title,
                    jobTypeId,
                    projectId: project.id,
                    hasRemarks: false,
                    docTypeId: item.get_id(),
                    changed: false,
                };
                batch.push(getExecDocAsFields(doc));
            });
            await createBatchItems(siteUrl, execDocCardListId, batch);
        }
    }
}

export async function getAllListItemsAsSelectLookupValues(siteUrl: string, listId: string, orderByField?: string)
    : Promise<SelectLookupValue[]> {
    let caml = '';
    caml = new CamlBuilder()
        .View()
        .Query()
        .OrderBy(FieldNames.FieldTitle)
        .ToString();

    const items = await getItemsByQuery(siteUrl, listId, caml);
    const types = new Array<SelectLookupValue>();
    if (items.data && items.data.length > 0) {
        items.data.forEach((item) => {
            types.push({
                LookupId: item.get_id(),
                LookupValue: item.get_item(FieldNames.FieldTitle)
            });
        });
    }
    return types;
}

export async function getExecutiveDocTypes(siteUrl: string, listId: string, jobTypeIdArr: number[])
    : Promise<SelectLookupValue[]> {
    const types = new Array<SelectLookupValue>();
    const items = new Array<SP.ListItem>();
    const arr = jobTypeIdArr.filter((jt) => jt > 0);
    if (arr && arr.length > 0) {
        const caml = new CamlBuilder()
            .View()
            .Query()
            .Where()
            .LookupField(FieldNames.FieldJobType).Id().In(arr)
            .OrderBy(FieldNames.FieldTitle)
            .ToString();
        const vals = await getItemsByQuery(siteUrl, listId, caml);
        if (vals && vals.data && vals.data.length > 0) {
            items.push(...vals.data);
        }
    }
    const commonJt = jobTypeIdArr.filter((jt) => jt <= 0);
    if (commonJt && commonJt.length > 0) {
        const camlCommon = new CamlBuilder()
            .View()
            .Query()
            .Where()
            .LookupField(FieldNames.FieldJobType).ValueAsText().IsNull()
            .OrderBy(FieldNames.FieldTitle)
            .ToString();
        const vals = await getItemsByQuery(siteUrl, listId, camlCommon);
        if (vals && vals.data && vals.data.length > 0) {
            items.push(...vals.data);
        }
    }
    if (items.length > 0) {
        items.forEach((item) => {
            types.push({
                LookupId: item.get_id(),
                LookupValue: item.get_item(FieldNames.FieldTitle)
            });
        });
    }
    return types;
}

export async function getStorageAddress(svcUrl: string, userId: string, barCode: string) {
    try {
        const response = await axios.post(svcUrl, `getPropertiesObject={"barcode":"${barCode}","userId":"${userId}"}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const arr = response.data.success as [];
        if (arr && arr.length > 0) {
            const address = arr.join(' / ');
            return address;
        }
        if (response.data && response.data.error) {
            console.error(response.data.error);
        }
    }
    catch (e) {
        console.error(e);
    }
    return '';
}

export async function scanForDocuments(
    siteUrl: string,
    docLibId: string,
    barCodeFieldName: string,
    barCodes: string[]) {

    console.log('start scan');
    if (barCodes.length === 0) {
        return [];
    }

    let caml = new CamlBuilder()
        .View()
        .Scope(CamlBuilder.ViewScope.RecursiveAll)
        .RowLimit(100, false)
        .Query()
        .Where();

    const exprs: CamlBuilder.IExpression[] = [];
    barCodes.forEach((bc) => {
        const expr = CamlBuilder.Expression().TextField(barCodeFieldName).EqualTo(bc);
        exprs.push(expr);
        // caml = caml.TextField(barCodeFieldName).EqualTo(bc);
    });

    const query = caml.Any(...exprs).ToString();
    const items = await getItemsByQuery(siteUrl, docLibId, query);
    const fileData: FileData[] = [];
    if (items.data && items.data.length > 0) {
        items.data.forEach((file) => {
            fileData.push(listItemToFileData(file));
        });
    }
    return fileData;
}

function listItemToFileData(item: SP.ListItem): FileData {
    const values = item.get_fieldValues();
    const name = values[FieldNames.FieldFileLeafRef] as string;
    const dir = values[FieldNames.FieldFileDirRef] as string;
    const created = values[FieldNames.FieldCreated] as Date;
    const modDate = values[FieldNames.FieldCreated] as Date;
    const size = values[FieldNames.FieldFileSize] as number;
    return {
        url: `${dir}/${name}`,
        name,
        created,
        modified: modDate ? new Date(modDate.toISOString()) : new Date(),
        size,
    };
}
