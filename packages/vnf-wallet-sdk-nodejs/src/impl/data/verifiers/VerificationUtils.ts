/**
 * Created by Michael Avoyan on 20/03/2025.
 *
 * Copyright 2022 Velocity Career Labs inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import { find, get } from 'lodash';
import { Dictionary } from '../../../api/VCLTypes';

export const getCredentialTypeMetadataByVc = (
    credentialTypeMetadataDict: Dictionary<any> | undefined,
    vc: Dictionary<any>
): Dictionary<any> => {
    return find(credentialTypeMetadataDict, getCredentialTypeName(vc)) || {};
};

const getCredentialTypeName = (vc: Dictionary<any>): string => {
    const types = get(vc, CodingKeys.KeyType, []);
    return types[0] || '';
};

class CodingKeys {
    static readonly KeyType = 'type';
}
