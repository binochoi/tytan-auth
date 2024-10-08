import arctic from "src/adapters/arctic";
import { ProviderGeneratorParams } from 'src/types';
import { KakaoProfile } from "next-auth/providers/kakao";
import { isCommonJS } from "src/utils/isCommonJS";
import { Kakao } from "arctic";

export default (params: ProviderGeneratorParams) => arctic<'kakao', KakaoProfile>(
    'kakao',
    isCommonJS() ? import('arctic').then(({ Kakao }) => Kakao) : Kakao,
    params,
    {
        profileFetchUri: 'https://kapi.kakao.com/v2/user/me',
        extractRawProfile(profile){
            return {
                id: profile.id + '',
                name: profile.kakao_account?.profile?.nickname,
                email: profile.kakao_account?.email,
                image: profile.kakao_account?.profile?.profile_image_url,
            }
        }
    },
);