import { Project } from '@/types';
import { FieldNames } from '@/constants';
import {
    convertToSelectLookup,
    parseMultiLookupValue,
} from '@/utilities';

export function listItemToProject(item: SP.ListItem): Project {
    const values = item.get_fieldValues();

    const title: string = values[FieldNames.FieldTitle] as string;
    const jobTypes: SP.FieldLookupValue[] = values[FieldNames.FieldTypeOfJobs] as SP.FieldLookupValue[];
    const buildObj: SP.FieldLookupValue[] = values[FieldNames.FieldBuildObj] as SP.FieldLookupValue[];
    const builder: SP.FieldLookupValue[] = values[FieldNames.FieldBuilder] as SP.FieldLookupValue[];
    const contracts: string = values[FieldNames.FieldContracts] as string;
    const designer: SP.FieldLookupValue[] = values[FieldNames.FieldDesigner] as SP.FieldLookupValue[];

    return {
        id: item.get_id(),
        title: title,
        jobTypes: convertToSelectLookup(jobTypes),
        buildObject: convertToSelectLookup(buildObj),
        builder: convertToSelectLookup(builder),
        contracts: parseMultiLookupValue(contracts),
        designer: convertToSelectLookup(designer),
    }
}
