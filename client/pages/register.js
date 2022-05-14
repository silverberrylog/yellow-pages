import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSession } from '../store/session'
import { api } from '../utils/api'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import LoadingButton from '../components/LoadingButton'
import { useRouter } from 'next/router'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [error, setError] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()
    const router = useRouter()

    const handleFormSubmit = async event => {
        event.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            if (password != repeatPassword) {
                throw new Error('Passwords must match')
            }

            const { data } = await api.post('/accounts/register', {
                email,
                password,
            })

            dispatch(setSession(data.session))
            router.push('/dashboard')
        } catch (err) {
            setError(err.message.replace('ValidationError: ', ''))
        }

        setIsLoading(false)
    }

    return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <Card className="w-50">
                <Card.Body>
                    <Card.Title className="mb-3">Register</Card.Title>
                    <Form onSubmit={handleFormSubmit}>
                        <div className="d-flex gap-2 mb-3">
                            <Form.Group>
                                <Form.Control
                                    value={email}
                                    onChange={event =>
                                        setEmail(event.target.value)
                                    }
                                    type="email"
                                    placeholder="Email"
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Control
                                    value={password}
                                    onChange={event =>
                                        setPassword(event.target.value)
                                    }
                                    type="password"
                                    placeholder="Password"
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Control
                                    value={repeatPassword}
                                    onChange={event =>
                                        setRepeatPassword(event.target.value)
                                    }
                                    type="password"
                                    placeholder="Repeat password"
                                />
                            </Form.Group>
                        </div>

                        <p className="text-danger">{error}</p>
                        <LoadingButton
                            isLoading={isLoading}
                            variant="primary"
                            type="submit"
                        >
                            Submit
                        </LoadingButton>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}
