import { agent } from './veramo/setup'

async function main() {
  
    const vc = await agent.createVerifiableCredential({
        credential: { 
            issuer: 'did:ethr:rinkeby:0x0366e2f069c8312e16dd7225c8e18c10145520ac8ea1405a7adea10e63ad544c27',
            '@context': ['https://w3id.org/citizenship/v1'],
            type: ['VerifiableCredential'],
            credentialSubject: {
                type: ["PermanentResident"],
                id: 'did:ethr:rinkeby:0x0366e2f069c8312e16dd7225c8e18c10145520ac8ea1405a7adea10e63ad544c27',
                givenName: 'Pablo',
                familyName: 'Cibraro'
            }
        },
        save: false,
        proofFormat: 'lds',
    });
  
    console.log(vc);
  
}

main().catch(console.log)