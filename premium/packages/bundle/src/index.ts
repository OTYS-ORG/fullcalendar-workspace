import { globalPlugins } from '@fullcalendar/core'
import { default as interactionPlugin } from '@fullcalendar/interaction'
import { default as dayGridPlugin } from '@fullcalendar/daygrid'
import { default as timeGridPlugin } from '@fullcalendar/timegrid'
import { default as listPlugin } from '@fullcalendar/list'
import { default as bootstrapPlugin } from '@fullcalendar/bootstrap'
import { default as bootstrap5Plugin } from '@fullcalendar/bootstrap5'
import { default as googleCalendarPlugin } from '@fullcalendar/google-calendar'
import { default as scrollGridPlugin } from '@fullcalendar/scrollgrid'
import { default as adaptivePlugin } from '@fullcalendar/adaptive'
import { default as timelinePlugin } from '@fullcalendar/timeline'
import { default as resourceCommonPlugin } from '@fullcalendar/resource-common'
import { default as resourceDayGridPlugin } from '@fullcalendar/resource-daygrid'
import { default as resourceTimeGridPlugin } from '@fullcalendar/resource-timegrid'
import { default as resourceTimelinePlugin } from '@fullcalendar/resource-timeline'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  bootstrapPlugin,
  bootstrap5Plugin,
  googleCalendarPlugin,
  scrollGridPlugin,
  adaptivePlugin,
  timelinePlugin,
  resourceCommonPlugin,
  resourceDayGridPlugin,
  resourceTimeGridPlugin,
  resourceTimelinePlugin,
)

export * from '@fullcalendar/core'
export * from '@fullcalendar/interaction'
export * from '@fullcalendar/daygrid'
export * from '@fullcalendar/timegrid'
export * from '@fullcalendar/list'
export * from '@fullcalendar/bootstrap' // bootstrap5 not exported
export * from '@fullcalendar/google-calendar'
export * from '@fullcalendar/scrollgrid'
export * from '@fullcalendar/adaptive'
export * from '@fullcalendar/timeline'
export * from '@fullcalendar/resource-common'
export * from '@fullcalendar/resource-daygrid'
export * from '@fullcalendar/resource-timegrid'
export * from '@fullcalendar/resource-timeline'
