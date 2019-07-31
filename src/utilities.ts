///// <reference path="constants.ts" />
import {
    SPClientRequestError,
    SelectLookupValue,
    FieldValueCollection,
} from './types';
import { format } from 'date-fns';

export async function SearchListObject(
    searchText: string,
    listId: string,
    rowLimit: number,
    sProps: string[],
):
    // Ret Val
    Promise<SP.JsonObjectResult | SP.ClientRequestFailedEventArgs> {
    return new Promise((resolve, reject) => {
        SP.SOD.executeFunc('SP.js', 'SP.ClientContext', () => {
            SP.SOD.executeFunc('SP.Search.js',
                'Microsoft.SharePoint.Client.' +
                'Search.Query.KeywordQuery',
                () => {
                    //
                    // querytext='(Title:"Баб*"+OR+Title:"*Пер*"+OR+Title:"цао*")
                    // +AND+(ListID:FAEFAC83-F507-48ED-89BC-F2A62D338BFE)
                    // '&rowsperpage=0
                    // &rowlimit=100
                    // &selectproperties='Title%2cListItemID%2cStroiAddressOWSTEXT'
                    // &refiners='contentclass(filter%3dSTS_ListItem)%2c
                    // ContentType(filter%3d7%2f0%2f*)
                    // &rankingmodelid='9399df62-f089-4033-bdc5-a7ea22936e8e'
                    // &sourceid='5dc9f503-801e-4ced-8a2c-5d1237132419'
                    // &clienttype='CSOM'
                    //
                    const ctx = SP.ClientContext.get_current();
                    const keywordQuery =
                        new Microsoft.SharePoint.Client.Search.Query.KeywordQuery(ctx);
                    const words = searchText.split(' ');
                    let query = '';
                    const queryWords = new Array<string>();
                    if (words && words.length > 0) {
                        words.forEach((element) => {
                            if (element !== '') {
                                queryWords.push(`Title:"*${element}*"`);
                            }
                        });
                    }
                    query = queryWords.join(' AND ');
                    query = `(${query}) AND (ListID:${listId})`;
                    // Key word initialization
                    keywordQuery.set_rankingModelId('9399df62-f089-4033-bdc5-a7ea22936e8e');
                    keywordQuery.set_clientType('SCOM');
                    keywordQuery.set_sourceId(new SP.Guid('5dc9f503-801e-4ced-8a2c-5d1237132419'));
                    keywordQuery.set_refiners('contentclass(filter=STS_ListItem),' +
                        'ContentType(filter=7/0/*)');
                    keywordQuery.set_trimDuplicates(true);
                    keywordQuery.set_rowLimit(100);
                    keywordQuery.set_queryText(query);
                    // Add properties
                    const props = keywordQuery.get_selectProperties();
                    if (sProps && sProps.length > 0) {
                        sProps.forEach((element) => {
                            props.add(element);
                        });
                    }
                    const searchExecutor =
                        new Microsoft.SharePoint.Client.
                            Search.Query.SearchExecutor(ctx);
                    const results: SP.JsonObjectResult = searchExecutor.executeQuery(keywordQuery);
                    ctx.executeQueryAsync(
                        () => {
                            resolve(results);
                        },
                        (sender, args) => {
                            reject(args);
                        },
                    );
                });
        });
    });
}

export function onClientContext(fn: () => void) {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', fn);
}

export async function getItemsByQuery(
    siteUrl: string,
    listId: string,
    query: string,
    position?: string,
):
    Promise<{ data: SP.ListItem[], position: string }> {
    // async jquery
    const promise =
        new Promise<{ data: SP.ListItem[], position: string }>(
            (resolve, reject) => {
                onClientContext(() => {
                    const clientContext = new SP.ClientContext(siteUrl);
                    const web = clientContext.get_web();
                    const list = web.get_lists().getById(listId);
                    const caml = new SP.CamlQuery();
                    caml.set_viewXml(query);
                    // Sets current position
                    if (position && position !== '') {
                        const posObj = new SP.ListItemCollectionPosition();
                        posObj.set_pagingInfo(position ? position : '');
                        caml.set_listItemCollectionPosition(posObj);
                    }
                    const colItems = list.getItems(caml);
                    clientContext.load(colItems);
                    // const testItem = list.getItemById(279966);
                    // clientContext.load(testItem);
                    clientContext.executeQueryAsync((sender, args) => {
                        // console.log(testItem);
                        // success
                        const iterator = colItems.getEnumerator();
                        const curPosObj = colItems.get_listItemCollectionPosition();
                        const curPos: string = curPosObj ? curPosObj.get_pagingInfo() : '';
                        const data = new Array<SP.ListItem>();
                        // iterate through items
                        while (iterator.moveNext()) {
                            const item = iterator.get_current();
                            data.push(item);
                        }
                        // Resolve operation
                        resolve({ data, position: curPos });
                    }, (sender, args: SP.ClientRequestFailedEventArgs) => {
                        // failed
                        reject(new SPClientRequestError(args));
                    });
                    clientContext.dispose();
                });
            });
    return promise;
}

