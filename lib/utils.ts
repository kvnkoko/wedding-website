export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDateRange(events: Array<{ dateTime: string }>): string {
  if (!events || events.length === 0) {
    return 'January - March 2025'
  }
  
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  )
  
  // If user is invited to all 3 events, show all three dates
  if (sortedEvents.length === 3) {
    const dates = sortedEvents.map(event => {
      const eventDate = new Date(event.dateTime)
      const month = eventDate.toLocaleDateString('en-US', { month: 'long' })
      const day = eventDate.getDate()
      return { month, day, year: eventDate.getFullYear() }
    })
    
    // Check if all dates are in the same year
    const year = dates[0].year
    const allSameYear = dates.every(d => d.year === year)
    
    if (allSameYear) {
      return `${dates[0].month} ${dates[0].day} - ${dates[1].month} ${dates[1].day} - ${dates[2].month} ${dates[2].day}, ${year}`
    } else {
      // If different years, show full dates
      return `${dates[0].month} ${dates[0].day}, ${dates[0].year} - ${dates[1].month} ${dates[1].day}, ${dates[1].year} - ${dates[2].month} ${dates[2].day}, ${dates[2].year}`
    }
  }
  
  // For other cases, use the existing range logic
  const firstDate = new Date(sortedEvents[0].dateTime)
  const lastDate = new Date(sortedEvents[sortedEvents.length - 1].dateTime)
  const firstMonth = firstDate.toLocaleDateString('en-US', { month: 'long' })
  const firstDay = firstDate.getDate()
  const lastMonth = lastDate.toLocaleDateString('en-US', { month: 'long' })
  const lastDay = lastDate.getDate()
  const year = firstDate.getFullYear()
  
  if (firstDate.getTime() === lastDate.getTime()) {
    return `${firstMonth} ${firstDay}, ${year}`
  } else if (firstMonth === lastMonth && firstDate.getFullYear() === lastDate.getFullYear()) {
    return `${firstMonth} ${firstDay} - ${lastDay}, ${year}`
  } else if (firstDate.getFullYear() === lastDate.getFullYear()) {
    return `${firstMonth} ${firstDay} - ${lastMonth} ${lastDay}, ${year}`
  } else {
    return `${firstMonth} ${firstDay}, ${firstDate.getFullYear()} - ${lastMonth} ${lastDay}, ${lastDate.getFullYear()}`
  }
}


