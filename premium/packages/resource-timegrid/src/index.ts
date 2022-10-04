import { createPlugin } from '@fullcalendar/core'

import { default as premiumCommonPlugin } from '@fullcalendar/premium-common' // eslint-disable-line import/no-duplicates
// ensure ambient declarations
import '@fullcalendar/premium-common' // eslint-disable-line import/no-duplicates

import { default as resourceCommonPlugin } from '@fullcalendar/resource-common'
import { default as timeGridPlugin } from '@fullcalendar/timegrid'
import { ResourceDayTimeColsView } from './ResourceDayTimeColsView.js'

export { ResourceDayTimeColsView }
export { ResourceDayTimeCols } from './ResourceDayTimeCols.js'

export default createPlugin({
  deps: [
    premiumCommonPlugin,
    resourceCommonPlugin,
    timeGridPlugin,
  ],
  initialView: 'resourceTimeGridDay',
  views: {

    resourceTimeGrid: {
      type: 'timeGrid', // will inherit this configuration
      component: ResourceDayTimeColsView,
      needsResourceData: true,
    },

    resourceTimeGridDay: {
      type: 'resourceTimeGrid',
      duration: { days: 1 },
    },

    resourceTimeGridWeek: {
      type: 'resourceTimeGrid',
      duration: { weeks: 1 },
    },

  },
})