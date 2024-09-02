// import { Google } from 'arctic';
import arctic from "src/adapters/arctic";
import { ProviderGeneratorParams } from 'src/types';
import { GoogleProfile } from 'next-auth/providers/google';
import { Google } from "arctic";

export default (params: ProviderGeneratorParams) => arctic<'google', GoogleProfile>(
    'google',
    Google,
    params,
    {
        profileFetchUri: 'https://openidconnect.googleapis.com/v1/userinfo',
        extractRawProfile(profile){
            return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
            }
        }
    },
);