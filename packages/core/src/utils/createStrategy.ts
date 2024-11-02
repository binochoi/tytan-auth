import { StrategyContext, Endpoint } from "@tytan-auth/common";

export const createStrategy = <
    TOptions extends {},
    TTypes extends {},
    TEndpoints extends Endpoints,
    TName extends string,
    TCallback extends StrategyCallback<TOptions, Results<TName, TEndpoints, TTypes>>
    >(fn: TCallback) =>
    (options: TOptions) =>
    (context: StrategyContext<any>) => fn(context, options);
    
type Endpoints = { [K: string]: Endpoint<any> };
type Results<TName extends string, TEndpoints extends Endpoints, TTypes extends {}> = {
    name: TName;
    endpoints: TEndpoints;
    types: TTypes;
};
type StrategyCallback<
    TOptions extends {},
    TResults extends {}
> = (context: StrategyContext<any>, options: TOptions) => TResults;
