import { Navigate, useParams } from 'react-router-dom'

/** Redirect old URL to single Speaking Task screen */
export default function ModelAnswer() {
  const { id } = useParams()
  return <Navigate to={`/speaking-task/${id}`} replace />
}
