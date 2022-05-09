// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager } from '@sphereon/core'

// Core identity manager plugin
import { DIDManager } from '@sphereon/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@sphereon/did-provider-ethr'

// Web did identity provider
import { WebDIDProvider } from '@sphereon/did-provider-web'

// Core key manager plugin
import { KeyManager } from '@sphereon/key-manager'

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from '@sphereon/kms-local'

// Custom resolvers
import { DIDResolverPlugin } from '@sphereon/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, IDataStoreORM, PrivateKeyStore, migrations } from '@sphereon/data-store'

// TypeORM is installed with `@veramo/data-store`
import { createConnection } from 'typeorm'

// Credential issuer
import { CredentialIssuer, ICredentialIssuer } from '@sphereon/credential-w3c';

import { 
  ICredentialIssuerLD,
  CredentialIssuerLD, 
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018 
} from '@sphereon/credential-ld';

// Selective disclosure
import { SelectiveDisclosure, ISelectiveDisclosure } from '@sphereon/selective-disclosure';

import * as fs from 'fs';
import * as path from 'path';

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = '6741d374bd12457daf1a18241a3999f7'

// This will be the secret key for the KMS
const KMS_SECRET_KEY = '11d9943d70e8f7a4bb291648599cf61a817d15c8e2a9c69400d6bb5c9c62592c';


function _read(_path: string) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../contexts', _path), { encoding: 'utf8' }))
}

const dbConnection = createConnection({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
});

const contexts = new Map([
  ['https://w3id.org/citizenship/v1', _read('citizen.jsonld')],
]);

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialIssuer & ICredentialIssuerLD & ISelectiveDisclosure>({
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr:rinkeby': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
          }),
          'did:web': new WebDIDProvider({
            defaultKms: 'local',
          }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
          ...webDidResolver(),
        }),
      }),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts, contexts],
        suites: [new VeramoEcdsaSecp256k1RecoverySignature2020(), new VeramoEd25519Signature2018()],
      }), 
      new CredentialIssuer(),
      new SelectiveDisclosure()
    ],
  })