import { ViewContextType, buildViewContext } from '../ViewContext.js'
import { ViewSpec } from '../structs/view-spec.js'
import { ViewProps } from '../component-util/View.js'
import { Toolbar } from './Toolbar.js'
import { DateProfileGenerator, DateProfile } from '../DateProfileGenerator.js'
import { rangeContainsMarker } from '../datelib/date-range.js'
import { memoize } from '../util/memoize.js'
import { DateMarker } from '../datelib/marker.js'
import { CalendarData } from '../reducers/data-types.js'
import { ViewPropsTransformerClass } from '../plugin-system-struct.js'
import { createElement, Fragment, VNode } from '../preact.js'
import {
  Interaction,
  InteractionSettingsInput,
  InteractionClass,
  parseInteractionSettings,
  interactionSettingsStore,
} from '../interactions/interaction.js'
import { DateComponent } from './DateComponent.js'
import { EventClicking } from '../interactions/EventClicking.js'
import { EventHovering } from '../interactions/EventHovering.js'
import { getNow } from '../reducers/current-date.js'
import { CalendarInteraction } from '../calendar-utils.js'
import { PureComponent } from '../vdom-util.js'
import { getIsHeightAuto } from '../internal.js'
import { ViewHarness } from './ViewHarness.js'
import { CssDimValue } from '../index.global.js'

export interface CalendarContentProps extends CalendarData {
  forPrint: boolean
}

export class CalendarContent extends PureComponent<CalendarContentProps> {
  private buildViewContext = memoize(buildViewContext)
  private buildViewPropTransformers = memoize(buildViewPropTransformers)
  private buildToolbarProps = memoize(buildToolbarProps)
  private interactionsStore: { [componentUid: string]: Interaction[] } = {}
  private calendarInteractions: CalendarInteraction[]

  /*
  renders INSIDE of an outer div
  */
  render() {
    let { props } = this
    let { toolbarConfig, options } = props

    let toolbarProps = this.buildToolbarProps(
      props.viewSpec,
      props.dateProfile,
      props.dateProfileGenerator,
      props.currentDate,
      getNow(props.options.now, props.dateEnv), // TODO: use NowTimer????
      props.viewTitle,
    )

    let viewHeight: CssDimValue | undefined
    let viewAspectRatio: number | undefined

    if (props.forPrint || getIsHeightAuto(options)) {
      ; // don't set any heights
    } else if (options.height != null) {
      ; // nothing to do. already set via Calendar::setHeight
    } else if (options.contentHeight != null) {
      viewHeight = options.contentHeight
    } else {
      viewAspectRatio = Math.max(options.aspectRatio, 0.5) // prevent from getting too tall
    }

    let viewContext = this.buildViewContext(
      props.viewSpec,
      props.viewApi,
      props.options,
      props.dateProfileGenerator,
      props.dateEnv,
      props.theme,
      props.pluginHooks,
      props.dispatch,
      props.getCurrentData,
      props.emitter,
      props.calendarApi,
      this.registerInteractiveComponent,
      this.unregisterInteractiveComponent,
    )
    return (
      <ViewContextType.Provider value={viewContext}>
        {toolbarConfig.header && (
          <Toolbar
            extraClassName="fcnew-header-toolbar"
            model={toolbarConfig.header}
            {...toolbarProps}
          />
        )}
        <ViewHarness
          height={viewHeight}
          aspectRatio={viewAspectRatio}
        >
          {this.renderView(props)}
          {this.buildAppendContent()}
        </ViewHarness>
        {toolbarConfig.footer && (
          <Toolbar
            extraClassName="fcnew-footer-toolbar"
            model={toolbarConfig.footer}
            {...toolbarProps}
          />
        )}
      </ViewContextType.Provider>
    )
  }

  componentDidMount() {
    let { props } = this

    this.calendarInteractions = props.pluginHooks.calendarInteractions
      .map((CalendarInteractionClass) => new CalendarInteractionClass(props))

    let { propSetHandlers } = props.pluginHooks
    for (let propName in propSetHandlers) {
      propSetHandlers[propName](props[propName], props)
    }
  }

  componentDidUpdate(prevProps: CalendarContentProps) {
    let { props } = this

    let { propSetHandlers } = props.pluginHooks
    for (let propName in propSetHandlers) {
      if (props[propName] !== prevProps[propName]) {
        propSetHandlers[propName](props[propName], props)
      }
    }
  }

  componentWillUnmount() {
    for (let interaction of this.calendarInteractions) {
      interaction.destroy()
    }

    this.props.emitter.trigger('_unmount')
  }

  buildAppendContent(): VNode {
    let { props } = this

    let children = props.pluginHooks.viewContainerAppends.map(
      (buildAppendContent) => buildAppendContent(props),
    )

    return createElement(Fragment, {}, ...children)
  }

  renderView(props: CalendarContentProps) {
    let { pluginHooks } = props
    let { viewSpec } = props

    let viewProps: ViewProps = {
      dateProfile: props.dateProfile,
      businessHours: props.businessHours,
      eventStore: props.renderableEventStore, // !
      eventUiBases: props.eventUiBases,
      dateSelection: props.dateSelection,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      forPrint: props.forPrint,
    }

    let transformers = this.buildViewPropTransformers(pluginHooks.viewPropsTransformers)

    for (let transformer of transformers) {
      Object.assign(
        viewProps,
        transformer.transform(viewProps, props),
      )
    }

    let ViewComponent = viewSpec.component

    return (
      <ViewComponent {...viewProps} />
    )
  }

  // Component Registration
  // -----------------------------------------------------------------------------------------------------------------

  registerInteractiveComponent = (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => {
    let settings = parseInteractionSettings(component, settingsInput)
    let DEFAULT_INTERACTIONS: InteractionClass[] = [
      EventClicking,
      EventHovering,
    ]
    let interactionClasses: InteractionClass[] = DEFAULT_INTERACTIONS.concat(
      this.props.pluginHooks.componentInteractions,
    )
    let interactions = interactionClasses.map((TheInteractionClass) => new TheInteractionClass(settings))

    this.interactionsStore[component.uid] = interactions
    interactionSettingsStore[component.uid] = settings
  }

  unregisterInteractiveComponent = (component: DateComponent<any>) => {
    let listeners = this.interactionsStore[component.uid]

    if (listeners) {
      for (let listener of listeners) {
        listener.destroy()
      }
      delete this.interactionsStore[component.uid]
    }

    delete interactionSettingsStore[component.uid]
  }
}

function buildToolbarProps(
  viewSpec: ViewSpec,
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  currentDate: DateMarker,
  now: DateMarker,
  title: string,
) {
  // don't force any date-profiles to valid date profiles (the `false`) so that we can tell if it's invalid
  let todayInfo = dateProfileGenerator.build(now, undefined, false) // TODO: need `undefined` or else INFINITE LOOP for some reason
  let prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate, false)
  let nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate, false)

  return {
    title,
    activeButton: viewSpec.type,
    navUnit: viewSpec.singleUnit,
    isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
    isPrevEnabled: prevInfo.isValid,
    isNextEnabled: nextInfo.isValid,
  }
}

// Plugin
// -----------------------------------------------------------------------------------------------------------------

function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map((TheClass) => new TheClass())
}
