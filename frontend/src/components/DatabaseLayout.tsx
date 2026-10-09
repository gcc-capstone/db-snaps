import { Outlet, useParams } from 'react-router'
import type { TrackedDatabase } from '../data/mockData'
import NotFound from '../pages/NotFound'
import DatabaseSidebar from './DatabaseSidebar'

// Wraps every page under /databases/:databaseId so the sidebar stays put while the page changes.
function DatabaseLayout({
  databases,
  onUpdate,
}: {
  databases: TrackedDatabase[]
  onUpdate: (database: TrackedDatabase) => void
}) {
  const { databaseId } = useParams()
  const database = databases.find((d) => d.id === databaseId)

  if (!database) return <NotFound />

  return (
    <div className="db-shell">
      {/* key resets the sidebar's own state when switching to a different database */}
      <DatabaseSidebar key={database.id} database={database} onUpdate={onUpdate} />
      <div className="db-content">
        <Outlet />
      </div>
    </div>
  )
}

export default DatabaseLayout
