import { useParams } from 'react-router-dom'
import RegistrationForm from '../../components/registration/RegistrationForm'

export default function CategoryRegistrationPage() {
  const { category } = useParams()

  return <RegistrationForm category={category} />
}
