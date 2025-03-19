/**
 * Copyright 2023 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
  registrarApi: process.env.REACT_APP_REGISTRAR_API,
  xAutoActivate: process.env.REACT_APP_X_AUTO_ACTIVATE === 'true',
  chainName: process.env.REACT_APP_CHAIN_NAME || 'Devnet',
};

export const chainNames = {
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  qanet: 'Qanet',
  devnet: 'Devnet',
  localnet: 'Localnet',
};
