import {
  SlotLabelContentArg,
} from '@fullcalendar/core'
import {
  ViewContext,
  createFormatter,
  ViewContextType,
  ContentContainer,
  watchSize,
  setRef,
} from '@fullcalendar/core/internal'
import {
  Component,
  Ref,
  createElement,
  createRef,
} from '@fullcalendar/core/preact'
import { TimeSlatMeta } from '../time-slat-meta.js'

const DEFAULT_SLAT_LABEL_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'short',
})

export interface TimeGridAxisCellProps extends TimeSlatMeta {
  innerWidthRef?: Ref<number>
  innerHeightRef?: Ref<number>
}

export class TimeGridAxisCell extends Component<TimeGridAxisCellProps> {
  // ref
  private innerElRef = createRef<HTMLDivElement>()

  // internal
  private detachInnerSize?: () => void

  render() {
    let { props } = this
    let classNames = [
      'fc-timegrid-slot',
      'fc-timegrid-slot-label',
      props.isLabeled ? 'fc-scrollgrid-shrink' : 'fc-timegrid-slot-minor',
    ]

    return (
      <ViewContextType.Consumer>
        {(context: ViewContext) => {
          if (!props.isLabeled) {
            return (
              <td className={classNames.join(' ')} data-time={props.isoTimeStr} />
            )
          }

          let { dateEnv, options, viewApi } = context
          let labelFormat = // TODO: fully pre-parse
            options.slotLabelFormat == null ? DEFAULT_SLAT_LABEL_FORMAT :
              Array.isArray(options.slotLabelFormat) ? createFormatter(options.slotLabelFormat[0]) :
                createFormatter(options.slotLabelFormat)

          let renderProps: SlotLabelContentArg = {
            level: 0, // QUESTION!!!: what is this?
            time: props.time,
            date: dateEnv.toDate(props.date),
            view: viewApi,
            text: dateEnv.format(props.date, labelFormat),
          }

          return (
            <ContentContainer
              elTag="td"
              elClasses={classNames}
              elAttrs={{
                'data-time': props.isoTimeStr,
              }}
              renderProps={renderProps}
              generatorName="slotLabelContent"
              customGenerator={options.slotLabelContent}
              defaultGenerator={renderInnerContent}
              classNameGenerator={options.slotLabelClassNames}
              didMount={options.slotLabelDidMount}
              willUnmount={options.slotLabelWillUnmount}
            >
              {(InnerContent) => (
                <div
                  className="fc-timegrid-slot-label-frame fc-scrollgrid-shrink-frame"
                  ref={this.innerElRef}
                >
                  <InnerContent
                    elTag="div"
                    elClasses={[
                      'fc-timegrid-slot-label-cushion',
                      'fc-scrollgrid-shrink-cushion',
                    ]}
                  />
                </div>
              )}
            </ContentContainer>
          )
        }}
      </ViewContextType.Consumer>
    )
  }

  componentDidMount(): void {
    const innerEl = this.innerElRef.current // TODO: make dynamic with useEffect
    this.detachInnerSize = watchSize(innerEl, (width, height) => {
      // TODO: fire these independently
      setRef(this.props.innerWidthRef, width)
      setRef(this.props.innerHeightRef, height)
    })
  }

  componentWillUnmount(): void {
    this.detachInnerSize()
  }
}

function renderInnerContent(props) { // TODO: add types
  return props.text
}
