const {
  toEthereumAddress,
} = require('@velocitycareerlabs/blockchain-functions');
const { initPermissions } = require('@velocitycareerlabs/contract-permissions');

const addPrimaryPermissions = async (
  { primaryAccount, rotationKeyPair, permissioningKeyPair },
  context
) => {
  const {
    config: { rootPrivateKey, permissionsContractAddress },
    rpcProvider,
  } = context;

  const permissionRootContract = await initPermissions(
    {
      privateKey: rootPrivateKey,
      contractAddress: permissionsContractAddress,
      rpcProvider,
    },
    context
  );
  await permissionRootContract.addPrimary({
    primary: primaryAccount,
    permissioning: toEthereumAddress(permissioningKeyPair.publicKey),
    rotation: toEthereumAddress(rotationKeyPair.publicKey),
  });
};

module.exports = { addPrimaryPermissions };
