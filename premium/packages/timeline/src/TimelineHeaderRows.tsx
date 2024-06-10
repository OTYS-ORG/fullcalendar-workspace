import { BaseComponent, DateRange, DateMarker, DateProfile } from '@fullcalendar/core/internal'
import { createElement, Fragment } from '@fullcalendar/core/preact'
import { TimelineDateProfile } from './timeline-date-profile.js'
import { TimelineHeaderTh } from './TimelineHeaderTh.js'

export interface TimelineHeaderRowsProps {
  dateProfile: DateProfile
  tDateProfile: TimelineDateProfile
  nowDate: DateMarker
  todayRange: DateRange
  rowSyncer?: any // TODO
  heightDefs?: any[] // TODO
}

export class TimelineHeaderRows extends BaseComponent<TimelineHeaderRowsProps> {
  render() {
    let { dateProfile, tDateProfile, todayRange, nowDate, rowSyncer, heightDefs } = this.props
    let { cellRows } = tDateProfile

    return (
      <Fragment>
        {cellRows.map((rowCells, rowLevel) => {
          let isLastRow = rowLevel === cellRows.length - 1
          let isChrono = tDateProfile.isTimeScale && isLastRow // the final row, with times?
          let classNames = [
            'fc-timeline-header-row',
            isChrono ? 'fc-timeline-header-row-chrono' : '',
          ]

          return ( // eslint-disable-next-line react/no-array-index-key
            <tr key={rowLevel} className={classNames.join(' ')}>
              {rowCells.map((cell) => (
                <TimelineHeaderTh
                  key={cell.date.toISOString()}
                  cell={cell}
                  rowLevel={rowLevel}
                  dateProfile={dateProfile}
                  tDateProfile={tDateProfile}
                  todayRange={todayRange}
                  nowDate={nowDate}
                  isSticky={!isLastRow}
                  rowSyncer={rowSyncer}
                  heightDef={heightDefs[rowLevel]}
                />
              ))}
            </tr>
          )
        })}
      </Fragment>
    )
  }
}