export async function getItemById(
    siteUrl: string,
    listId: string,
    itemId: number,
):
    Promise<SP.ListItem> {
    // async jquery
    const promise =
        new Promise<SP.ListItem>(
            (resolve, reject) => {
                onClientContext(() => {
                    const clientContext = new SP.ClientContext(siteUrl);
                    const web = clientContext.get_web();
                    const list = web.get_lists().getById(listId);
                    const item = list.getItemById(itemId);
                    clientContext.load(item);
                    clientContext.executeQueryAsync((sender, args) => {
                        // Resolve operation
                        resolve(item);
                    }, (sender, args: SP.ClientRequestFailedEventArgs) => {
                        // failed
                        reject(new SPClientRequestError(args));
                    });
                    clientContext.dispose();
                });
            });
    return promise;
}

/**
 * Recursively creates all folders by splitting folderUrl by '/'
 * @param siteUrl
 * @param listId
 * @param folderUrl
 */
export function createFolderRecursively(
    siteUrl: string,
    listId: string,
    folderUrl: string,
): Promise<SP.Folder> {
    return new Promise<SP.Folder>((resolve, reject) => {
        const ctx = new SP.ClientContext(siteUrl);
        const list = ctx.get_web().get_lists().getById(listId);
        const createFolderInternal = (parentFolder: SP.Folder, fUrl: string) => {
            const ctx1 = parentFolder.get_context();
            const folderNames = fUrl.split('/');
            const folderName = folderNames[0];
            const curFolder = parentFolder.get_folders().add(folderName);
            ctx1.load(curFolder);
            ctx1.executeQueryAsync((s, a) => {
                if (folderNames.length > 1) {
                    const subFolderUrl = folderNames.slice(1, folderNames.length).join('/');
                    createFolderInternal(curFolder, subFolderUrl);
                }
                resolve(curFolder);
            }, (s, a) => {
                reject(a);
            });
            // end
            ctx1.dispose();
        };
        createFolderInternal(list.get_rootFolder(), folderUrl);
        ctx.dispose();
    });
}

/**
 * Create folder
 * @param siteUrl
 * @param listId
 * @param folderUrl
 * @param checkIfExists
 */
export function checkIfFolderExists(siteUrl: string, listId: string, folderUrl: string):
    Promise<SP.Folder> {
    return new Promise<SP.Folder>((resolve, reject) => {
        const ctx = new SP.ClientContext(siteUrl);
        const list = ctx.get_web().get_lists().getById(listId);
        const curFolder = list.get_rootFolder().get_folders().getByUrl(folderUrl);
        ctx.load(curFolder);
        ctx.executeQueryAsync((s, a) => {
            resolve(curFolder);
        }, (s, a: SP.ClientRequestFailedEventArgs) => {
            reject(new SPClientRequestError(a));
        });
        ctx.dispose();
    });
}

export function getInputTextId(ctx: SPClientTemplates.FieldSchema_InForm): string {
    return ctx.Name + '_' + ctx.Id + '_$TextField';
}

export function getInputLookupId(ctx: SPClientTemplates.FieldSchema_InForm): string {
    return ctx.Name + '_' + ctx.Id + '_$LookupField';
}

export function getInputMultiLookupId(ctx: SPClientTemplates.FieldSchema_InForm): string {
    const prefixId = ctx.Name + '_' + ctx.Id;
    const pickerPrefixId = prefixId + '_MultiLookup';
    return pickerPrefixId;
}

