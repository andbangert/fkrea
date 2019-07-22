import {
    ExecutiveDocument,
    SelectLookupValue,
    FieldValueCollection,
    Project,
} from '@/types';
import CamlBuilder from 'camljs';
import { FieldNames } from '@/constants';
import {
    getItemById,
    getItemsByQuery,
    createOrUpdateItem,
    createBatchItems,
} from '@/utilities';

function getExecDocAsFields(document: ExecutiveDocument): FieldValueCollection {
    const values: FieldValueCollection = {
        [FieldNames.FieldTitle]: document.title,
        [FieldNames.FieldJobType]: document.jobTypeId,
        [FieldNames.FieldHasRemarks]: document.hasRemarks,
        [FieldNames.FieldRemarks]: document.remarks,
        [FieldNames.FieldRequired]: document.required,
        [FieldNames.FieldComment]: document.comment,
        [FieldNames.FieldProject]: document.projectId,
        [FieldNames.FieldDocForm]: document.formType,
        [FieldNames.FieldDocumentType]: document.docTypeId,
        [FieldNames.FieldBarCode]: document.barCode,
        // [FieldNames.FieldScanFileSize]: document.
    };
    return values;
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
    const doc: ExecutiveDocument = {
        id: item.get_id(),
        required,
        hasRemarks,
        title,
        comment,
        formType,
        remarks,
        barCode,
        docTypeName: docType.get_lookupValue(),
        docTypeId: docType ? docType.get_lookupId() : undefined,
        jobTypeId: jobType ? jobType.get_lookupId() : undefined,
        projectId: project.get_lookupId(),
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

export async function addExecutiveDoc(siteUrl: string, listId: string, document: ExecutiveDocument) {
    const values = getExecDocAsFields(document);
    const item = await createOrUpdateItem(siteUrl, listId, document.id, values);
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
            .Where()
            .LookupField(FieldNames.FieldJobType).Id().IsNull()
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
            const items = docTypeItems.data;
            items.forEach((item) => {
                const itemValues = item.get_fieldValues();
                const jobTypeLv = itemValues[FieldNames.FieldJobType] as SP.FieldLookupValue;
                const title = itemValues[FieldNames.FieldTitle] as string;
                const jobTypeId = jobTypeLv.get_lookupId();
                const doc: ExecutiveDocument = {
                    id: 0,
                    required: true,
                    title,
                    jobTypeId,
                    projectId: project.id,
                    hasRemarks: false,
                    docTypeId: item.get_id(),
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
    const caml = new CamlBuilder()
        .View()
        .Query()
        .Where()
        .LookupField(FieldNames.FieldJobType).Id().In(jobTypeIdArr)
        // .And().BooleanField(FieldNames.FieldObligatory).IsFalse()
        .OrderBy(FieldNames.FieldTitle)
        .ToString();

    const types = new Array<SelectLookupValue>();
    const items = await getItemsByQuery(siteUrl, listId, caml);
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