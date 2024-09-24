import { createElement, Fragment } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { buildSegTimeText, EventContentArg, getSegAnchorAttrs } from '../component-util/event-rendering.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { EventContainer } from './EventContainer.js'
import { Seg } from '../component/DateComponent.js'
import { ElRef } from '../content-inject/ContentInjector.js'

export interface StandardEventProps {
  elRef?: ElRef
  elClasses?: string[]
  seg: Seg
  isDragging: boolean // rename to isMirrorDragging? make optional?
  isResizing: boolean // rename to isMirrorResizing? make optional?
  isDateSelecting: boolean // rename to isMirrorDateSelecting? make optional?
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  disableDragging?: boolean // defaults false
  disableResizing?: boolean // defaults false
  defaultTimeFormat: DateFormatter
  defaultDisplayEventTime?: boolean // default true
  defaultDisplayEventEnd?: boolean // default true
}

// should not be a purecomponent
export class StandardEvent extends BaseComponent<StandardEventProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { seg } = props
    let { ui } = seg.eventRange
    let timeFormat = options.eventTimeFormat || props.defaultTimeFormat
    let timeText = buildSegTimeText(
      seg,
      timeFormat,
      context,
      props.defaultDisplayEventTime,
      props.defaultDisplayEventEnd,
    )

    return (
      <EventContainer
        {...props /* includes elRef */}
        elTag="a"
        elStyle={{
          borderColor: ui.borderColor,
          backgroundColor: ui.backgroundColor,
        }}
        elAttrs={getSegAnchorAttrs(seg, context)}
        defaultGenerator={renderInnerContent}
        timeText={timeText}
      >
        {(InnerContent, eventContentArg) => (
          <Fragment>
            <InnerContent
              elTag="div"
              elClasses={['fcnew-event-inner']}
              elStyle={{ color: eventContentArg.textColor }}
            />
            {Boolean(eventContentArg.isStartResizable) && (
              <div className="fcnew-event-resizer fcnew-event-resizer-start" />
            )}
            {Boolean(eventContentArg.isEndResizable) && (
              <div className="fcnew-event-resizer fcnew-event-resizer-end" />
            )}
          </Fragment>
        )}
      </EventContainer>
    )
  }
}

function renderInnerContent(innerProps: EventContentArg) {
  return (
    <Fragment>
      {innerProps.timeText && (
        <div className="fcnew-event-time">{innerProps.timeText}</div>
      )}
      <div className="fcnew-event-title-outer">
        <div className="fcnew-event-title">
          {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
        </div>
      </div>
    </Fragment>
  )
}
