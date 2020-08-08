/// <reference path="./flowMax.d.ts" />
/* eslint-disable known-imports/no-undef-types */

declare module 'ad-hok' {
  import {ValidationMap} from 'prop-types'
  import {
    ComponentType,
    Context,
    MutableRefObject,
    ReactElement,
    Reducer,
  } from 'react'

  type ValueOrFunctionOfProps<TProps, T> = T | ((props: TProps) => T)

  type CurriedPropsAdder<TProps, AdditionalProps> = (
    props: TProps,
  ) => TProps & AdditionalProps

  type SimplePropsAdder<AdditionalProps> = <TProps>(
    props: TProps,
  ) => TProps & AdditionalProps

  type UnchangedProps<TProps> = (props: TProps) => TProps

  type SimpleUnchangedProps = <TProps>(props: TProps) => TProps

  type AddStateType = <
    TState,
    TStateName extends string,
    TStateUpdaterName extends string,
    TProps
  >(
    stateName: TStateName,
    stateUpdaterName: TStateUpdaterName,
    initialState: ValueOrFunctionOfProps<TProps, TState>,
  ) => CurriedPropsAdder<
    TProps,
    {[stateName in TStateName]: TState} &
      {
        [stateUpdaterName in TStateUpdaterName]: (
          state: TState | ((prevState: TState) => TState),
        ) => void
      }
  >

  declare const addState: AddStateType

  type AddEffectType = <TProps>(
    callback: (props: TProps) => () => void,
    dependencies?: Array<string>,
  ) => UnchangedProps<TProps>

  declare const addEffect: AddEffectType

  declare const addLayoutEffect: AddEffectType

  type AddPropsType = <TProps, AdditionalProps extends {[key: string]: any}>(
    createProps: ValueOrFunctionOfProps<TProps, AdditionalProps>,
    dependencies?: Array<string>,
  ) => CurriedPropsAdder<TProps, AdditionalProps>

  declare const addProps: AddPropsType

  type AddRefType = <TRefName extends string, TRef, TProps>(
    refName: TRefName,
    initialValue: ValueOrFunctionOfProps<TProps, TRef>,
  ) => CurriedPropsAdder<
    TProps,
    {[refName in TRefName]: MutableRefObject<TRef>}
  >

  declare const addRef: AddRefType

  type AddContextType = <TContextName extends string, TContext, TProps>(
    context: Context<TContext>,
    contextName: TContextName,
  ) => CurriedPropsAdder<TProps, {[contextName in TContextName]: TContext}>

  declare const addContext: AddContextType

  interface HandlerCreators<TProps> {
    [key: string]: (props: TProps) => (...args: any[]) => any
  }

  type AddHandlersType = <Creators extends HandlerCreators<TProps>, TProps>(
    handlerCreators: Creators,
    dependencies?: Array<string>,
  ) => CurriedPropsAdder<
    TProps,
    {[K in keyof Creators]: ReturnType<Creators[K]>}
  >

  declare const addHandlers: AddHandlersType

  interface StateUpdaters<TProps, TState> {
    [key: string]: (
      state: TState,
      props: TProps,
    ) => (...args: any[]) => Partial<TState>
  }

  type AddStateHandlersType = <
    Updaters extends StateUpdaters<TProps, TState>,
    TProps,
    TState
  >(
    initialState: ValueOrFunctionOfProps<TProps, TState>,
    stateUpdaters: Updaters,
    dependencies?: Array<string>,
  ) => CurriedPropsAdder<
    TProps,
    TState & {[K in keyof Updaters]: ReturnType<Updaters[K]>}
  >

  declare const addStateHandlers: AddStateHandlersType

  type AddWrapperType = <AdditionalProps, TProps>(
    callback: (
      render: (additionalProps?: AdditionalProps) => ReactElement | null,
      props: TProps,
    ) => ReactElement | null,
  ) => CurriedPropsAdder<TProps, AdditionalProps>

  declare const addWrapper: AddWrapperType

  type AddWrapperRenderCallback<TAdditionalProps> = (
    additionalProps: TAdditionalProps,
  ) => ReactElement | null

  type AddPropTypesType = <TPropTypes, TProps>(
    propTypes: ValidationMap<TPropTypes>,
  ) => UnchangedProps<TProps>

  declare const addPropTypes: AddPropTypesType

  type BranchOneBranchType = <TProps>(
    test: (props: TProps) => boolean,
    left: (props: TProps) => any,
  ) => UnchangedProps<TProps>

  type BranchTwoBranchType = <RightProps, TProps>(
    test: (props: TProps) => boolean,
    left: (props: TProps) => any,
    right: (props: TProps) => RightProps,
  ) => CurriedPropsAdder<TProps, RightProps>

  declare const branch: BranchOneBranchType & BranchTwoBranchType

  type ReturnsType = <TProps>(
    callback: (props: TProps) => any,
  ) => UnchangedProps<TProps>

  declare const returns: ReturnsType

  type RenderNothingType = <TProps>() => UnchangedProps<TProps>

  declare const renderNothing: RenderNothingType

  declare const flowMax: FlowMaxType

  export type PropAddingHOCType<AddedProps> = (
    component: ComponentType<any>,
  ) => ComponentType<any>

  type AddWrapperHOCType = <AddedProps, TProps>(
    hoc: PropAddingHOCType<AddedProps>,
  ) => CurriedPropsAdder<TProps, AddedProps>

  declare const addWrapperHOC: AddWrapperHOCType

  type AddDisplayNameType = <TProps>(
    displayName: string,
  ) => UnchangedProps<TProps>

  declare const addDisplayName: AddDisplayNameType

  type AddMemoBoundaryType = (
    dependencies?: string[] | ((oldProps: any, newProps: any) => boolean),
  ) => SimpleUnchangedProps

  declare const addMemoBoundary: AddMemoBoundaryType

  type AddReducerType = <TState, TAction, TProps>(
    reducer: Reducer<TState, TAction>,
    initialState: TState,
  ) => (
    props: TProps,
  ) => TProps & TState & {dispatch: (action: TAction) => void}

  declare const addReducer: AddReducerType
}
