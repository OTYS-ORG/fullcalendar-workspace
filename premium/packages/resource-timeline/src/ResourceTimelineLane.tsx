import { BaseComponent, memoizeObjArg, ContentContainer } from '@fullcalendar/core/internal'
import { createElement, Ref } from '@fullcalendar/core/preact'
import { Resource, refineRenderProps } from '@fullcalendar/resource/internal'
import { TimelineLane, TimelineLaneProps } from '@fullcalendar/timeline/internal'
import { RowSyncer } from './RowSyncer.js'
import { resourcePrefix } from './RowKey.js'

export interface ResourceTimelineLaneProps extends TimelineLaneProps {
  elRef: Ref<HTMLTableRowElement>
  resource: Resource
  rowSyncer: RowSyncer
}

interface ResourceTimelineLaneState {
  frameHeight?: number
}

export class ResourceTimelineLane extends BaseComponent<ResourceTimelineLaneProps, ResourceTimelineLaneState> {
  private refineRenderProps = memoizeObjArg(refineRenderProps)

  render() {
    let { props, state, context } = this
    let { options } = context
    let renderProps = this.refineRenderProps({ resource: props.resource, context })

    return (
      <tr ref={props.elRef}>
        <ContentContainer
          elTag="td"
          elClasses={[
            'fc-timeline-lane',
            'fc-resource',
          ]}
          elAttrs={{
            'data-resource-id': props.resource.id,
          }}
          renderProps={renderProps}
          generatorName="resourceLaneContent"
          customGenerator={options.resourceLaneContent}
          classNameGenerator={options.resourceLaneClassNames}
          didMount={options.resourceLaneDidMount}
          willUnmount={options.resourceLaneWillUnmount}
        >
          {(InnerContent) => (
            <div className="fc-timeline-lane-frame" style={{ height: state.frameHeight }}>
              <InnerContent
                elTag="div"
                elClasses={['fc-timeline-lane-misc']}
              />
              <TimelineLane
                dateProfile={props.dateProfile}
                tDateProfile={props.tDateProfile}
                nowDate={props.nowDate}
                todayRange={props.todayRange}
                nextDayThreshold={props.nextDayThreshold}
                businessHours={props.businessHours}
                eventStore={props.eventStore}
                eventUiBases={props.eventUiBases}
                dateSelection={props.dateSelection}
                eventSelection={props.eventSelection}
                eventDrag={props.eventDrag}
                eventResize={props.eventResize}
                timelineCoords={props.timelineCoords}
                resourceId={props.resource.id}
                onHeightChange={this.handleLaneHeight}
              />
            </div>
          )}
        </ContentContainer>
      </tr>
    ) // important NOT to do liquid-height. dont want to shrink height smaller than content
  }

  // Receive Cell Height & setup callback for TimelineLane to report height
  // -----------------------------------------------------------------------------------------------

  componentDidMount(): void {
    this.props.rowSyncer.addHandler(
      resourcePrefix + this.props.resource.id,
      this.handleFrameHeight,
    )
  }

  componentWillUnmount(): void {
    this.props.rowSyncer.removeHandler(
      resourcePrefix + this.props.resource.id,
      this.handleFrameHeight,
    )
  }

  handleFrameHeight = (frameHeight: number) => {
    this.setState({ frameHeight })
  }

  handleLaneHeight = (laneHeight: number | undefined) => {
    this.props.rowSyncer.reportSize(
      resourcePrefix + this.props.resource.id,
      'lane',
      laneHeight,
    )
  }
}
