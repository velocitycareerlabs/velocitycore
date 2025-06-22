import { useState, useEffect } from 'react';
import { serviceTypesIssuingOrInspection, CREDENTIAL_TYPES_IDS } from '@/utils/serviceTypes';

export const useIsIssuingInspection = (serviceType) => {
  const [isIssuingOrInspection, setisIssuingOrInspection] = useState(false);
  const [isCAO, setIsCAO] = useState(false);

  useEffect(() => {
    const isIssuingOrInspectionType =
      serviceType &&
      serviceTypesIssuingOrInspection.some((service) => service.id === serviceType.id);
    setisIssuingOrInspection(isIssuingOrInspectionType);
    setIsCAO(
      !!serviceType && serviceType.id === CREDENTIAL_TYPES_IDS.VLC_CREDENTIAL_AGENT_OPERATOR,
    );
  }, [serviceType]);

  return { isIssuingOrInspection, isCAO };
};

export default useIsIssuingInspection;
