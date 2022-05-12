import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'

export default function Register() {
    return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <Card className="w-50">
                <Card.Body>
                    <Card.Title>Register</Card.Title>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control type="text" placeholder="Name" />
                            {/* <Form.Text>Name</Form.Text> */}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control type="email" placeholder="Email" />
                            {/* <Form.Text>Email</Form.Text> */}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                            />
                            {/* <Form.Text>Password</Form.Text> */}
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}
