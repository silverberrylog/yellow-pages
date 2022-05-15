import Form from 'react-bootstrap/Form'
import AuthContainer from '../components/AuthContainer'
import { useState } from 'react'
import { api } from '../utils/api'
import { useInputState } from '../utils/hooks'

export default function Login() {
    const [email, setEmail] = useInputState('')
    const [password, setPassword] = useInputState('')
    const [error, setError] = useState({ path: null, message: null })

    const handleLogin = async () => {
        const { data } = await api.post('/accounts/login', {
            email,
            password,
        })

        return data.session
    }

    return (
        <AuthContainer title="Login" onSubmit={handleLogin} onError={setError}>
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
        </AuthContainer>
    )
}
