declare module "@magic-sdk/admin" {
    export class Magic {
      constructor(apiKey: string)
      auth: {
        loginWithCredential: (params: {
          email: string
          credential: {
            type: string
            proof: {
              password: string
            }
          }
        }) => Promise<string>
      }
      users: {
        getMetadataByToken: (didToken: string) => Promise<MagicUserMetadata>
      }
    }
  
    export interface MagicUserMetadata {
      issuer: string
      publicAddress: string
      email: string
    }
  }
  
  