export function parseMultiLookupValue(valueStr: string): SelectLookupValue[] {
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

export function convertToSelectLookup(value: SP.FieldLookupValue[]) {
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

// #region [ Save Functions ]
export function createOrUpdateItem(
    siteUrl: string,
    listId: string,
    itemId: number,
    values: FieldValueCollection,
    checkNull: boolean = true): Promise<SP.ListItem> {
    return new Promise<SP.ListItem>((resolve, reject) => {
        let item: SP.ListItem;
        const initContext = new SP.ClientContext(siteUrl);
        // console.log(siteUrl);
        const formList = ((initContext.get_web()).get_lists()).getById(listId);
        const params = new SP.ListItemCreationInformation();
        let allFormValues = new Array<SP.ListItemFormUpdateValue>();

        initContext.add_requestSucceeded((source, eventArgs) => {
            console.log(item.get_id());
            resolve(item);
        });
        initContext.add_requestFailed((source, eventArgs) => {
            // OnRequestFailed(source, eventArgs);
            reject(new SPClientRequestError(eventArgs));
        });
        const isNew = itemId <= 0;
        params.set_underlyingObjectType(0);
        if (isNew) {
            item = formList.addItem(params);
        } else {
            // console.log(ctx.itemAttributes.Id);
            item = formList.getItemById(itemId);
        }

        const fields = Object.keys(values);
        fields.forEach((fld) => {
            const value = values[fld];
            if (checkNull) {
                if (value !== null) {
                    const formUpdateValue = new SP.ListItemFormUpdateValue();
                    formUpdateValue.set_fieldName(fld);
                    formUpdateValue.set_fieldValue(value);
                    allFormValues.push(formUpdateValue);
                }
            } else {
                const formUpdateValue = new SP.ListItemFormUpdateValue();
                formUpdateValue.set_fieldName(fld);
                formUpdateValue.set_fieldValue(value);
                allFormValues.push(formUpdateValue);
            }
        });
        const updateScope = new SP.ExceptionHandlingScope(initContext);
        const updateScopeDispose = updateScope.startScope();
        if (item) {
            allFormValues = item.validateUpdateListItem(allFormValues, isNew);
            updateScopeDispose.dispose();
        }
        initContext.load(item);
        initContext.executeQueryAsync();
    });
}


// #region [ Save Functions ]
export function createBatchItems(siteUrl: string, listId: string, batchValues: FieldValueCollection[]): Promise<SP.ListItem[]> {
    return new Promise<SP.ListItem[]>((resolve, reject) => {
        const initContext = new SP.ClientContext(siteUrl);
        // console.log(siteUrl);
        const items: SP.ListItem[] = new Array<SP.ListItem>();
        const formList = ((initContext.get_web()).get_lists()).getById(listId);
        initContext.add_requestSucceeded((source, eventArgs) => {
            resolve(items);
        });
        initContext.add_requestFailed((source, eventArgs) => {
            // OnRequestFailed(source, eventArgs);
            reject(new SPClientRequestError(eventArgs));
        });
        batchValues.forEach((values) => {
            const params = new SP.ListItemCreationInformation();
            let allFormValues = new Array<SP.ListItemFormUpdateValue>();
            params.set_underlyingObjectType(0);
            const item: SP.ListItem = formList.addItem(params);
            const fields = Object.keys(values);
            fields.forEach((fld) => {
                const value = values[fld];
                if (value !== null) {
                    const formUpdateValue = new SP.ListItemFormUpdateValue();
                    formUpdateValue.set_fieldName(fld);
                    formUpdateValue.set_fieldValue(value);
                    allFormValues.push(formUpdateValue);
                }
            });
            const updateScope = new SP.ExceptionHandlingScope(initContext);
            const updateScopeDispose = updateScope.startScope();
            if (item) {
                allFormValues = item.validateUpdateListItem(allFormValues, true);
                updateScopeDispose.dispose();
                items.push(item);
            }
            initContext.load(item);
        });
        initContext.executeQueryAsync();
    });
}

// #region [ Save Functions ]
export function removeListItemById(siteUrl: string, listId: string, itemId: number): Promise<SP.ListItem[]> {
    return new Promise<SP.ListItem[]>((resolve, reject) => {
        const initContext = new SP.ClientContext(siteUrl);
        // console.log(siteUrl);
        const items: SP.ListItem[] = new Array<SP.ListItem>();
        const formList = ((initContext.get_web()).get_lists()).getById(listId);
        const listItem = formList.getItemById(itemId);
        listItem.deleteObject();
        initContext.add_requestSucceeded((source, eventArgs) => {
            resolve(items);
        });
        initContext.add_requestFailed((source, eventArgs) => {
            // OnRequestFailed(source, eventArgs);
            reject(new SPClientRequestError(eventArgs));
        });
        initContext.executeQueryAsync();
    });
}

export const dateToFormString = (dateTime: Date): string => {
    // TODO: This should be reworked!!!
    const d = _spPageContextInfo.currentLanguage === 1049
    ? format(dateTime, 'D/M/YYYY h:m A')
    : format(dateTime, 'M/D/YYYY h:m A');
    return d;
};
