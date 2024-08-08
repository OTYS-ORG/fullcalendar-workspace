import {
  DayHeaderContentArg,
} from '@fullcalendar/core'
import {
  DateMeta,
  getDayClassNames,
  addDays,
  DateFormatter,
  BaseComponent,
  Dictionary,
  createFormatter,
  ContentContainer,
  watchHeight,
  setRef,
} from '@fullcalendar/core/internal'
import { createElement, createRef, Ref } from '@fullcalendar/core/preact'
import { HEADER_CELL_CLASS_NAME, renderInner } from '../util.js'

export interface DayOfWeekHeaderCellProps {
  dow: number
  dayHeaderFormat: DateFormatter
  isSticky?: boolean
  colSpan?: number

  // render hooks
  extraRenderProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[] // needed?

  // dimensions
  colWidth?: number

  // ref
  innerHeightRef?: Ref<number>
}

const WEEKDAY_FORMAT = createFormatter({ weekday: 'long' })

export class DayOfWeekHeaderCell extends BaseComponent<DayOfWeekHeaderCellProps> {
  // ref
  private innerElRef = createRef<HTMLDivElement>()

  // internal
  private disconectInnerHeight?: () => void

  render() {
    let { props, context } = this
    let { dateEnv, theme, viewApi, options } = context

    let date = addDays(new Date(259200000), props.dow) // start with Sun, 04 Jan 1970 00:00:00 GMT
    let dateMeta: DateMeta = {
      dow: props.dow,
      isDisabled: false,
      isFuture: false,
      isPast: false,
      isToday: false,
      isOther: false,
    }
    let text = dateEnv.format(date, props.dayHeaderFormat)

    let renderProps: DayHeaderContentArg = {
      date,
      ...dateMeta,
      view: viewApi,
      ...props.extraRenderProps,
      text,
    }

    return (
      <ContentContainer
        elTag='div'
        elClasses={[
          'fcnew-cell',
          HEADER_CELL_CLASS_NAME,
          ...getDayClassNames(dateMeta, theme),
          ...(props.extraClassNames || []),
        ]}
        elAttrs={props.extraDataAttrs}
        elStyle={{
          width: props.colWidth != null // TODO: DRY
            ? props.colWidth * (props.colSpan || 1)
            : undefined,
        }}
        renderProps={renderProps}
        generatorName="dayHeaderContent"
        customGenerator={options.dayHeaderContent}
        defaultGenerator={renderInner}
        classNameGenerator={options.dayHeaderClassNames}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
        {(InnerContent) => (
          <div ref={this.innerElRef}>
            <InnerContent
              elTag="a"
              elClasses={[
                'fcnew-col-header-cell-cushion',
                props.isSticky && 'fcnew-sticky', // TODO: how to do this???
              ]}
              elAttrs={{
                'aria-label': dateEnv.format(date, WEEKDAY_FORMAT),
              }}
            />
          </div>
        )}
      </ContentContainer>
    )
  }

  componentDidMount(): void {
    const innerEl = this.innerElRef.current // TODO: make dynamic with useEffect

    // TODO: only attach this if refs props present
    this.disconectInnerHeight = watchHeight(innerEl, (height) => {
      setRef(this.props.innerHeightRef, height)
    })
  }

  componentWillUnmount(): void {
    this.disconectInnerHeight()
  }
}