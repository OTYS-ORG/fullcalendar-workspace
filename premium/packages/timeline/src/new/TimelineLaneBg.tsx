import {
  BaseComponent, BgEvent, renderFill,
  getSegMeta, DateRange, DateMarker, buildEventRangeKey,
} from '@fullcalendar/core/internal'
import { createElement, Fragment } from '@fullcalendar/core/preact'
import { computeSegHorizontals } from '../event-placement.js'
import { horizontalsToCss } from '../TimelineCoords.js'
import { TimelineLaneSeg } from '../TimelineLaneSlicer.js'
import { TimelineDateProfile } from '../timeline-date-profile.js'

export interface TimelineLaneBgProps {
  tDateProfile: TimelineDateProfile,
  nowDate: DateMarker
  todayRange: DateRange

  // content
  bgEventSegs: TimelineLaneSeg[] | null // can be null :(
  businessHourSegs: TimelineLaneSeg[] | null // can be null :(
  dateSelectionSegs: TimelineLaneSeg[]
  eventResizeSegs: TimelineLaneSeg[]

  // dimensions
  slotWidth: number | undefined
}

export class TimelineLaneBg extends BaseComponent<TimelineLaneBgProps> {
  render() {
    let { props } = this
    let highlightSeg = [].concat(props.eventResizeSegs, props.dateSelectionSegs)

    return (
      <div className="fc-timeline-bg">
        {/* Fragments contain the keys */}
        {this.renderSegs(props.businessHourSegs || [], 'non-business')}
        {this.renderSegs(props.bgEventSegs || [], 'bg-event')}
        {this.renderSegs(highlightSeg, 'highlight')}
      </div>
    )
  }

  renderSegs(segs: TimelineLaneSeg[], fillType: string) {
    let { tDateProfile, todayRange, nowDate, slotWidth } = this.props
    let { dateEnv, isRtl } = this.context

    let children = segs.map((seg, i) => {
      let hStyle: any

      if (slotWidth != null) {
        let segHorizontal = computeSegHorizontals(seg, undefined, dateEnv, tDateProfile, slotWidth)
        hStyle = horizontalsToCss(segHorizontal, isRtl)
      }

      return (
        <div
          key={buildEventRangeKey(seg.eventRange)}
          className="fc-timeline-bg-harness"
          style={hStyle}
        >
          {fillType === 'bg-event' ?
            <BgEvent seg={seg} {...getSegMeta(seg, todayRange, nowDate)} /> :
            renderFill(fillType)}
        </div>
      )
    })

    return <Fragment>{children}</Fragment>
  }
}
