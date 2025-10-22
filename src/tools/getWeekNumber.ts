export function getWeekNumber(timestamp: number | string): number {
    const date = new Date(Number(timestamp))

    // Convert to Curitiba time (GMT-3)
    const curitibaOffset = -3 * 60 // GMT-3 in minutes
    const localTime = new Date(date.getTime() + (curitibaOffset - date.getTimezoneOffset()) * 60000)

    // Get date components in Curitiba time
    const year = localTime.getFullYear()
    const month = localTime.getMonth()
    const day = localTime.getDate()

    // Create pure date object (no time component)
    const pureDate = new Date(year, month, day)

    // Get day of week (0=Sun, 1=Mon, ..., 6=Sat)
    const dayOfWeek = pureDate.getDay()

    // Calculate days to Monday (if Sunday, go back 6 days)
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    // Get Monday at 00:00:00 of this week
    const monday = new Date(pureDate)
    monday.setDate(pureDate.getDate() - daysToMonday)

    // Reference point (Monday, January 5, 1970 in Curitiba time)
    const firstMonday = new Date(1970, 0, 5)

    // Calculate full weeks between dates
    const diffMs = monday.getTime() - firstMonday.getTime()
    return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
}