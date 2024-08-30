import { Kakao } from 'arctic';
import arctic from "src/adapters/arctic";
import { ProviderGeneratorParams } from 'src/types';
export default (params: ProviderGeneratorParams) => arctic('kakao', Kakao, params);