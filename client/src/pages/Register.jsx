import Form from 'react-bootstrap/Form'
import AuthContainer from '@/components/AuthContainer'
import { useState } from 'react'
import { api } from '@/utils/api'
import { useInputState } from '@/utils/hooks'
import ValidationError from '@/utils/ValidationError'

export default function Register() {
    const [email, setEmail] = useInputState('')
    const [password, setPassword] = useInputState('')
    const [repeatPassword, setRepeatPassword] = useInputState('')
    const [error, setError] = useState({ path: null, message: null })

    const handleRegister = async () => {
        if (password != repeatPassword) {
            throw new ValidationError('Passwords must match', 'repeatPassword')
        }

        const { data } = await api.post('/accounts/register', {
            email,
            password,
        })

        return data.session
    }

    return (
        <AuthContainer
            title="Register"
            onSubmit={handleRegister}
            onError={setError}
        >
            <Form.Group>
                <Form.Control
                    value={email}
                    onChange={setEmail}
                    className={error.path == 'email' && 'is-invalid'}
                    type="email"
                    placeholder="Email"
                />
                <Form.Text className="text-danger">
                    {error.path == 'email' && error.message}
                </Form.Text>
            </Form.Group>

            <Form.Group>
                <Form.Control
                    value={password}
                    onChange={setPassword}
                    className={error.path == 'password' && 'is-invalid'}
                    type="password"
                    placeholder="Password"
                />
                <Form.Text className="text-danger">
                    {error.path == 'password' && error.message}
                </Form.Text>
            </Form.Group>

            <Form.Group>
                <Form.Control
                    value={repeatPassword}
                    onChange={setRepeatPassword}
                    className={error.path == 'repeatPassword' && 'is-invalid'}
                    type="password"
                    placeholder="Repeat password"
                />
                <Form.Text className="text-danger">
                    {error.path == 'repeatPassword' && error.message}
                </Form.Text>
            </Form.Group>
        </AuthContainer>
    )
}
