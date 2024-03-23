import '@/assets/chart.scss'
export * from '@/lib/chart'
export * from '@/lib/chart-error'
export type { IChartOptions, ITimeline, ILines, InsertMethod } from '@/lib/chart-types'
// TODO: The ability to add types for timeline other than "date"
// TODO: Controls and hints in example
// TODO: tooltip
// TODO: dynamic parameters chart.something('param_name', 'param_value')
// TODO: hide lines (chart.toggle('line_name')) (chart.visible('linename', true))
// TODO: change themes (chart.theme('theme_name'))
