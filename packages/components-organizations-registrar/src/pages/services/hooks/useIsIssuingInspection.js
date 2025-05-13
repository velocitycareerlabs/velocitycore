import { useState, useEffect } from 'react';
import { serviceTypesIssuingOrInspection } from '@/utils/serviceTypes';

export const useIsIssuingInspection = (serviceType) => {
  const [isIssuingOrInspection, setisIssuingOrInspection] = useState(false);

  useEffect(() => {
    const isIssuingOrInspectionType =
      serviceType &&
      serviceTypesIssuingOrInspection.some((service) => service.id === serviceType.id);
    setisIssuingOrInspection(isIssuingOrInspectionType);
  }, [serviceType]);

  return isIssuingOrInspection;
};

export default useIsIssuingInspection;
