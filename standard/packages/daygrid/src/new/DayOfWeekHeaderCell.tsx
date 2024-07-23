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
} from '@fullcalendar/core/internal'
import { createElement } from '@fullcalendar/core/preact'
import { CLASS_NAME, renderInner } from './util.js'

export interface DayOfWeekHeaderCellProps {
  dow: number
  extraRenderProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]

  dayHeaderFormat: DateFormatter
  colSpan?: number
  colWidth: number | undefined
  isSticky?: boolean
}

const WEEKDAY_FORMAT = createFormatter({ weekday: 'long' })

export class DayOfWeekHeaderCell extends BaseComponent<DayOfWeekHeaderCellProps> {
  render() {
    let { props } = this
    let { dateEnv, theme, viewApi, options } = this.context
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
    let renderProps: DayHeaderContentArg = { // TODO: make this public?
      date,
      ...dateMeta,
      view: viewApi,
      ...props.extraRenderProps,
      text,
    }

    return (
      <ContentContainer
        elTag="th"
        elClasses={[
          CLASS_NAME,
          ...getDayClassNames(dateMeta, theme),
          ...(props.extraClassNames || []),
        ]}
        elAttrs={{
          role: 'columnheader',
          colSpan: props.colSpan,
          ...props.extraDataAttrs,
        }}
        elStyle={{
          width: props.colWidth !== undefined ? props.colWidth * (props.colSpan || 1) : undefined
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
          <div className="fc-scrollgrid-sync-inner">
            <InnerContent
              elTag="a"
              elClasses={[
                'fc-col-header-cell-cushion',
                props.isSticky && 'fc-sticky',
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
}