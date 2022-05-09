import { agent } from './veramo/setup'

async function main() {
  
   const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 3);

    const vc = await agent.createVerifiableCredential({
        credential: { 
            '@context': ['https://w3id.org/citizenship/v1'],
            issuer: {
                id: 'did:ethr:rinkeby:0x0366e2f069c8312e16dd7225c8e18c10145520ac8ea1405a7adea10e63ad544c27'
            },
            type: ['VerifiableCredential'],
            credentialSubject: {
                type: ["PermanentResident"],
                id: 'did:ethr:rinkeby:0x0366e2f069c8312e16dd7225c8e18c10145520ac8ea1405a7adea10e63ad544c27',
                givenName: 'Pablo',
                familyName: 'Cibraro'
            },
            expirationDate: expirationDate.toJSON(),
            id: 'did:ethr:rinkeby:0x0366e2f069c8312e16dd7225c8e18c10145520ac8ea1405a7adea10e63ad544c27'
        },
        save: true,
        proofFormat: 'lds',
    });
  
    console.log(vc);
  
}

main().catch(console.log)
