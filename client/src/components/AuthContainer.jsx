import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import LoadingButton from './LoadingButton'

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSession } from '@/store/session'
import PropTypes from 'prop-types'

export default function AuthContainer({ onSubmit, children, title, onError }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!location.state?.error) return

        setError(location.state.error)
        navigate(location.pathname, { replace: true, state: null })
    }, [])

    const handleSubmit = async event => {
        event.preventDefault()
        setIsLoading(true)
        onError({ field: null, message: null })
        setError(null)

        try {
            const session = await onSubmit()
            dispatch(setSession(session))
            navigate('/dashboard')
        } catch (err) {
            if (!err.path) setError(err.message)
            else onError(err)
        }

        setIsLoading(false)
    }

    return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <Card className="w-50">
                <Card.Body>
                    <Card.Title className="mb-3">{title}</Card.Title>
                    <Form
                        onSubmit={handleSubmit}
                        className="d-flex flex-column gap-3"
                    >
                        <div className="d-flex flex-column gap-2">
                            {children}
                        </div>

                        <p className="text-danger mb-0" hidden={!error}>
                            {error}
                        </p>

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

AuthContainer.propTypes = {
    title: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    onError: PropTypes.func.isRequired,
}
