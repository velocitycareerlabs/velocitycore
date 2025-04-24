export const getTitle = (step) => {
  switch (step) {
    case 2:
      return "You're one step away from setting up your new service on Velocity Network™";
    case 3:
      return 'Set a Secure Messages URL';
    case 4:
      return 'Congratulations!';
    default:
      return 'Select type of service to add';
  }
};

export const isAddButtonDisabled = (
  inProgress,
  isIssueOrInspection,
  selectedCAO,
  serviceEndpoint,
) => {
  return (
    !(
      (isIssueOrInspection && serviceEndpoint && selectedCAO) ||
      (!isIssueOrInspection && serviceEndpoint)
    ) || inProgress
  );
};

export const formatSecrets = (secretKeys) => {
  return secretKeys
    ? [
        ...(secretKeys.keys
          ? secretKeys.keys.map((item) => ({
              ...item,
              id: item.didDocumentKey.id.replace('#', ''),
            }))
          : []),
        ...(secretKeys.authClients
          ? secretKeys.authClients.reduce(
              (acc, { clientId, clientSecret }) => [
                ...acc,
                { id: 'Client Id', key: clientId },
                { id: 'Client Secret', key: clientSecret },
              ],
              [],
            )
          : []),
      ]
    : [];
};
